// Load .env from the serverjs directory regardless of where the script is invoked from
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { pool } = require("../dbconnect.js");

/**
 * Migration: add_billing_acl
 *
 * What this does:
 *  1. Creates the BillingACL table with granular billing permission flags.
 *  2. Adds a billingaclid FK column to the Roles table.
 *  3. For every existing role that had billingmanageaccess = TRUE, creates a
 *     corresponding BillingACL row (hasBillingAccess = TRUE) and links it.
 *  4. Drops the now-redundant billingmanageaccess column from Roles.
 *
 * Run manually:
 *   node serverjs/db/migrations/add_billing_acl.js
 *
 * This script is idempotent — safe to re-run.
 */
async function addBillingACL() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting migration: add_billing_acl...\n");
    await client.query("BEGIN");

    // ─────────────────────────────────────────────────────────────
    // STEP 1 — Create BillingACL table
    // ─────────────────────────────────────────────────────────────
    console.log("Step 1: Creating BillingACL table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS BillingACL (
        billingaclid          SERIAL PRIMARY KEY,
        hasBillingAccess      BOOLEAN NOT NULL DEFAULT FALSE,
        canVerifyTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
        canAcceptTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
        canAddTransaction     BOOLEAN NOT NULL DEFAULT FALSE,
        canDeleteTransaction  BOOLEAN NOT NULL DEFAULT FALSE,
        created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("  ✅ BillingACL table ready.\n");

    // ─────────────────────────────────────────────────────────────
    // STEP 2 — Add billingaclid FK column to Roles (if not exists)
    // ─────────────────────────────────────────────────────────────
    console.log("Step 2: Adding billingaclid column to Roles...");
    await client.query(`
      ALTER TABLE Roles
        ADD COLUMN IF NOT EXISTS billingaclid INT
          REFERENCES BillingACL(billingaclid) ON DELETE SET NULL;
    `);
    console.log("  ✅ billingaclid column added to Roles.\n");

    // ─────────────────────────────────────────────────────────────
    // STEP 3 — Migrate existing roles that had billingmanageaccess = TRUE
    //          Only run if the old column still exists
    // ─────────────────────────────────────────────────────────────
    console.log("Step 3: Migrating existing billingmanageaccess data...");

    const { rows: colCheck } = await client.query(`
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'roles'
        AND column_name = 'billingmanageaccess'
      LIMIT 1;
    `);

    if (colCheck.length > 0) {
      // Fetch roles that had billingmanageaccess = TRUE and no ACL yet
      const { rows: rolesThatHadAccess } = await client.query(`
        SELECT roleid
        FROM Roles
        WHERE billingmanageaccess = TRUE
          AND billingaclid IS NULL;
      `);

      console.log(
        `  Found ${rolesThatHadAccess.length} role(s) with billingmanageaccess = TRUE — creating ACL records...`
      );

      for (const role of rolesThatHadAccess) {
        // Insert a BillingACL row with hasBillingAccess = TRUE
        const { rows: aclRows } = await client.query(`
          INSERT INTO BillingACL (hasBillingAccess)
          VALUES (TRUE)
          RETURNING billingaclid;
        `);
        const newAclId = aclRows[0].billingaclid;

        // Link it back to the role
        await client.query(
          `UPDATE Roles SET billingaclid = $1 WHERE roleid = $2`,
          [newAclId, role.roleid]
        );

        console.log(
          `    → Role ${role.roleid}: created BillingACL #${newAclId} and linked.`
        );
      }

      // ───────────────────────────────────────────────────────────
      // STEP 4 — Drop billingmanageaccess column from Roles
      // ───────────────────────────────────────────────────────────
      console.log("\nStep 4: Dropping billingmanageaccess column from Roles...");
      await client.query(`
        ALTER TABLE Roles DROP COLUMN IF EXISTS billingmanageaccess;
      `);
      console.log("  ✅ billingmanageaccess column removed from Roles.\n");
    } else {
      console.log(
        "  ⚠️  billingmanageaccess column not found — skipping data migration and column drop (already done).\n"
      );
    }

    await client.query("COMMIT");
    console.log("✅ Migration add_billing_acl completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed — rolled back.", error);
    process.exit(1);
  } finally {
    client.release();
  }
}

// Allow running manually: node serverjs/db/migrations/add_billing_acl.js
if (require.main === module) {
  addBillingACL();
}

module.exports = { addBillingACL };
