const { pool } = require("../dbconnect.js");

async function addPaymentSocietyFeeSync() {
  try {
    await pool.query(`
      ALTER TABLE payment
        ADD COLUMN IF NOT EXISTS transaction_verified BOOLEAN DEFAULT FALSE;

      ALTER TABLE society_fees
        ADD COLUMN IF NOT EXISTS paymentid INT REFERENCES payment(paymentid) ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS payment_society_fee_lookup
        ON payment (userid, payment_typeid, payment_status);

      CREATE INDEX IF NOT EXISTS society_fees_payment_lookup
        ON society_fees (paymentid);
    `);
    console.log("Payment and society fee sync migration successful.");
  } catch (error) {
    console.error("Payment and society fee sync migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addPaymentSocietyFeeSync();
}

module.exports = { addPaymentSocietyFeeSync };
