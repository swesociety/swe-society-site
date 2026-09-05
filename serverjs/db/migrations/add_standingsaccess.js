const { pool } = require("../dbconnect.js");

async function addStandingsAccess() {
  try {
    await pool.query(`
      ALTER TABLE Roles
      ADD COLUMN IF NOT EXISTS standingsaccess BOOLEAN DEFAULT FALSE;
    `);
    console.log("Migration: standingsaccess column ensured on Roles table.");
  } catch (error) {
    console.error("Migration failed (add_standingsaccess):", error);
  }
}

module.exports = { addStandingsAccess };
