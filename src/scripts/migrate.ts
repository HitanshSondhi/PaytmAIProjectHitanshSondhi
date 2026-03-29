import "dotenv/config";
import { query } from "../db";

async function migrate() {
  console.log('[Migrate] Starting database migration...');

  try {
    // Enable required extensions
    await query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    console.log('[Migrate] pg_trgm extension enabled');

    await query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    console.log('[Migrate] pgcrypto extension enabled');

    // Create merchants table
    await query(`
      CREATE TABLE IF NOT EXISTS merchants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        business_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migrate] merchants table created');

    // Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone_encrypted BYTEA,
        credit_score INTEGER DEFAULT 100,
        whatsapp_consent BOOLEAN DEFAULT false,
        whatsapp_consent_at TIMESTAMP,
        last_activity_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migrate] customers table created');
    
    // Add last_activity_at column if it doesn't exist (for existing databases)
    await query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP
    `);
    console.log('[Migrate] last_activity_at column ensured');

    // Create index for fuzzy matching on customer name
    await query(`
      CREATE INDEX IF NOT EXISTS idx_customers_name_trgm
      ON customers USING gin (name gin_trgm_ops)
    `);
    console.log('[Migrate] customers name index created');

    // Create transactions table
    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migrate] transactions table created');

    // Create udhaar_ledger table
    await query(`
      CREATE TABLE IF NOT EXISTS udhaar_ledger (
        id SERIAL PRIMARY KEY,
        merchant_id INTEGER NOT NULL,
        customer_id INTEGER NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        reminder_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migrate] udhaar_ledger table created');

    // Create score_events table
    await query(`
      CREATE TABLE IF NOT EXISTS score_events (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        delta INTEGER NOT NULL,
        note TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Migrate] score_events table created');

    // Create indexes for better query performance
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_udhaar_merchant ON udhaar_ledger(merchant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_udhaar_customer ON udhaar_ledger(customer_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_udhaar_due_date ON udhaar_ledger(due_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_udhaar_status ON udhaar_ledger(status)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_score_events_customer ON score_events(customer_id)`);
    console.log('[Migrate] All indexes created');

    console.log('[Migrate] Migration completed successfully!');
  } catch (error) {
    console.error('[Migrate] Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
