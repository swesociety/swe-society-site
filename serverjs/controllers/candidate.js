const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { reqSalt_keys,
  xorEncrypt,
  xorDecrypt,
  encryptObject,
  decryptObject,
  encryptArray,
  decryptArray,
  toISODateString  } = require("../services/encryption.js");
const pool = require("../db/dbconnect.js").pool;
const { DateTime } = require('luxon');
const { election_status } = require("../services/electionStatus.js");
const jwt = require('jsonwebtoken');
const { logActivity } = require("../services/activityLogService.js");
// Create a new candidate
const createCandidate = errorWrapper(  
  async (req, res) => {
    const { electionid, userId, marka_name, slogan, logo_url, committeepostid } = req.body;
    const request_approval_status = false;

    // 1. Decrypt incoming data
    const decrypted_data = decryptObject({
      electionid,
      userId,
      marka_name,
      slogan,
      logo_url,
      committeepostid
    }, reqSalt_keys.candidate.createcandidate);
    
    
    // 2.  Validate decrypted userId and electionid
    if (!decrypted_data.userId || !decrypted_data.electionid) {
      return res.status(400).json({
        message: "Invalid user or election information. Session expired or user not logged in."
      });
    }

    // 3.  Check if user already registered
    const { rows: existingCandidates } = await pool.query(
      `SELECT * FROM candidate WHERE electionid = $1 AND userId = $2`,
      [decrypted_data.electionid, decrypted_data.userId]
    );

    if (existingCandidates.length > 0) {
      return res.status(409).json({
        message: "User is already a candidate in this election"
      });
    }
    // 4. check is it within time period to register as candidate
    const { rows: electionRows } = await pool.query(
      `SELECT * FROM elections WHERE electionid = $1`,
      [decrypted_data.electionid]
    );
    

    switch (electionRows[0].election_status) {
      
      case election_status.candidate_reg_start:
          const { rows: insertedRows } = await pool.query(
                `INSERT INTO candidate (electionid, userId, marka_name, slogan, logo_url, committeepostid, request_approval_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [
                  decrypted_data.electionid,
                  decrypted_data.userId,
                  decrypted_data.marka_name,
                  decrypted_data.slogan,
                  decrypted_data.logo_url,
                  decrypted_data.committeepostid,
                  request_approval_status
                ]
              );

          await logActivity({
            req,
            action: "candidate.register",
            category: "candidate",
            targetType: "election",
            targetId: decrypted_data.electionid,
            description: `Candidate registered for election ID ${decrypted_data.electionid}`,
          });

          return res.status(201).json({
            message: "Candidate registration successful"
          });
    
      default:
          throw new CustomError("Nomination form submission isnot allowed at this moment", 400);
    }    
  },
  { statusCode: 500, message: `Couldn't create candidate` }
);



// Delete a candidate by ID
const deleteCandidate = errorWrapper(
  async (req, res) => {
    const { candidate_id } = req.params;
    const Decrypted_candidate_id = xorDecrypt(candidate_id, reqSalt_keys.candidate.deleteNomination);
    const { rowCount } = await pool.query(
      `DELETE FROM candidate WHERE candidate_id = $1`,
      [Decrypted_candidate_id]
    );

    if (rowCount === 0) {
      throw new CustomError(`Candidate not found`, 404);
    }

    res.status(200).json({ message: "Candidate deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete candidate` }
);

// Update specific fields of a candidate
const updateCandidate = errorWrapper(
  async (req, res) => {
    const { candidate_id } = req.params;
    const Decrypted_candidate_id = xorDecrypt(candidate_id, reqSalt_keys.candidate.updateNomination);
    const fields = decryptObject(req.body, reqSalt_keys.candidate.updateNomination);
    
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    
    if (keys.length === 0) {
      throw new CustomError("No fields provided for update", 400);
    }

    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");

    const { rows } = await pool.query(
      `UPDATE candidate SET ${setClause} WHERE candidate_id = $${keys.length + 1} RETURNING *`,
      [...values, Decrypted_candidate_id]
    );

    if (rows.length === 0) {
      throw new CustomError(`Candidate not found`, 404);
    }

    res.status(200).json(rows[0]);
  },
  { statusCode: 500, message: `Couldn't update candidate` }
);

// Get all candidates for a specific election
const getCandidatesByElection = errorWrapper(  
    async (req, res) => {
      const { electionid } = req.params;
      const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.candidate.getCandidatesByElection);
      
       

      const { rows } = await pool.query(
        `SELECT c.*, u.fullname, u.profile_picture, u.session, cp.post_name 
         FROM candidate c 
         JOIN Users u ON c.userId = u.userId 
         JOIN Committeeposts cp ON c.committeepostid = cp.committeepostid 
         WHERE c.electionid = $1`,
        [decrypted_electionid]
      );
  
      res.status(200).json(rows);
    },
    { statusCode: 500, message: `Couldn't fetch candidates` }
  );

  const getCandidatesFilteredByElectionAccess = errorWrapper(  
    async (req, res) => {
      const { electionid,userId } = req.params;
      const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess);
      const decrypted_userId = xorDecrypt(userId, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess);
      
      
       const result = await pool.query(
          `SELECT 
            c.*, 
            u.fullname, 
            u.profile_picture, 
            u.session, 
            cp.post_name 
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
          ) and c.request_approval_status = true;
          `,
          [decrypted_userId, decrypted_electionid]
        );
      res.status(200).json(encryptArray(result.rows, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess));
    },
    { statusCode: 500, message: `Couldn't fetch candidates` }
  );


  const approve_all_candidate_by_election = errorWrapper(
    async (req, res) => {
      const { electionid } = req.params;
      const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.candidate.approveAllNominations);
  
      const { rows } = await pool.query(
        `update candidate 
        set request_approval_status=true 
        where electionid=$1
        returning *`,
        [decrypted_electionid]
      );

      if (rows.length >= 0) {
        res.status(200).json({ message: "All candidates approved successfully" });
      }
      else {
        res.status(200).json({ message: "There are no candidates to approve" });
      }
      
    },
    { statusCode: 500, message: `Couldn't approved all the candidates` }
  )


  const getApprovedCandidatesByElection = errorWrapper(
    async (req, res) => {
      const { electionid } = req.params;
      const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.candidate.getAllApprovedNominations);
  
      const { rows } = await pool.query(
        `SELECT c.*, u.fullname, u.profile_picture, u.session, cp.post_name 
         FROM candidate c 
         JOIN Users u ON c.userId = u.userId 
         JOIN Committeeposts cp ON c.committeepostid = cp.committeepostid 
         WHERE c.electionid = $1 AND c.request_approval_status = TRUE`,
        [decrypted_electionid]
      );
  
      res.status(200).json(encryptArray(rows, reqSalt_keys.candidate.getAllApprovedNominations));
    },
    { statusCode: 500, message: `Couldn't fetch approved candidates` }
  );

module.exports = { createCandidate, deleteCandidate, updateCandidate, getCandidatesByElection, getApprovedCandidatesByElection,approve_all_candidate_by_election ,getCandidatesFilteredByElectionAccess};
