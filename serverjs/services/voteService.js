const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const getElectionByCandidate = async (candidateId) => {
  const { rows } = await pool.query(
    `SELECT * FROM Elections e JOIN candidate c ON e.electionid = c.electionid WHERE c.candidate_id = $1`,
    [candidateId]
  );
  return rows[0] || null;
};

const checkAlreadyVoted = async (candidateId, userId) => {
  const { rows } = await pool.query(
    `SELECT CASE
       WHEN EXISTS (
         SELECT 1 FROM elections AS e
         JOIN candidate AS c ON c.electionid = e.electionid
         JOIN vote_table AS v ON v.candidate_id = c.candidate_id
         WHERE c.candidate_id = $1 AND v.userid = $2
       ) THEN FALSE ELSE TRUE
     END AS can_vote`,
    [candidateId, userId]
  );
  return rows[0]?.can_vote ?? true;
};

const insertVotes = async (userId, candidateIds) => {
  const values = candidateIds.map((_, index) => `($1, $${index + 2})`).join(", ");
  const params = [userId, ...candidateIds];
  const { rows } = await pool.query(
    `INSERT INTO vote_table (userId, candidate_id) VALUES ${values}
     ON CONFLICT (userId, candidate_id) DO NOTHING RETURNING *`,
    params
  );
  return rows;
};

const deleteVote = async (userId, candidate_id) => {
  await pool.query(
    `DELETE FROM vote_table WHERE userId=$1 AND candidate_id=$2`, [userId, candidate_id]
  );
};

const checkStandingsAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT r.roleid, r.standingsaccess FROM Roles r JOIN Users u ON r.roleid = u.roleid WHERE u.userid = $1`,
    [userid]
  );
  return rows[0] || null;
};

const getVoteCountByElection = async (electionid) => {
  const { rows } = await pool.query(
    `SELECT c.candidate_id, c.marka_name, c.slogan, c.logo_url, c.committeepostid,
            u.fullname AS candidate_name, u.regno, u.session, Cpost.post_name,
            COUNT(v.userId) AS vote_count
     FROM candidate c
     LEFT JOIN vote_table v ON c.candidate_id = v.candidate_id
     JOIN Users u ON c.userId = u.userId
     JOIN Committeeposts Cpost ON c.committeepostid = Cpost.committeepostid
     WHERE c.electionid = $1
     GROUP BY c.candidate_id, u.fullname, u.regno, u.session, Cpost.post_name
     ORDER BY vote_count DESC`,
    [electionid]
  );
  return rows;
};

const getAllVotesDescending = async () => {
  const { rows } = await pool.query(
    `SELECT v.userId, u.fullname AS voter_name, u.session,
            c.candidate_id, c.marka_name, c.slogan, c.logo_url,
            cu.fullname AS candidate_name
     FROM vote_table v
     JOIN Users u ON v.userId = u.userId
     JOIN candidate c ON v.candidate_id = c.candidate_id
     JOIN Users cu ON c.userId = cu.userId
     ORDER BY v.created_at DESC`
  );
  return rows;
};

module.exports = {
  getElectionByCandidate, checkAlreadyVoted, insertVotes, deleteVote,
  checkStandingsAccess, getVoteCountByElection, getAllVotesDescending,
};
