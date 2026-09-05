const { pool } = require("../dbconnect.js");

async function addPaymentAuditors() {
  try {
    console.log("Starting migration: add_payment_auditors...");

    await pool.query(`
      ALTER TABLE payment
        ADD COLUMN IF NOT EXISTS verified_by INT REFERENCES Users(userId) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS accepted_by INT REFERENCES Users(userId) ON DELETE SET NULL;
    `);

    console.log("✅ Migration successful: payment table updated with verified_by and accepted_by columns.");
  } catch (error) {
    console.error("❌ Migration failed (add_payment_auditors):", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addPaymentAuditors();
}

module.exports = { addPaymentAuditors };
