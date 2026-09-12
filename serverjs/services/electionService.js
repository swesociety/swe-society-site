const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

// ─── Elections ────────────────────────────────────────────────────────────────

const createElection = async ({
  year, election_type, batch, election_commissioner, assistant_commissioner,
  candidatereg_start, candidatereg_end, election_start, election_end
}) => {
  const { rows } = await pool.query(
    `INSERT INTO Elections
      (year, election_type, batch, election_commissioner, assistant_commissioner,
       candidatereg_start, candidatereg_end, election_start, election_end)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [year, election_type, batch, election_commissioner, assistant_commissioner,
     candidatereg_start, candidatereg_end, election_start, election_end]
  );
  return rows[0];
};

const updateElection = async (electionid, updates) => {
  const { rows: existingRows } = await pool.query(
    "SELECT * FROM Elections WHERE electionid = $1", [electionid]
  );
  if (existingRows.length === 0) throw new CustomError("Election not found", 404);

  const updateFields = Object.keys(updates).map((key, i) => `${key} = $${i + 1}`).join(", ");
  const updateValues = Object.values(updates);
  if (!updateFields) return existingRows[0];

  const { rows } = await pool.query(
    `UPDATE Elections SET ${updateFields} WHERE electionid = $${updateValues.length + 1} RETURNING *`,
    [...updateValues, electionid]
  );
  return rows[0];
};

const getAllElections = async () => {
  const { rows } = await pool.query(`
    SELECT
      e.electionid, e.year, e.election_type, e.batch, e.election_status,
      e.candidatereg_start, e.candidatereg_end, e.election_start, e.election_end,
      e.election_commissioner, e.assistant_commissioner,
      ec.userId AS commissioner_userId, ec.fullname AS commissioner_fullname,
      ec.email AS commissioner_email, ec.profile_picture AS commissioner_profile_picture,
      ac.userId AS assistant_userId, ac.fullname AS assistant_fullname,
      ac.email AS assistant_email, ac.profile_picture AS assistant_profile_picture
    FROM Elections e
    LEFT JOIN Users ec ON e.election_commissioner = ec.userId
    LEFT JOIN Users ac ON e.assistant_commissioner = ac.userId
  `);
  return rows;
};

const getElectionById = async (electionid) => {
  const { rows } = await pool.query("SELECT * FROM Elections WHERE electionid = $1", [electionid]);
  if (rows.length === 0) throw new CustomError("Election not found", 404);
  return rows[0];
};

const deleteElection = async (electionid) => {
  await pool.query(
    "DELETE FROM vote_table WHERE candidate_id IN (SELECT candidate_id FROM candidate WHERE electionid = $1)",
    [electionid]
  );
  await pool.query("DELETE FROM candidate WHERE electionid = $1", [electionid]);
  const { rowCount } = await pool.query("DELETE FROM Elections WHERE electionid = $1", [electionid]);
  if (rowCount === 0) throw new CustomError("Election not found", 404);
};

// ─── Committee Posts ──────────────────────────────────────────────────────────

const createCommitteepost = async (post_name) => {
  const { rows } = await pool.query(
    "INSERT INTO Committeeposts (post_name) VALUES ($1) RETURNING *", [post_name]
  );
  return rows[0];
};

const getAllCommitteeposts = async () => {
  const { rows } = await pool.query("SELECT * FROM Committeeposts");
  return rows;
};

const getCommitteepostById = async (committeepostid) => {
  const { rows } = await pool.query(
    "SELECT * FROM Committeeposts WHERE committeepostid = $1", [committeepostid]
  );
  if (rows.length === 0) throw new CustomError("Committeepost not found", 404);
  return rows[0];
};

const updateCommitteepost = async (committeepostid, post_name) => {
  const { rows } = await pool.query(
    "UPDATE Committeeposts SET post_name = $1 WHERE committeepostid = $2 RETURNING *",
    [post_name, committeepostid]
  );
  if (rows.length === 0) throw new CustomError("Committeepost not found", 404);
  return rows[0];
};

const deleteCommitteepost = async (committeepostid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM Committeeposts WHERE committeepostid = $1", [committeepostid]
  );
  if (rowCount === 0) throw new CustomError("Committeepost not found", 404);
};

// ─── Committee Members ────────────────────────────────────────────────────────

const checkExistingCommitteeMember = async (userid, executive_committeeid, excludeCommitteeid = null) => {
  if (excludeCommitteeid) {
    const { rows } = await pool.query(
      "SELECT 1 FROM Committee WHERE userid=$1 AND executive_committeeid=$2 AND committeeid<>$3 LIMIT 1",
      [userid, executive_committeeid, excludeCommitteeid]
    );
    return rows.length > 0;
  }
  const { rows } = await pool.query(
    "SELECT 1 FROM Committee WHERE userid=$1 AND executive_committeeid=$2 LIMIT 1",
    [userid, executive_committeeid]
  );
  return rows.length > 0;
};

const createCommitteeMember = async ({ userid, postid, electionid, executive_committeeid, service_start, service_end }) => {
  const { rows } = await pool.query(
    "INSERT INTO Committee (userid, postid, electionid, executive_committeeid, service_start, service_end) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [userid, postid, electionid || null, executive_committeeid, service_start, service_end]
  );
  return rows[0];
};

const getAllCommitteeMembers = async () => {
  const { rows } = await pool.query(`
    SELECT c.committeeid, c.userid, c.postid, c.electionid, c.executive_committeeid,
           c.service_start, c.service_end, u.fullname, u.regno, u.profile_picture,
           cp.post_name, ec.committee_name AS executive_committee_name,
           ec.year AS executive_committee_year, e.year, e.election_type, e.batch
    FROM Committee c
    JOIN Users u ON c.userid = u.userid
    JOIN Committeeposts cp ON c.postid = cp.committeepostid
    LEFT JOIN ExecutiveCommittees ec ON c.executive_committeeid = ec.committeeid
    LEFT JOIN Elections e ON c.electionid = e.electionid
    ORDER BY ec.year DESC, ec.committeeid DESC, cp.committeepostid, u.fullname
  `);
  return rows;
};

const getCommitteeMemberById = async (committeeid) => {
  const { rows } = await pool.query(
    "SELECT * FROM Committee WHERE committeeid = $1", [committeeid]
  );
  if (rows.length === 0) throw new CustomError("Committee member not found", 404);
  return rows[0];
};

const updateCommitteeMember = async (committeeid, { userid, postid, electionid, executive_committeeid, service_start, service_end }) => {
  const { rows } = await pool.query(
    "UPDATE Committee SET userid=$1, postid=$2, electionid=$3, executive_committeeid=$4, service_start=$5, service_end=$6 WHERE committeeid=$7 RETURNING *",
    [userid, postid, electionid || null, executive_committeeid, service_start, service_end, committeeid]
  );
  if (rows.length === 0) throw new CustomError("Committee member not found", 404);
  return rows[0];
};

const deleteCommitteeMember = async (committeeid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM Committee WHERE committeeid = $1", [committeeid]
  );
  if (rowCount === 0) throw new CustomError("Committee member not found", 404);
};

const getCommitteeMembersByElectionId = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT e.year, u.fullname, u.profile_picture, u.email, u.regno, u.session,
            cp.post_name AS committee_post
     FROM Committee c
     JOIN Elections e ON c.electionid = e.electionid
     LEFT JOIN Users ec ON e.election_commissioner = ec.userId
     LEFT JOIN Users ac ON e.assistant_commissioner = ac.userId
     JOIN Users u ON c.userid = u.userId
     JOIN Committeeposts cp ON c.postid = cp.committeepostid
     WHERE c.electionid = $1`,
    [electionid]
  );
  return rows;
};

// ─── Executive Committees ─────────────────────────────────────────────────────

const createExecutiveCommittee = async (committee_name, year) => {
  const { rows } = await pool.query(
    "INSERT INTO ExecutiveCommittees (committee_name, year) VALUES ($1,$2) RETURNING *",
    [committee_name.trim(), String(year).trim()]
  );
  return rows[0];
};

const getAllExecutiveCommittees = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM ExecutiveCommittees ORDER BY year DESC, committeeid DESC"
  );
  return rows;
};

const updateExecutiveCommittee = async (committeeid, committee_name, year) => {
  const { rows } = await pool.query(
    "UPDATE ExecutiveCommittees SET committee_name=$1, year=$2 WHERE committeeid=$3 RETURNING *",
    [committee_name.trim(), String(year).trim(), committeeid]
  );
  if (rows.length === 0) throw new CustomError("Executive committee not found", 404);
  return rows[0];
};

const deleteExecutiveCommittee = async (committeeid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM ExecutiveCommittees WHERE committeeid = $1", [committeeid]
  );
  if (rowCount === 0) throw new CustomError("Executive committee not found", 404);
};

// ─── Election Access ──────────────────────────────────────────────────────────

const createElectionAccess = async ({ electionid, session, allowed_sessions }) => {
  const { rows } = await pool.query(
    `INSERT INTO ElectionsAccess (electionid, session, allowed_sessions) VALUES ($1,$2,$3) RETURNING *`,
    [electionid, session, allowed_sessions]
  );
  return rows[0];
};

const deleteElectionAccess = async (election_accessid) => {
  const { rowCount } = await pool.query(
    `DELETE FROM ElectionsAccess WHERE election_accessid = $1`, [election_accessid]
  );
  if (rowCount === 0) throw new CustomError(`ElectionAccess with id ${election_accessid} not found`, 404);
};

const getAllElectionAccessByElectionId = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT * FROM ElectionsAccess WHERE electionid = $1`, [electionid]
  );
  return rows;
};

const updateElectionAccess = async (election_accessid, { electionid, session, allowed_sessions }) => {
  const { rows } = await pool.query(
    `UPDATE ElectionsAccess SET electionid=$1, session=$2, allowed_sessions=$3
     WHERE election_accessid=$4 RETURNING *`,
    [electionid, session, allowed_sessions, election_accessid]
  );
  if (rows.length === 0) throw new CustomError(`ElectionAccess with id ${election_accessid} not found`, 404);
  return rows[0];
};

// ─── Candidate Tracking ───────────────────────────────────────────────────────

const findRunningElection = async () => {
  const { rows } = await pool.query(
    `SELECT electionid FROM Elections WHERE election_status = 'a0sc73wq' LIMIT 1`
  );
  return rows[0] || null;
};

const createCandidateTrack = async (electionid, regno, otp) => {
  const { rows } = await pool.query(
    `INSERT INTO ElectionCandidateTrack (electionid, otp, regno, status)
     VALUES ($1,$2,$3,'registered') RETURNING *`,
    [electionid, otp, regno]
  );
  return rows[0];
};

const findCandidateTrack = async (electionid, regno) => {
  const { rows } = await pool.query(
    `SELECT * FROM ElectionCandidateTrack WHERE electionid=$1 AND regno=$2`,
    [electionid, regno]
  );
  return rows[0] || null;
};

const updateCandidateTrackStatus = async (election_on_arival_id, newStatus) => {
  const { rows } = await pool.query(
    `UPDATE ElectionCandidateTrack SET status=$1 WHERE election_on_arival_id=$2 RETURNING *`,
    [newStatus, election_on_arival_id]
  );
  return rows[0];
};

const getRunningElectionCandidates = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT ect.*, u.fullname, regexp_replace(ect.status, '^.*_', '') AS last_status
     FROM ElectionCandidateTrack ect
     LEFT JOIN Users u ON ect.regno = u.regno
     WHERE ect.electionid = $1
     ORDER BY ect.election_on_arival_id DESC`,
    [electionid]
  );
  return rows;
};

const getStatusByRegnoAndElectionId = async (regno, electionid) => {
  const { rows } = await pool.query(
    `SELECT regexp_replace(status, '^.*_', '') AS last_status
     FROM ElectionCandidateTrack
     WHERE regno=$1 AND electionid=$2 LIMIT 1`,
    [regno, electionid]
  );
  if (rows.length === 0) throw new CustomError("No record found for given regno and electionid.", 404);
  return rows[0].last_status;
};

module.exports = {
  // Elections
  createElection, updateElection, getAllElections, getElectionById, deleteElection,
  // Committee Posts
  createCommitteepost, getAllCommitteeposts, getCommitteepostById, updateCommitteepost, deleteCommitteepost,
  // Committee Members
  checkExistingCommitteeMember, createCommitteeMember, getAllCommitteeMembers,
  getCommitteeMemberById, updateCommitteeMember, deleteCommitteeMember, getCommitteeMembersByElectionId,
  // Executive Committees
  createExecutiveCommittee, getAllExecutiveCommittees, updateExecutiveCommittee, deleteExecutiveCommittee,
  // Election Access
  createElectionAccess, deleteElectionAccess, getAllElectionAccessByElectionId, updateElectionAccess,
  // Candidate Tracking
  findRunningElection, createCandidateTrack, findCandidateTrack,
  updateCandidateTrackStatus, getRunningElectionCandidates, getStatusByRegnoAndElectionId,
};
