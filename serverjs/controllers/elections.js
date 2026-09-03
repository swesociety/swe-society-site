const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;
const {xorDecrypt,toISODateString,xorEncrypt,reqSalt_keys,encryptArray, decryptObject, encryptObject} = require("../services/encryption.js");
// Create a new election


const generateOTP = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

const createElection = errorWrapper(
  async (req, res) => {
    const {
      year,
      election_type,
      batch,
      election_commissioner,
      assistant_commissioner,
      candidatereg_start,
      candidatereg_end,
      election_start,
      election_end
    } = req.body;

    

    const electioninfo = {
      year : year,
      election_type : election_type,
      batch : batch,
      election_commissioner : election_commissioner,
      assistant_commissioner : assistant_commissioner,
      candidatereg_start : candidatereg_start,
      candidatereg_end : candidatereg_end,
      election_start : election_start,
      election_end : election_end      
    }
    const decrypted_info = decryptObject(electioninfo,reqSalt_keys.election.createElection)

    const { rows } = await pool.query(
      `INSERT INTO Elections 
        (year, election_type, batch, election_commissioner, assistant_commissioner, 
        candidatereg_start, candidatereg_end, election_start, election_end) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        decrypted_info.year,
        decrypted_info.election_type,
        decrypted_info.batch,
        decrypted_info.election_commissioner,
        decrypted_info.assistant_commissioner,
        toISODateString(decrypted_info.candidatereg_start),
        toISODateString(decrypted_info.candidatereg_end),
        toISODateString(decrypted_info.election_start),
        toISODateString(decrypted_info.election_end)
      ]
    );

    const encryptedRows = encryptObject(rows[0], reqSalt_keys.election.createElection);

    res.status(201).json(encryptedRows);
  },
  { statusCode: 500, message: `Couldn't create election` }
);


// Update an election
const updateElection = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const updates = req.body;

    // Fetch existing election data
    const { rows: existingRows } = await pool.query(
      "SELECT * FROM Elections WHERE electionid = $1",
      [electionid]
    );

    if (existingRows.length === 0) {
      throw new CustomError("Election not found", 404);
    }

    const existingElection = existingRows[0];

    // Merge existing fields with updates (keeping unchanged values)
    const updatedElection = { ...existingElection, ...updates };

    // Construct the SET clause dynamically based on provided fields
    const updateFields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(", ");

    const updateValues = Object.values(updates);
    
    if (updateFields.length === 0) {
      return res.json(existingElection); // No changes, return existing record
    }

    const query = `
      UPDATE Elections 
      SET ${updateFields}
      WHERE electionid = $${updateValues.length + 1} 
      RETURNING *`;

    const { rows } = await pool.query(query, [...updateValues, electionid]);

    res.json(rows[0]);
  },
  { statusCode: 500, message: `Couldn't update election` }
);



// Get all elections
const getAllElections = errorWrapper(
  async (req, res) => {
    const query = `
    SELECT 
      e.electionid,
      e.year,
      e.election_type,
      e.batch,
      e.candidatereg_start,
      e.candidatereg_end,
      e.election_start,
      e.election_end,
      e.election_commissioner,
      e.assistant_commissioner,
   
      ec.userId AS commissioner_userId,
      ec.fullname AS commissioner_fullname,
      ec.email AS commissioner_email,
      ec.profile_picture AS commissioner_profile_picture,
      
      ac.userId AS assistant_userId,
      ac.fullname AS assistant_fullname,
      ac.email AS assistant_email,
      ac.profile_picture AS assistant_profile_picture
    FROM Elections e
    LEFT JOIN Users ec ON e.election_commissioner = ec.userId
    LEFT JOIN Users ac ON e.assistant_commissioner = ac.userId;
  `;
  // const { rows } = await pool.query(query);
    const { rows } = await pool.query(query);
    const salt = reqSalt_keys.election.getAllElection;
    const encryptedRows = encryptArray(rows, salt);    
    res.json(encryptedRows);
  },
  { statusCode: 500, message: `Couldn't get elections` }
);
// Get election by ID
const getElectionById = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params
    const decryptedElectionId = xorDecrypt(electionid, reqSalt_keys.election.getElectionbyID)
    const {
      rows
    } = await pool.query("SELECT * FROM Elections WHERE electionid = $1", [
      decryptedElectionId
    ])

    if (rows.length === 0) {
      throw new CustomError("Election not found", 404)
    }

    res.json(encryptObject(rows[0], reqSalt_keys.election.getElectionbyID))
  },
  { statusCode: 500, message: `Couldn't get election by electionid` }
)



// Delete an election
const deleteElection = errorWrapper(  
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedElectionId = xorDecrypt(electionid, reqSalt_keys.election.deleteElection)

    await pool.query(
      "DELETE FROM vote_table WHERE candidate_id IN (SELECT candidate_id FROM candidate WHERE electionid = $1);",[
      decryptedElectionId
      ]
    );
    await pool.query(
      "DELETE FROM candidate WHERE electionid = $1;",[decryptedElectionId]
    );
    const {
      rowCount
    } = await pool.query("DELETE FROM Elections WHERE electionid = $1", [
      decryptedElectionId
    ])
    
    if (rowCount === 0) {
      throw new CustomError("Election not found", 404)
    }

    res.json({ message: "Election deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete election` }
)


//--------------Election Posts----------------------------------

const createCommitteepost = errorWrapper(
  async (req, res) => {
    const { post_name } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO Committeeposts (post_name) VALUES ($1) RETURNING *",
      [post_name]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create committeepost` }
)

// Get all committeeposts
const getAllCommitteeposts = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM Committeeposts")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get committeeposts` }
)

// Get committeepost by ID
const getCommitteepostById = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params
    const {
      rows
    } = await pool.query(
      "SELECT * FROM Committeeposts WHERE committeepostid = $1",
      [committeepostid]
    )

    if (rows.length === 0) {
      throw new CustomError("Committeepost not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get committeepost by committeepostid` }
)

// Update a committeepost
const updateCommitteepost = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params
    const { post_name } = req.body

    const {
      rows
    } = await pool.query(
      "UPDATE Committeeposts SET post_name = $1 WHERE committeepostid = $2 RETURNING *",
      [post_name, committeepostid]
    )

    if (rows.length === 0) {
      throw new CustomError("Committeepost not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update committeepost` }
)

// Delete a committeepost
const deleteCommitteepost = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params
    const {
      rowCount
    } = await pool.query(
      "DELETE FROM Committeeposts WHERE committeepostid = $1",
      [committeepostid]
    )

    if (rowCount === 0) {
      throw new CustomError("Committeepost not found", 404)
    }

    res.json({ message: "Committeepost deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete committeepost` }
)

//------------- commmitteee members ----------------------------------

const createCommitteeMember = errorWrapper(
  async (req, res) => {
    const { userid, postid, electionid } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO Committee (userid, postid, electionid) VALUES ($1, $2, $3) RETURNING *",
      [userid, postid, electionid]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create committee member` }
)

// Get all committee members
const getAllCommitteeMembers = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM Committee")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get committee members` }
)

// Get committee member by ID
const getCommitteeMemberById = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params
    const {
      rows
    } = await pool.query("SELECT * FROM Committee WHERE committeeid = $1", [
      committeeid
    ])

    if (rows.length === 0) {
      throw new CustomError("Committee member not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get committee member by committeeid` }
)

// Update a committee member
const updateCommitteeMember = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params
    const { userid, postid, electionid } = req.body

    const {
      rows
    } = await pool.query(
      "UPDATE Committee SET userid = $1, postid = $2, electionid = $3 WHERE committeeid = $4 RETURNING *",
      [userid, postid, electionid, committeeid]
    )

    if (rows.length === 0) {
      throw new CustomError("Committee member not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update committee member` }
)

// Delete a committee member
const deleteCommitteeMember = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params
    const {
      rowCount
    } = await pool.query("DELETE FROM Committee WHERE committeeid = $1", [
      committeeid
    ])

    if (rowCount === 0) {
      throw new CustomError("Committee member not found", 404)
    }

    res.json({ message: "Committee member deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete committee member` }
)

const getCommitteeMembersByElectionId = async (req, res) => {
  const { electionid } = req.params
  
  const decryptedElectionId = xorDecrypt(electionid, reqSalt_keys.election.getAllMembers)
  try {
    const query = `
        SELECT 
            e.year,
            u.fullname,
            u.profile_picture,
            u.email,
            u.regno,
            u.session,
            cp.post_name AS committee_post
        FROM 
            Committee c
        JOIN 
            Elections e ON c.electionid = e.electionid
        LEFT JOIN 
            Users ec ON e.election_commissioner = ec.userId
        LEFT JOIN 
            Users ac ON e.assistant_commissioner = ac.userId
        JOIN 
            Users u ON c.userid = u.userId
        JOIN 
            Committeeposts cp ON c.postid = cp.committeepostid
        WHERE 
            c.electionid = $1;
    `
    const { rows } = await pool.query(query, [decryptedElectionId])

    if (rows.length === 0) {
      return res.status(200).json([])
    }

    res.json(rows)
  } catch (error) {
    console.error("Error fetching committee members:", error)
    res.status(500).json({ error: "Couldn't get committee members data" })
  }
}



// Election Voting Access
const createElectionAccess = errorWrapper(
  async (req, res) => {
    const { electionid, session, allowed_sessions } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO ElectionsAccess (electionid, session, allowed_sessions) 
       VALUES ($1, $2, $3) RETURNING *`,
      [electionid, session, allowed_sessions]
    );

    res.status(201).json(rows[0]);
  },
  { statusCode: 500, message: `Couldn't create election access` }
);


const deleteElectionAccess = errorWrapper(
  async (req, res) => {
    const { election_accessid } = req.params;

    const { rowCount } = await pool.query(
      `DELETE FROM ElectionsAccess WHERE election_accessid = $1`,
      [election_accessid]
    );

    if (rowCount === 0) {
      throw new CustomError(`ElectionAccess with id ${election_accessid} not found`, 404);
    }

    res.status(200).json({ message: `ElectionAccess ${election_accessid} deleted successfully` });
  },
  { statusCode: 500, message: `Couldn't delete election access` }
);




const getAllElectionAccessByElectionId = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;

    const { rows } = await pool.query(
      `SELECT * FROM ElectionsAccess WHERE electionid = $1`,
      [electionid]
    );

    res.status(200).json(rows);
  },
  { statusCode: 500, message: `Couldn't fetch election access records` }
);


const updateElectionAccess = errorWrapper(
  async (req, res) => {
    const { election_accessid } = req.params;
    const { electionid, session, allowed_sessions } = req.body;

    const { rows } = await pool.query(
      `UPDATE ElectionsAccess 
       SET electionid = $1, session = $2, allowed_sessions = $3
       WHERE election_accessid = $4
       RETURNING *`,
      [electionid, session, allowed_sessions, election_accessid]
    );

    if (rows.length === 0) {
      throw new CustomError(`ElectionAccess with id ${election_accessid} not found`, 404);
    }

    res.status(200).json(rows[0]);
  },
  { statusCode: 500, message: `Couldn't update election access` }
);


// tracking a candidate:

const createCandidateTrack = errorWrapper(
  async (req, res) => {
    const { regno, election_code } = req.body;

    if (!regno) {
      throw new CustomError("regno is required", 400);
    }

    if(election_code != "oremama56"){
        throw new CustomError("unauthenticated", 400);
    }

    // find running election
    const { rows: elections } = await pool.query(
      `SELECT electionid FROM Elections WHERE election_status = 'a0sc73wq' LIMIT 1` // voting start running code is a0sc73wq
    );

    if (elections.length === 0) {
      throw new CustomError("No running election found.", 400);
    }

    const electionid = elections[0].electionid;

    const otp = generateOTP();

    const { rows } = await pool.query(
      `
      INSERT INTO ElectionCandidateTrack (electionid, otp, regno, status)
      VALUES ($1, $2, $3, 'registered')
      RETURNING *
      `,
      [electionid, otp, regno]
    );

    res.status(201).json(rows[0]);
  },
  { statusCode: 500, message: `Couldn't create ElectionCandidateTrack` }
);

/**
 * 2️⃣ Update ElectionCandidateTrack status
 */
const updateCandidateTrackStatus = errorWrapper(
  async (req, res) => {
    const { regno, status } = req.body;

    if (!regno || !status) {
      throw new CustomError("regno and status are required", 400);
    }

    // find running election
    const { rows: elections } = await pool.query(
      `SELECT electionid FROM Elections WHERE election_status = 'a0sc73wq' LIMIT 1`
    );

    if (elections.length === 0) {
      throw new CustomError("No running election found.", 400);
    }

    const electionid = elections[0].electionid;

    // check if track exists
    const { rows: tracks } = await pool.query(
      `SELECT * FROM ElectionCandidateTrack WHERE electionid = $1 AND regno = $2`,
      [electionid, regno]
    );

    if (tracks.length === 0) {
      throw new CustomError("You are not registered for the current election.", 400);
    }

    const currentStatus = tracks[0].status;
    const newStatus = `${currentStatus}_${status}`;

    const { rows: updated } = await pool.query(
      `UPDATE ElectionCandidateTrack SET status = $1 WHERE election_on_arival_id = $2 RETURNING *`,
      [newStatus, tracks[0].election_on_arival_id]
    );

    res.json(updated[0]);
  },
  { statusCode: 500, message: `Couldn't update ElectionCandidateTrack status` }
);

/**
 * 3️⃣ Get all ElectionCandidateTrack for running elections
 *     and return only last status value
 */


const getRunningElectionCandidates = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;

    if (!electionid) {
      throw new CustomError("electionid parameter is required", 400);
    }

    const { rows: tracks } = await pool.query(
      `
      SELECT 
          ect.*, 
          u.fullname,
          regexp_replace(ect.status, '^.*_', '') AS last_status
      FROM ElectionCandidateTrack ect
      LEFT JOIN Users u ON ect.regno = u.regno
      WHERE ect.electionid = $1
      ORDER BY ect.election_on_arival_id DESC
      `,
      [electionid]
    );

    res.json(tracks);
  },
  { statusCode: 500, message: `Couldn't fetch candidates for given electionid` }
);


const getStatusByRegnoAndElectionId = errorWrapper(
  async (req, res) => {
    const { regno, electionid } = req.body;

    if (!regno || !electionid) {
      throw new CustomError("regno and electionid are required", 400);
    }

    const { rows } = await pool.query(
      `
      SELECT regexp_replace(status, '^.*_', '') AS last_status
      FROM ElectionCandidateTrack
      WHERE regno = $1 AND electionid = $2
      LIMIT 1
      `,
      [regno, electionid]
    );

    if (rows.length === 0) {
      throw new CustomError(
        "No record found for given regno and electionid.",
        404
      );
    }

    res.json({ regno, electionid, status: rows[0].last_status });
  },
  { statusCode: 500, message: `Couldn't fetch status` }
);



module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  createCommitteepost,
  getAllCommitteeposts,
  getCommitteepostById,
  updateCommitteepost,
  deleteCommitteepost,
  createCommitteeMember,
  getAllCommitteeMembers,
  getCommitteeMemberById,
  updateCommitteeMember,
  deleteCommitteeMember,
  getCommitteeMembersByElectionId,
  createElectionAccess,
  deleteElectionAccess,
  updateElectionAccess,
  getAllElectionAccessByElectionId,

  createCandidateTrack,
  updateCandidateTrackStatus,
  getRunningElectionCandidates,
  getStatusByRegnoAndElectionId
}