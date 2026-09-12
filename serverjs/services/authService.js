const pool = require("../db/dbconnect.js").pool;

const findUserByRegno = async (regno) => {
  const { rows } = await pool.query("SELECT * FROM Users WHERE regno = $1", [regno]);
  return rows[0] || null;
};

const findRunningElection = async (electionRunningVal) => {
  const { rows } = await pool.query(
    "SELECT electionid FROM Elections WHERE election_status = $1 LIMIT 1",
    [electionRunningVal]
  );
  return rows[0] || null;
};

const getCandidateStatus = async (regno, electionid) => {
  const { rows } = await pool.query(
    `SELECT regexp_replace(status, '^.*_', '') AS last_status
     FROM ElectionCandidateTrack
     WHERE regno = $1 AND electionid = $2
     LIMIT 1`,
    [regno, electionid]
  );
  return rows[0]?.last_status || null;
};

const createUser = async ({ regno, session, email, hashedPassword, role, roleid }) => {
  const { rows } = await pool.query(
    "INSERT INTO Users (regno, session, email, password, role, roleid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [regno, session, email, hashedPassword, role, roleid]
  );
  return rows[0];
};

const createUserFull = async ({ regno, session, email, fullname, hashedPassword, roleid }) => {
  const { rows } = await pool.query(
    "INSERT INTO Users (regno, session, email, fullname, password, roleid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [regno, session, email, fullname, hashedPassword, roleid]
  );
  return rows[0];
};

const getDefaultRole = async () => {
  const { rows } = await pool.query(
    "SELECT roleid FROM Roles WHERE isDefaultRole = TRUE LIMIT 1"
  );
  return rows[0] || null;
};

const checkRegnoExists = async (regno) => {
  const { rows } = await pool.query("SELECT 1 FROM Users WHERE regno = $1", [regno]);
  return rows.length > 0;
};

const checkEmailExists = async (email) => {
  const { rows } = await pool.query("SELECT 1 FROM Users WHERE email = $1", [email]);
  return rows.length > 0;
};

const checkMembersAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT membersaccess FROM Roles
     JOIN Users ON Roles.roleid = Users.roleid
     WHERE Users.userid = $1`,
    [userid]
  );
  return rows.length > 0 && rows[0].membersaccess;
};

const getUserByUserid = async (userid) => {
  const { rows } = await pool.query("SELECT regno, email FROM Users WHERE userid = $1", [userid]);
  return rows[0] || null;
};

const updateUserPassword = async (userid, hashedPassword) => {
  await pool.query(
    "UPDATE Users SET password = $1 WHERE userid = $2 RETURNING *",
    [hashedPassword, userid]
  );
};

const getUserByRegnoForOTP = async (regno) => {
  const { rows } = await pool.query("SELECT email FROM Users WHERE regno = $1", [regno]);
  return rows[0] || null;
};

const findOTP = async (regno) => {
  const { rows } = await pool.query("SELECT id FROM OTPVerification WHERE regno = $1", [regno]);
  return rows[0] || null;
};

const upsertOTP = async (regno, otp, expiresAt) => {
  const existing = await findOTP(regno);
  if (existing) {
    await pool.query(
      "UPDATE OTPVerification SET otp = $1, expires_at = $2 WHERE regno = $3",
      [otp, expiresAt, regno]
    );
  } else {
    await pool.query(
      "INSERT INTO OTPVerification (regno, otp, expires_at) VALUES ($1, $2, $3)",
      [regno, otp, expiresAt]
    );
  }
};

const verifyOTP = async (regno, otp) => {
  const { rows } = await pool.query(
    "SELECT expires_at FROM OTPVerification WHERE regno = $1 AND otp = $2",
    [regno, otp]
  );
  return rows[0] || null;
};

const deleteOTP = async (regno) => {
  await pool.query("DELETE FROM OTPVerification WHERE regno = $1", [regno]);
};

const getUserForPasswordReset = async (regno) => {
  const { rows } = await pool.query("SELECT userid, email FROM Users WHERE regno = $1", [regno]);
  return rows[0] || null;
};

const updatePasswordByUserid = async (userid, hashedPassword) => {
  await pool.query("UPDATE Users SET password = $1 WHERE userid = $2", [hashedPassword, userid]);
};

const getUsersByRange = async (fromuserid, touserid) => {
  const { rows } = await pool.query(
    `SELECT userid, email, regno, password
     FROM Users
     WHERE userid BETWEEN $1 AND $2
     ORDER BY userid`,
    [fromuserid, touserid]
  );
  return rows;
};

const getUserByRegno = async (regno) => {
  const { rows } = await pool.query(
    `SELECT userid, email, regno, password
     FROM Users WHERE regno = $1 LIMIT 1`,
    [regno]
  );
  return rows[0] || null;
};

const updateUserEmail = async (regno, newEmail) => {
  await pool.query("UPDATE Users SET email = $1 WHERE regno = $2", [newEmail, regno]);
};

const updateUserPasswordByRegno = async (regno, hashedPassword) => {
  await pool.query("UPDATE Users SET password = $1 WHERE regno = $2", [hashedPassword, regno]);
};

const getUsersByEmails = async (emails) => {
  const placeholders = emails.map((_, idx) => `$${idx + 1}`).join(", ");
  const { rows } = await pool.query(
    `SELECT email, fullname, regno, password FROM Users WHERE email IN (${placeholders})`,
    emails
  );
  return rows;
};

const createSignupUser = async ({ regno, fullname, email, hashedPassword, session, defaultRoleId }) => {
  const { rows } = await pool.query(
    `INSERT INTO Users (regno, fullname, email, password, session, roleid)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING userid, regno, fullname, email, session, roleid`,
    [regno, fullname, email, hashedPassword, session, defaultRoleId]
  );
  return rows[0];
};

module.exports = {
  findUserByRegno,
  findRunningElection,
  getCandidateStatus,
  createUser,
  createUserFull,
  getDefaultRole,
  checkRegnoExists,
  checkEmailExists,
  checkMembersAccess,
  getUserByUserid,
  updateUserPassword,
  getUserByRegnoForOTP,
  upsertOTP,
  verifyOTP,
  deleteOTP,
  getUserForPasswordReset,
  updatePasswordByUserid,
  getUsersByRange,
  getUserByRegno,
  updateUserEmail,
  updateUserPasswordByRegno,
  getUsersByEmails,
  createSignupUser,
};
