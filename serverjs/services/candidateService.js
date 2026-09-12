const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const findExistingCandidate = async (electionid, userId) => {
  const { rows } = await pool.query(
    `SELECT * FROM candidate WHERE electionid = $1 AND userId = $2`,
    [electionid, userId]
  );
  return rows;
};

const getElectionStatus = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT * FROM elections WHERE electionid = $1`,
    [electionid]
  );
  return rows[0] || null;
};

const insertCandidate = async ({ electionid, userId, marka_name, slogan, logo_url, committeepostid, request_approval_status }) => {
  const { rows } = await pool.query(
    `INSERT INTO candidate (electionid, userId, marka_name, slogan, logo_url, committeepostid, request_approval_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [electionid, userId, marka_name, slogan, logo_url, committeepostid, request_approval_status]
  );
  return rows[0];
};

const deleteCandidateById = async (candidate_id) => {
  const { rowCount } = await pool.query(
    `DELETE FROM candidate WHERE candidate_id = $1`,
    [candidate_id]
  );
  if (rowCount === 0) throw new CustomError("Candidate not found", 404);
};

const updateCandidateById = async (candidate_id, fields) => {
  const keys = Object.keys(fields);
  const values = Object.values(fields);
  if (keys.length === 0) throw new CustomError("No fields provided for update", 400);
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const { rows } = await pool.query(
    `UPDATE candidate SET ${setClause} WHERE candidate_id = $${keys.length + 1} RETURNING *`,
    [...values, candidate_id]
  );
  if (rows.length === 0) throw new CustomError("Candidate not found", 404);
  return rows[0];
};

const getCandidatesByElectionId = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.fullname, u.profile_picture, u.session, cp.post_name
     FROM candidate c
     JOIN Users u ON c.userId = u.userId
     JOIN Committeeposts cp ON c.committeepostid = cp.committeepostid
     WHERE c.electionid = $1`,
    [electionid]
  );
  return rows;
};

const getCandidatesFilteredByAccess = async (electionid, userId) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.fullname, u.profile_picture, u.session, cp.post_name
     FROM candidate c
     JOIN users u ON c.userid = u.userid
     JOIN committeeposts cp ON c.committeepostid = cp.committeepostid
     WHERE EXISTS (
       SELECT 1
       FROM electionsaccess ea
       JOIN users voter ON LEFT(voter.session, 4) = LEFT(ea.session, 4)
       WHERE voter.userid = $1
         AND LEFT(u.session, 4)::TEXT = ANY(ea.allowed_sessions)
         AND ea.electionid = $2
     ) AND c.request_approval_status = true`,
    [userId, electionid]
  );
  return rows;
};

const approveAllCandidatesByElection = async (electionid) => {
  const { rows } = await pool.query(
    `UPDATE candidate SET request_approval_status=true WHERE electionid=$1 RETURNING *`,
    [electionid]
  );
  return rows;
};

const getApprovedCandidatesByElection = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.fullname, u.profile_picture, u.session, cp.post_name
     FROM candidate c
     JOIN Users u ON c.userId = u.userId
     JOIN Committeeposts cp ON c.committeepostid = cp.committeepostid
     WHERE c.electionid = $1 AND c.request_approval_status = TRUE`,
    [electionid]
  );
  return rows;
};

module.exports = {
  findExistingCandidate,
  getElectionStatus,
  insertCandidate,
  deleteCandidateById,
  updateCandidateById,
  getCandidatesByElectionId,
  getCandidatesFilteredByAccess,
  approveAllCandidatesByElection,
  getApprovedCandidatesByElection,
};
