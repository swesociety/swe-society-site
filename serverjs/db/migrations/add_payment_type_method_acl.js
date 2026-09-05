const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { pool } = require("../dbconnect.js");

async function addPaymentTypeMethodACL() {
  const client = await pool.connect();

  try {
    console.log("Starting migration: add_payment_type_method_acl...");
    await client.query("BEGIN");

    await client.query(`
      ALTER TABLE BillingACL
        ADD COLUMN IF NOT EXISTS canViewPaymentMethod BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS canEditPaymentMethod BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS canDeletePaymentMethod BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS canViewPaymentType BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS canEditPaymentType BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS canDeletePaymentType BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    await client.query(`
      UPDATE BillingACL
      SET canViewPaymentMethod = TRUE,
          canViewPaymentType = TRUE
      WHERE hasBillingAccess = TRUE
        AND canViewPaymentMethod = FALSE
        AND canViewPaymentType = FALSE;
    `);

    await client.query("COMMIT");
    console.log("Migration add_payment_type_method_acl completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed - rolled back.", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) addPaymentTypeMethodACL();

module.exports = { addPaymentTypeMethodACL };