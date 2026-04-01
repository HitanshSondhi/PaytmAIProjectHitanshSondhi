import { query } from "./db";
import { getScoreCategory } from "./scoringEngine";

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
  const res = await query(
    `SELECT id, name, credit_score FROM customers
     WHERE merchant_id=$1 AND name % $2
     ORDER BY similarity(name,$2) DESC LIMIT 1`,
    [merchantId, name]
  );
  if (res.rows.length === 0) return null;
  return {
    id: res.rows[0].id,
    name: res.rows[0].name,
    creditScore: res.rows[0].credit_score,
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
     RETURNING id, due_date`,
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
  
  return { id: res.rows[0].id, dueDate: res.rows[0].due_date };
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

export async function clearAllCustomerDues(merchantId: number, customerId: number) {
  const res = await query(
    `UPDATE udhaar_ledger 
     SET status='PAID'
     WHERE merchant_id=$1 AND customer_id=$2 AND status='PENDING'
     RETURNING id, amount, due_date`,
    [merchantId, customerId]
  );
  const clearedCount = res.rowCount ?? 0;
  const totalCleared = res.rows.reduce((sum: number, row: { amount: string }) => sum + parseFloat(row.amount), 0);
  return { clearedCount, totalCleared, entries: res.rows };
}

export async function clearSingleDue(merchantId: number, customerId: number, dueDate: string) {
  const res = await query(
    `UPDATE udhaar_ledger 
     SET status='PAID'
     WHERE merchant_id=$1 AND customer_id=$2 AND due_date=$3 AND status='PENDING'
     RETURNING id, amount, due_date`,
    [merchantId, customerId, dueDate]
  );
  const clearedCount = res.rowCount ?? 0;
  const totalCleared = res.rows.reduce((sum: number, row: { amount: string }) => sum + parseFloat(row.amount), 0);
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
