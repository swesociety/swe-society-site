const { pool } = require("../../db/dbconnect.js");

async function addActivityLogs() {
  try {
    await pool.query(`
      ALTER TABLE Roles ADD COLUMN IF NOT EXISTS activitylogaccess BOOLEAN DEFAULT FALSE;

      CREATE TABLE IF NOT EXISTS ActivityLogs (
          logid           SERIAL PRIMARY KEY,
          actor_userid    INT,
          actor_regno     VARCHAR(20),
          actor_role      VARCHAR(50),
          action          VARCHAR(100) NOT NULL,
          category        VARCHAR(50) NOT NULL,
          target_type     VARCHAR(50),
          target_id       VARCHAR(50),
          description     TEXT,
          metadata        JSONB,
          ip_address      VARCHAR(45),
          status          VARCHAR(10) DEFAULT 'success',
          created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (actor_userid) REFERENCES Users(userId) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_activitylogs_actor ON ActivityLogs(actor_userid);
      CREATE INDEX IF NOT EXISTS idx_activitylogs_category ON ActivityLogs(category);
      CREATE INDEX IF NOT EXISTS idx_activitylogs_created_at ON ActivityLogs(created_at DESC);
    `);
    console.log("Migration add_activity_logs: done");
  } catch (error) {
    console.error("Migration add_activity_logs failed:", error);
  }
}

module.exports = { addActivityLogs };
