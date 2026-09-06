const { time } = require("console");
const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { xorDecrypt, reqSalt_keys, encryptArray, decryptArray } = require("../services/encryption.js");
const pool = require("../db/dbconnect.js").pool;
const { DateTime } = require('luxon');
const e = require("cors");
const { election_status } = require("../services/electionStatus.js");
const { logActivity } = require("../services/activityLogService.js");

// const createVote = errorWrapper(async (req, res) => {
//   const { user_id, vote } = req.body;

//   const decrypted_user_id = xorDecrypt(user_id, reqSalt_keys.vote.create);

//   // Fetch election time using the first candidate
  

//   const decrypted_vote_objects = decryptArray(vote, reqSalt_keys.vote.create);

//   if (
//     !decrypted_user_id ||
//     !Array.isArray(decrypted_vote_objects) ||
//     decrypted_vote_objects.length === 0
//   ) {
//     throw new CustomError("Invalid vote payload", 400);
//   }

//   // Extract and validate candidate IDs
//   const candidateIds = decrypted_vote_objects
//     .map(obj => {
//       if (!obj || typeof obj.candidate_id !== "string" || obj.candidate_id.trim() === "") {
//         return null;
//       }
//       const parsed = parseInt(obj.candidate_id);
//       return isNaN(parsed) ? null : parsed;
//     })
//     .filter(id => id !== null);

//   if (candidateIds.length === 0) {
//     throw new CustomError("No valid candidate IDs found in vote", 400);
//   }

  
//   const { rows: electionRows } = await pool.query(
//     `SELECT *
//      FROM Elections e
//      JOIN candidate c ON e.electionid = c.electionid
//      WHERE c.candidate_id = $1`,
//     [candidateIds[0]]
//   );

//   if(electionRows[0].election_status=== election_status.voting_start) {
//     const values = candidateIds.map((_, index) => `($1, $${index + 2})`).join(", ");
//   const params = [decrypted_user_id, ...candidateIds];

//   const insertQuery = `
//     INSERT INTO vote_table (userId, candidate_id)
//     VALUES ${values}
//     ON CONFLICT (userId, candidate_id) DO NOTHING
//     RETURNING *;
//   `;

//   const { rows } = await pool.query(insertQuery, params);

//   res.status(201).json({
//     message: "Votes submitted successfully",
//     submitted_votes: rows.length,
//     data: rows,
//   });
//   }
//   else {
//     throw new CustomError("Voting is not currently allowed for this election", 403);
//   }

  
// }, {
//   statusCode: 500,
//   message: `Couldn't create vote`,
// });



// Delete a vote

const createVote = errorWrapper(async (req, res) => {
  const { user_id, vote } = req.body;
  

  const decrypted_user_id = xorDecrypt(user_id, reqSalt_keys.vote.create);

  // Fetch election time using the first candidate
  

  const decrypted_vote_objects = decryptArray(vote, reqSalt_keys.vote.create);

  if (
    !decrypted_user_id ||
    !Array.isArray(decrypted_vote_objects) ||
    decrypted_vote_objects.length === 0
  ) {
    throw new CustomError("Invalid vote payload", 400);
  }

  
  const candidateIds = decrypted_vote_objects
    .map(obj => {
      if (!obj || typeof obj.candidate_id !== "string" || obj.candidate_id.trim() === "") {
        return null;
      }
      const parsed = parseInt(obj.candidate_id);
      return isNaN(parsed) ? null : parsed;
    })
    .filter(id => id !== null);

  if (candidateIds.length === 0) {
    throw new CustomError("No valid candidate IDs found in vote", 400);
  }

  
  const { rows: electionRows } = await pool.query(
    `SELECT *
     FROM Elections e
     JOIN candidate c ON e.electionid = c.electionid
     WHERE c.candidate_id = $1`,
    [candidateIds[0]]
  );

  const check_already_voted = await pool.query(
    `SELECT
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM elections AS e
        JOIN candidate AS c ON c.electionid = e.electionid
        JOIN vote_table AS v ON v.candidate_id = c.candidate_id
        WHERE c.candidate_id = $1
          AND v.userid = $2
      )
      THEN FALSE
      ELSE TRUE
    END AS can_vote;
`,[candidateIds[0], decrypted_user_id]
  );
  console.log("can vote :",check_already_voted.rows[0].can_vote);
  if(!check_already_voted.rows[0].can_vote){
    throw new CustomError("You have already voted for this candidate", 403);
  }
  

  if(electionRows[0].election_status=== election_status.voting_start) {
    const values = candidateIds.map((_, index) => `($1, $${index + 2})`).join(", ");
  const params = [decrypted_user_id, ...candidateIds];

  const insertQuery = `
    INSERT INTO vote_table (userId, candidate_id)
    VALUES ${values}
    ON CONFLICT (userId, candidate_id) DO NOTHING
    RETURNING *;
  `;

  const { rows } = await pool.query(insertQuery, params);

  req.jwtPayload = req.jwtPayload || { userid: decrypted_user_id };
  await logActivity({
    req,
    action: "vote.cast",
    category: "vote",
    description: "User cast a vote in an election",
    metadata: { votes_count: rows.length }
  });

  res.status(201).json({
    message: "Votes submitted successfully",
    submitted_votes: rows.length,
    data: rows,
  });
  }
  else {
    throw new CustomError("Voting is not currently allowed for this election", 403);
  }
}, {
  statusCode: 500,
  message: `Couldn't create vote`,
});


const deleteVote = errorWrapper(async (req, res) => {
  const { userId, candidate_id } = req.params;

  await pool.query(
    `DELETE FROM vote_table WHERE userId = $1 AND candidate_id = $2`,
    [userId, candidate_id]
  );

  res.status(200).json({ message: "Vote deleted successfully" });
}, { statusCode: 500, message: `Couldn't delete vote` });

// Get count of votes for all candidates in an election
const getVoteCountByElection = errorWrapper(async (req, res) => {
  const { electionid } = req.params;
  const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.vote.getVoteCountByID);

  // Access control: only super admin (roleid=1) or roles with standingsaccess may view standings
  const { rows: accessRows } = await pool.query(
    `SELECT r.roleid, r.standingsaccess
     FROM Roles r
     JOIN Users u ON r.roleid = u.roleid
     WHERE u.userid = $1`,
    [req.jwtPayload.userid]
  );

  if (accessRows.length === 0) {
    return res.status(403).json({ message: "Access denied. User role not found." });
  }

  const { roleid, standingsaccess } = accessRows[0];
  if (roleid !== 1 && !standingsaccess) {
    return res.status(403).json({ message: "Access denied. You do not have permission to view standings." });
  }

  const { rows } = await pool.query(
    `SELECT c.candidate_id, c.marka_name, c.slogan, c.logo_url, c.committeepostid, 
            u.fullname AS candidate_name, u.regno, u.session, Cpost.post_name,
            COUNT(v.userId) AS vote_count
     FROM candidate c
     LEFT JOIN vote_table v ON c.candidate_id = v.candidate_id
     JOIN Users u ON c.userId = u.userId
     JOIN Committeeposts Cpost on c.committeepostid = Cpost.committeepostid
     WHERE c.electionid = $1
     GROUP BY c.candidate_id, u.fullname, u.regno, u.session,Cpost.post_name
     ORDER BY vote_count DESC`,
    [decrypted_electionid]
  );

  res.status(200).json(encryptArray(rows, reqSalt_keys.vote.getVoteCountByID));
}, { statusCode: 500, message: `Couldn't fetch vote counts` });

// Get all votes in descending order with candidate and user details
const getAllVotesDescending = errorWrapper(async (req, res) => {
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

  res.status(200).json(rows);
}, { statusCode: 500, message: `Couldn't fetch votes` });

module.exports = { createVote, deleteVote, getVoteCountByElection, getAllVotesDescending };
