const dotenv = require("dotenv");
const pkg = require("pg");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const { Pool } = pkg;

const connectionString = process.env.DB_URL;

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
