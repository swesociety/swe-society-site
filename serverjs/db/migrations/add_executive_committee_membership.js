const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const { pool } = require("../dbconnect.js");

/**
 * Migration: add_executive_committee_membership
 *
 * Adds the standalone Executive Committee relationship to Committee members.
 * Existing election-linked rows are preserved and their electionid remains
 * optional for future records.
 *
 * Run manually:
 *   node serverjs/db/migrations/add_executive_committee_membership.js
 */
async function addExecutiveCommitteeMembership() {
  const client = await pool.connect();

  try {
    console.log("Starting migration: add_executive_committee_membership...");
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS ExecutiveCommittees (
        committeeid SERIAL PRIMARY KEY,
        committee_name VARCHAR(100) NOT NULL,
        year VARCHAR(6) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE Committee
        ADD COLUMN IF NOT EXISTS executive_committeeid INT;
    `);

    await client.query(`
      ALTER TABLE Committee
        ADD COLUMN IF NOT EXISTS service_start TIMESTAMP,
        ADD COLUMN IF NOT EXISTS service_end TIMESTAMP;
    `);

    const { rows: existingConstraint } = await client.query(`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'committee_executive_committee_fk'
      LIMIT 1;
    `);

    if (existingConstraint.length === 0) {
      await client.query(`
        ALTER TABLE Committee
          ADD CONSTRAINT committee_executive_committee_fk
          FOREIGN KEY (executive_committeeid)
          REFERENCES ExecutiveCommittees(committeeid)
          ON DELETE CASCADE;
      `);
    }

    const { rows: duplicateAssignments } = await client.query(`
      SELECT executive_committeeid, userid, COUNT(*) AS assignment_count
      FROM Committee
      WHERE executive_committeeid IS NOT NULL
      GROUP BY executive_committeeid, userid
      HAVING COUNT(*) > 1;
    `);

    if (duplicateAssignments.length > 0) {
      throw new Error(
        "Duplicate users were found inside an Executive Committee. Remove duplicate assignments before rerunning this migration.",
      );
    }

    const { rows: uniqueConstraint } = await client.query(`
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'committee_exec_user_unique'
      LIMIT 1;
    `);

    if (uniqueConstraint.length === 0) {
      await client.query(`
        ALTER TABLE Committee
          ADD CONSTRAINT committee_exec_user_unique
          UNIQUE (executive_committeeid, userid);
      `);
    }

    await client.query("COMMIT");
    console.log("Migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed and was rolled back:", error);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  addExecutiveCommitteeMembership();
}

module.exports = { addExecutiveCommitteeMembership };