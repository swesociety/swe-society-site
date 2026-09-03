const dotenv = require("dotenv");
const pkg = require("pg");

dotenv.config();

const { Pool } = pkg;

const connectionString =
  "postgresql://postgres.oszveqopythlwzqzykjt:gvzw4IifIpiT8Lvk@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"; //process.env.DB_URL;

const pool = new Pool({
  connectionString: connectionString
});

async function testDatabaseConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function connectToDB() {
  try {
    await pool.connect();
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.error("Error connecting to PostgreSQL database:", error);
  }
}

// Use module.exports to export functions and pool
module.exports = {
  testDatabaseConnection,
  connectToDB,
  pool
};
