const { pool } = require("../dbconnect.js");

async function addSocietyFeeTables() {
  try {
    console.log("Starting manual migration for society_fees table...");

    // 1. Create PostgreSQL Enum type for society fee status if not exists
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'society_fee_status_enum') THEN
          CREATE TYPE society_fee_status_enum AS ENUM ('Pending', 'Verified');
        END IF;
      END $$;
    `);

    // 2. Create society_fees table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS society_fees (
        society_fee_id SERIAL PRIMARY KEY,
        userid INT NOT NULL,
        semester_key VARCHAR(20) NOT NULL,
        amount INT NOT NULL,
        status society_fee_status_enum DEFAULT 'Pending',
        transaction_verified BOOLEAN DEFAULT FALSE,
        transaction_id VARCHAR(100),
        verified_by INT,
        accepted_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userid) REFERENCES Users(userId) ON DELETE CASCADE,
        FOREIGN KEY (verified_by) REFERENCES Users(userId) ON DELETE SET NULL,
        FOREIGN KEY (accepted_by) REFERENCES Users(userId) ON DELETE SET NULL,
        CONSTRAINT unique_user_sem UNIQUE (userid, semester_key)
      );
    `);

    // 3. Add columns to existing table if not present
    await pool.query(`
      ALTER TABLE society_fees 
      ADD COLUMN IF NOT EXISTS transaction_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100),
      ADD COLUMN IF NOT EXISTS verified_by INT REFERENCES Users(userId) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS accepted_by INT REFERENCES Users(userId) ON DELETE SET NULL;
    `);

    console.log("✅ Manual Migration Successful: society_fees table updated with verified_by and accepted_by columns.");
  } catch (error) {
    console.error("❌ Migration failed (add_society_fee_tables):", error);
  }
}

// Allow running manually via: node serverjs/db/migrations/add_society_fee_tables.js
if (require.main === module) {
  addSocietyFeeTables();
}

module.exports = { addSocietyFeeTables };
