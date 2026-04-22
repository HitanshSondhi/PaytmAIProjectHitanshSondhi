import pool, { query } from "./db";
import { getScoreCategory, getScoreDelta } from "./scoringEngine";

// Format date to IST (Indian Standard Time) - date only
function formatDateIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
}

// Format timestamp to IST with time
function formatDateTimeIST(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

function normalizeSearchName(value: string): string {
  const honorifics = [
    'ji', 'jee', 'sir', 'madam', 'mr', 'mrs', 'ms', 'shri', 'smt',
    'bhai', 'bhaiya', 'didi', 'uncle', 'aunty',
  ];
  const fillers = [
    'ka', 'ke', 'ki', 'ko', 'se', 'mein', 'me', 'pe', 'par',
    'wala', 'wali', 'wale', 'waala', 'waali', 'waale',
    'customer', 'naam', 'account', 'khata', 'hisab', 'due', 'udhaar', 'udhar',
    'payment', 'collection', 'score', 'credit', 'pending', 'overdue', 'clear',
  ];
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(new RegExp(`\\b(${honorifics.join('|')})\\b`, 'gi'), ' ')
    .replace(new RegExp(`\\b(${fillers.join('|')})\\b`, 'gi'), ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsDevanagari(value: string): boolean {
  return /[\u0900-\u097f]/.test(value);
}

function transliterateDevanagariToLatin(value: string): string {
  const map: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
    'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
    'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
    'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
    'ं': 'n', 'ँ': 'n', 'ः': 'h',
    'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u',
    'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
    'ृ': 'ri', 'ॅ': 'e', 'ॉ': 'o', '्': '',
  };
  return normalizeSearchName(
    value.split('').map((ch) => map[ch] ?? ch).join('')
  );
}

export async function getTodayCollection(merchantId: number) {
  const res = await query(
    `SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS txn_count
     FROM transactions
     WHERE merchant_id=$1 AND created_at::date=CURRENT_DATE`,
    [merchantId]
  );
  return {
    total: parseFloat(res.rows[0].total),
    txnCount: parseInt(res.rows[0].txn_count),
  };
}

export async function getWeekCollection(merchantId: number) {
  const res = await query(
    `SELECT created_at::date AS date, COALESCE(SUM(amount),0) AS total
     FROM transactions WHERE merchant_id=$1
     AND created_at >= NOW()-INTERVAL '7 days'
     GROUP BY created_at::date ORDER BY date ASC`,
    [merchantId]
  );
  return { days: res.rows.map(r => ({
    date: r.date, total: parseFloat(r.total)
  }))};
}

export async function fuzzyMatchCustomer(merchantId: number, name: string) {
  const normalized = normalizeSearchName(name);
  if (!normalized) return null;
  const candidates = new Set<string>();
  candidates.add(normalized);
  if (containsDevanagari(name)) {
    const transliterated = transliterateDevanagariToLatin(name);
    if (transliterated) candidates.add(transliterated);
  }
  const searchNames = Array.from(candidates).filter(Boolean);
  const simExpr = searchNames.map((_, i) => `similarity(name, $${i + 2})`).join(', ');
  const simSelect = searchNames.length > 1 ? `GREATEST(${simExpr})` : simExpr;
  const res = await query(
    `SELECT id, name, credit_score, ${simSelect} AS sim
     FROM customers
     WHERE merchant_id=$1
     ORDER BY sim DESC
     LIMIT 5`,
    [merchantId, ...searchNames]
  );
  if (res.rows.length > 0 && res.rows[0].sim >= 0.15) {
    return {
      id: res.rows[0].id,
      name: res.rows[0].name,
      creditScore: res.rows[0].credit_score,
    };
  }

  const tokens = normalized.split(' ').filter((t) => t.length > 1);
  if (tokens.length === 0) return null;
  const tokenParams = tokens.map((t) => `%${t}%`);
  const tokenWhere = tokens.map((_, i) => `name ILIKE $${i + 2}`).join(' OR ');
  const tokenRes = await query(
    `SELECT id, name, credit_score
     FROM customers
     WHERE merchant_id=$1 AND (${tokenWhere})
     LIMIT 5`,
    [merchantId, ...tokenParams]
  );
  if (tokenRes.rows.length === 0) return null;
  return {
    id: tokenRes.rows[0].id,
    name: tokenRes.rows[0].name,
    creditScore: tokenRes.rows[0].credit_score,
  };
}

export async function getCustomerPayments(
  merchantId: number, customerId: number, date: string
) {
  const res = await query(
    `SELECT amount, payment_method, created_at FROM transactions
     WHERE merchant_id=$1 AND customer_id=$2
     AND created_at::date=$3::date ORDER BY created_at DESC`,
    [merchantId, customerId, date]
  );
  return res.rows.map(r => ({
    amount: parseFloat(r.amount),
    method: r.payment_method,
    createdAt: r.created_at,
  }));
}

export async function getDueList(merchantId: number, date: string) {
  const res = await query(
    `SELECT c.name AS customer_name, u.amount, u.id AS udhaar_id
     FROM udhaar_ledger u JOIN customers c ON c.id=u.customer_id
     WHERE u.merchant_id=$1 AND u.due_date=$2::date AND u.status='PENDING'
     ORDER BY u.amount DESC`,
    [merchantId, date]
  );
  return res.rows.map(r => ({
    customerName: r.customer_name,
    amount: parseFloat(r.amount),
    udhaarId: r.udhaar_id,
  }));
}

export async function getCustomerTotalDue(merchantId: number, customerId: number) {
  const res = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total_due, COUNT(*) AS pending_count
     FROM udhaar_ledger
     WHERE merchant_id=$1 AND customer_id=$2 AND status='PENDING'`,
    [merchantId, customerId]
  );
  return {
    totalDue: parseFloat(res.rows[0].total_due),
    pendingCount: parseInt(res.rows[0].pending_count),
  };
}

export async function getTotalPendingUdhaar(merchantId: number) {
  const res = await query(
    `SELECT COALESCE(SUM(amount), 0) AS total_pending, COUNT(*) AS pending_count
     FROM udhaar_ledger
     WHERE merchant_id=$1 AND status='PENDING'`,
    [merchantId]
  );
  return {
    totalPending: parseFloat(res.rows[0].total_pending),
    pendingCount: parseInt(res.rows[0].pending_count),
  };
}

export async function getAllUdhaar(merchantId: number) {
  const res = await query(
    `SELECT u.id, u.amount, u.due_date, u.status, u.reminder_sent_at,
     c.name AS customer_name, c.credit_score, c.whatsapp_consent, c.id AS customer_id
     FROM udhaar_ledger u JOIN customers c ON c.id=u.customer_id
     WHERE u.merchant_id=$1 AND u.status != 'PAID'
     ORDER BY u.due_date ASC`,
    [merchantId]
  );
  return res.rows;
}

export async function addUdhaar(
  merchantId: number, customerId: number,
  amount: number, dueDays: number
) {
  const res = await query(
    `INSERT INTO udhaar_ledger(merchant_id,customer_id,amount,due_date)
     VALUES($1,$2,$3,(NOW() AT TIME ZONE 'Asia/Kolkata')::date + $4 * INTERVAL '1 day')
     RETURNING id, due_date, created_at`,
    [merchantId, customerId, amount, dueDays]
  );
  
  // Update customer's last activity timestamp (ignore if column doesn't exist)
  try {
    await query(
      `UPDATE customers SET last_activity_at = NOW() WHERE id = $1`,
      [customerId]
    );
  } catch (e) {
    // Column might not exist yet, ignore
  }
  
  return { 
    id: res.rows[0].id, 
    dueDate: formatDateIST(res.rows[0].due_date),
    createdAt: formatDateTimeIST(res.rows[0].created_at)
  };
}

export async function getCustomerScore(customerId: number) {
  const scoreRes = await query(
    `SELECT credit_score FROM customers WHERE id=$1`,
    [customerId]
  );
  const eventsRes = await query(
    `SELECT event_type, delta, note, created_at
     FROM score_events WHERE customer_id=$1
     ORDER BY created_at DESC LIMIT 5`,
    [customerId]
  );
  const score = scoreRes.rows[0]?.credit_score ?? 100;
  return {
    score,
    category: getScoreCategory(score),
    events: eventsRes.rows,
  };
}

export async function addScoreEvent(
  customerId: number, eventType: string,
  delta: number, note: string
) {
  await query(
    `INSERT INTO score_events(customer_id,event_type,delta,note)
     VALUES($1,$2,$3,$4)`,
    [customerId, eventType, delta, note]
  );
  await query(
    `UPDATE customers SET credit_score=GREATEST(0,LEAST(100,credit_score+$1))
     WHERE id=$2`,
    [delta, customerId]
  );
}

export interface OverduePenaltyCandidate {
  customerId: number;
  maxOverdueDays: number;
}

export async function getOverduePenaltyCandidates(merchantId: number): Promise<OverduePenaltyCandidate[]> {
  const res = await query(
    `SELECT customer_id, MAX(CURRENT_DATE - due_date) AS max_overdue_days
     FROM udhaar_ledger
     WHERE merchant_id=$1
     AND status='PENDING'
     AND due_date < CURRENT_DATE
     GROUP BY customer_id`,
    [merchantId]
  );

  return res.rows.map((row) => ({
    customerId: row.customer_id,
    maxOverdueDays: parseInt(row.max_overdue_days),
  }));
}

export async function hasScoreEventForTagToday(
  customerId: number,
  tag: string
): Promise<boolean> {
  const res = await query(
    `SELECT 1
     FROM score_events
     WHERE customer_id=$1
     AND note LIKE $2
     AND created_at::date = CURRENT_DATE
     LIMIT 1`,
    [customerId, `${tag}%`]
  );
  return res.rows.length > 0;
}

export async function getAllCustomers(merchantId: number, sortBy: string = 'name') {
  let orderClause = 'ORDER BY name ASC';
  let selectFields = 'id, name, credit_score, whatsapp_consent, created_at';
  
  switch (sortBy) {
    case 'recent':
      orderClause = 'ORDER BY created_at DESC';
      break;
    case 'credit_score':
      orderClause = 'ORDER BY credit_score ASC'; // Lowest first for risk visibility
      break;
    case 'activity':
      // Try to use last_activity_at, fallback to created_at if column doesn't exist
      try {
        const checkCol = await query(
          `SELECT column_name FROM information_schema.columns 
           WHERE table_name='customers' AND column_name='last_activity_at'`
        );
        if (checkCol.rows.length > 0) {
          selectFields = 'id, name, credit_score, whatsapp_consent, created_at, last_activity_at';
          orderClause = 'ORDER BY last_activity_at DESC NULLS LAST, created_at DESC';
        } else {
          orderClause = 'ORDER BY created_at DESC';
        }
      } catch {
        orderClause = 'ORDER BY created_at DESC';
      }
      break;
    default:
      orderClause = 'ORDER BY name ASC';
  }
  
  const res = await query(
    `SELECT ${selectFields}
     FROM customers WHERE merchant_id=$1 ${orderClause}`,
    [merchantId]
  );
  return res.rows;
}

export async function getCustomerById(customerId: number) {
  const res = await query(
    `SELECT id, name, credit_score, whatsapp_consent
     FROM customers WHERE id=$1`,
    [customerId]
  );
  return res.rows[0] || null;
}

export async function addCustomer(
  merchantId: number, name: string, phone: string
) {
  const res = await query(
    `INSERT INTO customers (merchant_id, name, phone_encrypted, credit_score, whatsapp_consent)
     VALUES ($1, $2, pgp_sym_encrypt($3, $4), 100, false)
     RETURNING id, name, credit_score, whatsapp_consent`,
    [merchantId, name, phone, process.env.DB_ENCRYPTION_KEY]
  );
  return res.rows[0];
}

export async function addTransaction(
  merchantId: number, customerId: number,
  amount: number, method: string
) {
  const txnRes = await query(
    `INSERT INTO transactions(merchant_id,customer_id,amount,payment_method)
     VALUES($1,$2,$3,$4) RETURNING id, created_at`,
    [merchantId, customerId, amount, method]
  );
  
  // Update customer's last activity timestamp (ignore if column doesn't exist)
  try {
    await query(
      `UPDATE customers SET last_activity_at = NOW() WHERE id = $1`,
      [customerId]
    );
  } catch (e) {
    // Column might not exist yet, ignore
  }
  
  const pendingRes = await query(
    `SELECT id, amount, due_date FROM udhaar_ledger
     WHERE customer_id=$1 AND merchant_id=$2 AND status='PENDING'
     ORDER BY due_date ASC LIMIT 1`,
    [customerId, merchantId]
  );
  const pending = pendingRes.rows[0] ?? null;
  return {
    id: txnRes.rows[0].id,
    createdAt: txnRes.rows[0].created_at,
    hasPendingUdhaar: !!pending,
    pendingUdhaarId: pending?.id ?? null,
    pendingAmount: pending ? parseFloat(pending.amount) : null,
    pendingDueDate: pending?.due_date ?? null,
  };
}

export async function markUdhaarPaid(udhaarId: number, merchantId: number) {
  const res = await query(
    `UPDATE udhaar_ledger SET status='PAID'
     WHERE id=$1 AND merchant_id=$2
     RETURNING customer_id, amount, due_date`,
    [udhaarId, merchantId]
  );
  return res.rows[0] ?? null;
}

export async function markReminderSent(udhaarId: number) {
  await query(
    `UPDATE udhaar_ledger SET reminder_sent_at=NOW() WHERE id=$1`,
    [udhaarId]
  );
}

export async function updateWhatsappConsent(
  customerId: number, consent: boolean
) {
  await query(
    `UPDATE customers SET whatsapp_consent=$1,
     whatsapp_consent_at=CASE WHEN $1 THEN NOW() ELSE NULL END
     WHERE id=$2`,
    [consent, customerId]
  );
}

export async function deleteCustomer(merchantId: number, customerId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const customerRes = await client.query(
      `SELECT id, name FROM customers WHERE id=$1 AND merchant_id=$2`,
      [customerId, merchantId]
    );
    if (customerRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query(
      `DELETE FROM score_events WHERE customer_id=$1`,
      [customerId]
    );
    await client.query(
      `DELETE FROM udhaar_ledger WHERE customer_id=$1 AND merchant_id=$2`,
      [customerId, merchantId]
    );
    await client.query(
      `DELETE FROM transactions WHERE customer_id=$1 AND merchant_id=$2`,
      [customerId, merchantId]
    );
    await client.query(
      `DELETE FROM customers WHERE id=$1 AND merchant_id=$2`,
      [customerId, merchantId]
    );

    await client.query('COMMIT');
    return { id: customerRes.rows[0].id, name: customerRes.rows[0].name };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function getDecryptedPhone(customerId: number): Promise<string | null> {
  const res = await query(
    `SELECT pgp_sym_decrypt(phone_encrypted,$2) AS phone
     FROM customers WHERE id=$1`,
    [customerId, process.env.DB_ENCRYPTION_KEY]
  );
  return res.rows[0]?.phone ?? null;
}

export async function getDashboardStats(merchantId: number) {
  // Use separate queries to avoid FULL OUTER JOIN multiplication issue
  const txnRes = await query(
    `SELECT 
       COALESCE(SUM(amount),0) AS today_collection,
       COUNT(*) AS today_txn_count
     FROM transactions
     WHERE merchant_id=$1 AND created_at::date=CURRENT_DATE`,
    [merchantId]
  );
  
  const udhaarRes = await query(
    `SELECT
       COUNT(CASE WHEN status='PENDING' THEN 1 END) AS pending_count,
       COALESCE(SUM(CASE WHEN status='PENDING' THEN amount END),0) AS pending_total,
       COUNT(CASE WHEN status='OVERDUE' OR (status='PENDING' AND due_date < CURRENT_DATE) THEN 1 END) AS overdue_count,
       COALESCE(SUM(CASE WHEN status='OVERDUE' OR (status='PENDING' AND due_date < CURRENT_DATE) THEN amount END),0) AS overdue_total
     FROM udhaar_ledger
     WHERE merchant_id=$1`,
    [merchantId]
  );
  
  const t = txnRes.rows[0];
  const u = udhaarRes.rows[0];
  
  return {
    todayCollection: parseFloat(t.today_collection),
    todayTxnCount: parseInt(t.today_txn_count),
    pendingCount: parseInt(u.pending_count),
    pendingTotal: parseFloat(u.pending_total),
    overdueCount: parseInt(u.overdue_count),
    overdueTotal: parseFloat(u.overdue_total),
  };
}

export async function getPendingReminders(merchantId: number) {
  const res = await query(
    `SELECT u.id, u.amount, u.due_date, c.id AS customer_id,
     c.name, c.whatsapp_consent,
     (CURRENT_DATE - u.due_date) AS days_overdue
     FROM udhaar_ledger u JOIN customers c ON c.id=u.customer_id
     WHERE u.merchant_id=$1
     AND (u.due_date = CURRENT_DATE OR u.due_date < CURRENT_DATE)
     AND u.status='PENDING'
     AND u.reminder_sent_at IS NULL
     AND c.whatsapp_consent=true`,
    [merchantId]
  );
  return res.rows;
}

export async function clearAllCustomerDues(
  merchantId: number,
  customerId: number,
  overdueOnly: boolean = false
) {
  const overdueFilter = overdueOnly ? 'AND due_date < CURRENT_DATE' : '';
  const res = await query(
    `UPDATE udhaar_ledger 
     SET status='PAID'
     WHERE merchant_id=$1 AND customer_id=$2 AND status IN ('PENDING','OVERDUE')
     ${overdueFilter}
     RETURNING id, amount, due_date`,
    [merchantId, customerId]
  );
  const clearedCount = res.rowCount ?? 0;
  const totalCleared = res.rows.reduce((sum: number, row: { amount: string }) => sum + parseFloat(row.amount), 0);
  
  // Record score events for each cleared due
  if (clearedCount > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const row of res.rows) {
      const dueDate = new Date(row.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      let eventType: string;
      if (today < dueDate) {
        eventType = 'PAID_EARLY';
      } else if (today.getTime() === dueDate.getTime()) {
        eventType = 'PAID_ONTIME';
      } else {
        const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
        if (daysLate <= 3) eventType = 'PAID_LATE_1_3';
        else if (daysLate <= 7) eventType = 'PAID_LATE_4_7';
        else eventType = 'PAID_LATE_7_PLUS';
      }
      
      const delta = getScoreDelta(eventType);
      await addScoreEvent(customerId, eventType, delta, `Cleared ₹${row.amount} due on ${row.due_date}`);
    }
  }
  
  return { clearedCount, totalCleared, entries: res.rows };
}

export async function clearSingleDue(
  merchantId: number,
  customerId: number,
  dueDate: string,
  overdueOnly: boolean = false
) {
  const overdueFilter = overdueOnly ? 'AND due_date < CURRENT_DATE' : '';
  const res = await query(
    `UPDATE udhaar_ledger 
     SET status='PAID'
     WHERE merchant_id=$1 AND customer_id=$2 AND due_date=$3 AND status IN ('PENDING','OVERDUE')
     ${overdueFilter}
     RETURNING id, amount, due_date`,
    [merchantId, customerId, dueDate]
  );
  const clearedCount = res.rowCount ?? 0;
  const totalCleared = res.rows.reduce((sum: number, row: { amount: string }) => sum + parseFloat(row.amount), 0);
  
  // Record score event for cleared due
  if (clearedCount > 0 && res.rows[0]) {
    const row = res.rows[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(row.due_date);
    dueDateObj.setHours(0, 0, 0, 0);
    
    let eventType: string;
    if (today < dueDateObj) {
      eventType = 'PAID_EARLY';
    } else if (today.getTime() === dueDateObj.getTime()) {
      eventType = 'PAID_ONTIME';
    } else {
      const daysLate = Math.floor((today.getTime() - dueDateObj.getTime()) / 86400000);
      if (daysLate <= 3) eventType = 'PAID_LATE_1_3';
      else if (daysLate <= 7) eventType = 'PAID_LATE_4_7';
      else eventType = 'PAID_LATE_7_PLUS';
    }
    
    const delta = getScoreDelta(eventType);
    await addScoreEvent(customerId, eventType, delta, `Cleared ₹${row.amount} due on ${row.due_date}`);
  }
  
  return { clearedCount, totalCleared, entry: res.rows[0] ?? null };
}

export async function getCustomerDuesByDate(merchantId: number, customerId: number) {
  const res = await query(
    `SELECT id, amount, due_date, status 
     FROM udhaar_ledger 
     WHERE merchant_id=$1 AND customer_id=$2 AND status='PENDING'
     ORDER BY due_date ASC`,
    [merchantId, customerId]
  );
  return res.rows;
}
