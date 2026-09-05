const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DB_URL });

(async () => {
  try {
    const userRes = await pool.query("SELECT * FROM Users WHERE regno = $1", ['2020831001']);
    console.log('User found:', userRes.rows[0]?.fullname);

    const match = await bcrypt.compare('admin123', userRes.rows[0].password);
    console.log('Password verified:', match);

    const election = await pool.query("SELECT electionid FROM Elections WHERE election_status = $1 LIMIT 1", ['a0sc73wq']);
    console.log('Running election query success. Found count:', election.rows.length);

    console.log('✅ Login verification completely passed!');
    await pool.end();
  } catch (err) {
    console.error('❌ Error during login check:', err);
    await pool.end();
    process.exit(1);
  }
})();
