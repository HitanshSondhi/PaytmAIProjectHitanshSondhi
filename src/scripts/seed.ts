import "dotenv/config";
import { query } from "../db";

async function seed() {
  console.log('[Seed] Starting database seeding...');

  try {
    // Clear existing data (in reverse order of dependencies)
    await query(`DELETE FROM score_events`);
    await query(`DELETE FROM transactions`);
    await query(`DELETE FROM udhaar_ledger`);
    await query(`DELETE FROM customers`);
    await query(`DELETE FROM merchants`);
    console.log('[Seed] Cleared existing data');

    // Insert merchant (id=1)
    await query(`
      INSERT INTO merchants (id, name, business_name)
      VALUES (1, 'Sharma', 'Sharma Kirana Store')
    `);
    console.log('[Seed] Merchant created');

    // Insert customers with encrypted phone numbers
    const encryptionKey = process.env.DB_ENCRYPTION_KEY!;

    const customers = [
      { name: 'Ramesh Kumar', phone: '+919876543210', score: 85 },
      { name: 'Suresh Patel', phone: '+919876543211', score: 72 },
      { name: 'Mahesh Singh', phone: '+919876543212', score: 55 },
      { name: 'Ganesh Sharma', phone: '+919876543213', score: 90 },
      { name: 'Dinesh Verma', phone: '+919876543214', score: 45 },
    ];

    for (const customer of customers) {
      await query(
        `INSERT INTO customers (merchant_id, name, phone_encrypted, credit_score, whatsapp_consent)
         VALUES (1, $1, pgp_sym_encrypt($2, $3), $4, true)`,
        [customer.name, customer.phone, encryptionKey, customer.score]
      );
    }
    console.log('[Seed] Customers created');

    // Get customer IDs
    const customerRes = await query(`SELECT id, name FROM customers WHERE merchant_id = 1`);
    const customerMap: Record<string, number> = {};
    customerRes.rows.forEach((row: { id: number; name: string }) => {
      customerMap[row.name] = row.id;
    });

    // Insert transactions (to get ₹6,850 total for today)
    const transactions = [
      { customerId: customerMap['Ramesh Kumar'], amount: 2500, method: 'upi' },
      { customerId: customerMap['Suresh Patel'], amount: 1500, method: 'cash' },
      { customerId: customerMap['Ganesh Sharma'], amount: 1850, method: 'upi' },
      { customerId: customerMap['Dinesh Verma'], amount: 1000, method: 'card' },
    ];

    for (const txn of transactions) {
      await query(
        `INSERT INTO transactions (merchant_id, customer_id, amount, payment_method, created_at)
         VALUES (1, $1, $2, $3, NOW())`,
        [txn.customerId, txn.amount, txn.method]
      );
    }
    console.log('[Seed] Transactions created (Total: ₹6,850)');

    // Insert udhaar entries
    const udhaarEntries = [
      { customerId: customerMap['Mahesh Singh'], amount: 500, dueDays: 0 }, // Due today
      { customerId: customerMap['Dinesh Verma'], amount: 800, dueDays: 1 }, // Due tomorrow
      { customerId: customerMap['Suresh Patel'], amount: 1200, dueDays: -2 }, // Overdue
    ];

    for (const entry of udhaarEntries) {
      await query(
        `INSERT INTO udhaar_ledger (merchant_id, customer_id, amount, due_date, status)
         VALUES (1, $1, $2, CURRENT_DATE + $3 * INTERVAL '1 day', 'PENDING')`,
        [entry.customerId, entry.amount, entry.dueDays]
      );
    }
    console.log('[Seed] Udhaar entries created');

    // Insert some score events
    const scoreEvents = [
      { customerId: customerMap['Ramesh Kumar'], eventType: 'PAID_ONTIME', delta: 2, note: 'Timely payment' },
      { customerId: customerMap['Mahesh Singh'], eventType: 'LATE_4_7', delta: -10, note: '5 days late payment' },
      { customerId: customerMap['Dinesh Verma'], eventType: 'LATE_7_PLUS', delta: -20, note: '10 days late payment' },
      { customerId: customerMap['Ganesh Sharma'], eventType: 'PAID_EARLY', delta: 5, note: 'Paid 2 days early' },
    ];

    for (const event of scoreEvents) {
      await query(
        `INSERT INTO score_events (customer_id, event_type, delta, note)
         VALUES ($1, $2, $3, $4)`,
        [event.customerId, event.eventType, event.delta, event.note]
      );
    }
    console.log('[Seed] Score events created');

    console.log('[Seed] Database seeding completed successfully!');
    console.log('[Seed] Summary:');
    console.log('  - 1 Merchant (Sharma Kirana Store)');
    console.log('  - 5 Customers');
    console.log('  - 4 Transactions (Total: ₹6,850)');
    console.log('  - 3 Udhaar entries');
    console.log('  - 4 Score events');
  } catch (error) {
    console.error('[Seed] Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
