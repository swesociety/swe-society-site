const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;

// Create a new team
const createTeam = errorWrapper(
  async (req, res) => {
    const { teamname, mentor } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO Teams (teamname, mentor) VALUES ($1, $2) RETURNING *",
      [teamname, mentor]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create team` }
)

// Get all teams
const getAllTeams = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM Teams")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get teams` }
)

// Update a team
const updateTeam = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params
    const { teamname, mentor } = req.body

    // Collect columns to update and corresponding values
    const updates = []
    const values = []

    if (teamname) {
      updates.push("teamname = $" + (updates.length + 1))
      values.push(teamname)
    }
    if (mentor) {
      updates.push("mentor = $" + (updates.length + 1))
      values.push(mentor)
    }

    // If there are no fields to update, return an error
    if (updates.length === 0) {
      throw new CustomError("No fields to update", 400)
    }

    // Add teamid as the last parameter
    values.push(teamid)
    const query = `UPDATE Teams SET ${updates.join(", ")} WHERE teamid = $${
      values.length
    } RETURNING *`

    const { rows } = await pool.query(query, values)

    if (rows.length === 0) {
      throw new CustomError("Team not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update team` }
)

// Delete a team
const deleteTeam = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params
    const { rowCount } = await pool.query(
      "DELETE FROM Teams WHERE teamid = $1",
      [teamid]
    )

    if (rowCount === 0) {
      throw new CustomError("Team not found", 404)
    }

    res.json({ message: "Team deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete team` }
)

//---------------------------- team members-----------------------

const addTeamMember = errorWrapper(
  async (req, res) => {
    const { userid, teamid, othermember, other_member_institute } = req.body

    // Collect columns and values dynamically based on provided fields
    const columns = ["teamid"]
    const values = [teamid]
    const placeholders = ["$1"]

    if (userid) {
      columns.push("userid")
      values.push(userid)
      placeholders.push(`$${placeholders.length + 1}`)
    }

    if (othermember) {
      columns.push("othermember")
      values.push(othermember)
      placeholders.push(`$${placeholders.length + 1}`)
    }

    if (other_member_institute) {
      columns.push("other_member_institute")
      values.push(other_member_institute)
      placeholders.push(`$${placeholders.length + 1}`)
    }

    // Build the query string dynamically
    const query = `INSERT INTO TeamMembers (${columns.join(
      ", "
    )}) VALUES (${placeholders.join(", ")}) RETURNING *`

    const { rows } = await pool.query(query, values)

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't add team member` }
)

// Get all team members
const getAllTeamMembers = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM TeamMembers")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get team members` }
)

// Get team members by team ID
const getTeamMembersByTeamId = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params
    const {
      rows
    } = await pool.query("SELECT * FROM TeamMembers WHERE teamid = $1", [
      teamid
    ])

    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get team members by teamid` }
)

// Remove a user from a team
const removeTeamMember = errorWrapper(
  async (req, res) => {
    const { userid, teamid } = req.body

    const {
      rowCount
    } = await pool.query(
      "DELETE FROM TeamMembers WHERE userid = $1 AND teamid = $2",
      [userid, teamid]
    )

    if (rowCount === 0) {
      throw new CustomError("Team member not found", 404)
    }

    res.json({ message: "Team member removed successfully" })
  },
  { statusCode: 500, message: `Couldn't remove team member` }
)

// Achievement posts
const createAchievement = errorWrapper(
  async (req, res) => {
    const {
      teamid,
      eventname,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status
    } = req.body

    const { rows } = await pool.query(
      `INSERT INTO Achievements (teamid, eventname, organizer, venu, startdate, enddate, rank, rankarea, task, solution, techstack, resources, photos, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        teamid,
        eventname,
        organizer,
        venu,
        startdate,
        enddate,
        rank,
        rankarea,
        task,
        solution,
        techstack,
        resources,
        photos,
        approval_status
      ]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create achievement` }
)

// Get all achievements
const getAllAchievements = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM Achievements")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get achievements` }
)

// Get an achievement by ID
const getAchievementById = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params
    const {
      rows
    } = await pool.query("SELECT * FROM Achievements WHERE achieveid = $1", [
      achieveid
    ])

    if (rows.length === 0) {
      throw new CustomError("Achievement not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get achievement by achieveid` }
)

// Update an achievement
const updateAchievement = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params
    const {
      eventname,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status
    } = req.body

    const { rows } = await pool.query(
      `UPDATE Achievements 
     SET eventname = $1, 
         organizer = $2, 
         venu = $3, 
         startdate = $4, 
         enddate = $5, 
         rank = $6, 
         rankarea = $7, 
         task = $8, 
         solution = $9, 
         techstack = $10, 
         resources = $11, 
         photos = $12, 
         approval_status = $13
     WHERE achieveid = $14 
     RETURNING *`,
      [
        eventname,
        organizer,
        venu,
        startdate,
        enddate,
        rank,
        rankarea,
        task,
        solution,
        techstack,
        resources,
        photos,
        approval_status,
        achieveid
      ]
    )

    if (rows.length === 0) {
      throw new CustomError("Achievement not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update achievement` }
)

const updateAchievementStatus = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params // Get the achievement ID from the URL parameters
    const { approval_status } = req.body // Extract the new approval status from the request body

    if (approval_status === undefined) {
      throw new CustomError("approval_status is required", 400) // Ensure `approval_status` is provided
    }

    const { rows } = await pool.query(
      // Only update `approval_status`
      `UPDATE Achievements 
     SET approval_status = $1 
     WHERE achieveid = $2 
     RETURNING *`,
      [approval_status, achieveid]
    )

    if (rows.length === 0) {
      throw new CustomError("Achievement not found", 404) // Handle case where no achievement is found
    }

    res.json(rows[0]) // Respond with the updated record
  },
  { statusCode: 500, message: `Couldn't update approval status` }
)

// Delete an achievement
const deleteAchievement = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params
    const {
      rowCount
    } = await pool.query("DELETE FROM Achievements WHERE achieveid = $1", [
      achieveid
    ])

    if (rowCount === 0) {
      throw new CustomError("Achievement not found", 404)
    }

    res.json({ message: "Achievement deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete achievement` }
)

// custom api's

const getUserAchievements = errorWrapper(
  async (req, res) => {
    const { userid } = req.params

    // Query to get achievements of the user
    const achievementsQuery = `
        SELECT
            a.achieveid,
            a.teamid,
            t.teamname,
            t.mentor,
            a.eventname,
            a.segment,
            a.organizer,
            a.venu,
            a.startdate,
            a.enddate,
            a.rank,
            a.rankarea,
            a.task,
            a.solution,
            a.techstack,
            a.resources,
            a.photos,
            a.approval_status,
            (
                SELECT json_agg(json_build_object('userid', u.userid, 'fullname', u.fullname, 'session', u.session))
                FROM TeamMembers tm
                JOIN Users u ON tm.userid = u.userid
                WHERE tm.teamid = a.teamid
            ) AS teamMembers
        FROM
            Achievements a
        JOIN
            TeamMembers tm ON a.teamid = tm.teamid
        JOIN
            Teams t ON a.teamid = t.teamid
        WHERE
            tm.userid = $1;
    `

    const { rows } = await pool.query(achievementsQuery, [userid])

    res.json({ achievement: rows })
  },
  {
    statusCode: 500,
    message: `Couldn't retrieve achievements`
  }
)

const getAchievementsAll = errorWrapper(
  async (req, res) => {
    // Query to get achievements of all users
    const achievementsQuery = `
    SELECT DISTINCT ON (a.achieveid)
        a.achieveid,
        a.teamid,
        t.teamname,
        t.mentor,
        a.eventname,
        a.segment,
        a.organizer,
        a.venu,
        a.startdate,
        a.enddate,
        a.rank,
        a.rankarea,
        a.task,
        a.solution,
        a.techstack,
        a.resources,
        a.photos,
        a.approval_status,
        (
            SELECT json_agg(json_build_object('userid', u.userid, 'fullname', u.fullname, 'session', u.session))
            FROM TeamMembers tm
            JOIN Users u ON tm.userid = u.userid
            WHERE tm.teamid = a.teamid
        ) AS teamMembers
    FROM
        Achievements a
    JOIN
        TeamMembers tm ON a.teamid = tm.teamid
    JOIN
        Teams t ON a.teamid = t.teamid
    WHERE
        a.achieveid >= 0;
`

    const { rows } = await pool.query(achievementsQuery)

    res.json({ achievements: rows })
  },
  {
    statusCode: 500,
    message: "Couldn't retrieve achievements"
  }
)

const getApprovedAchievements = errorWrapper(
  async (req, res) => {
    // Query to get all achievements with approval_status true
    const achievementsQuery = `
    SELECT DISTINCT ON (a.achieveid)
        a.achieveid,
        a.teamid,
        t.teamname,
        t.mentor,
        a.eventname,
        a.segment,
        a.organizer,
        a.venu,
        a.startdate,
        a.enddate,
        a.rank,
        a.rankarea,
        a.task,
        a.solution,
        a.techstack,
        a.resources,
        a.photos,
        a.approval_status,
        (
            SELECT json_agg(json_build_object('userid', u.userid, 'fullname', u.fullname, 'session', u.session))
            FROM TeamMembers tm
            JOIN Users u ON tm.userid = u.userid
            WHERE tm.teamid = a.teamid
        ) AS teamMembers
    FROM
        Achievements a
    JOIN
        TeamMembers tm ON a.teamid = tm.teamid
    JOIN
        Teams t ON a.teamid = t.teamid
    WHERE
        a.approval_status = true  -- Filter achievements with approval_status true
    ORDER BY
        a.achieveid;  -- Order by achievement ID
`

    const { rows } = await pool.query(achievementsQuery)

    res.json({ achievements: rows })
  },
  {
    statusCode: 500,
    message: "Couldn't retrieve approved achievements"
  }
)

// interface TeamMember {
//     userid?: number;
//     othermember?: string;
//     other_member_institute?: string;
// }

const createTeams = async (teamname, mentor) => {
  console.log("Inserting into Teams table...")
  const {
    rows
  } = await pool.query(
    "INSERT INTO Teams (teamname, mentor) VALUES ($1, $2) RETURNING *",
    [teamname, mentor]
  )

  if (rows.length === 0) {
    throw new CustomError("Could not create team", 500)
  }

  const teamid = rows[0].teamid
  console.log("Team created with ID:", teamid)
  return teamid // Ensure teamid is returned as a number
}

// Function to add team members
const insertTeamMembers = async (teamid, teammembers, others) => {
  const memberQueries = []

  // Insert team members (users)
  if (teammembers && Array.isArray(teammembers)) {
    for (let i = 0; i < teammembers.length; i++) {
      const userid = teammembers[i]
      const columns = ["teamid", "userid"]
      const values = [teamid, userid]
      const placeholders = ["$1", `$2`]
      const query = `INSERT INTO TeamMembers (${columns.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) RETURNING *`
      memberQueries.push(pool.query(query, values)) // Push each query to the array
    }
  }

  // Insert other members (non-users)
  if (others && Array.isArray(others)) {
    for (let i = 0; i < others.length; i++) {
      const { othermember, other_member_institute } = others[i]
      const columns = ["teamid", "othermember", "other_member_institute"]
      const values = [teamid, othermember, other_member_institute]
      const placeholders = ["$1", `$2`, `$3`]
      const query = `INSERT INTO TeamMembers (${columns.join(
        ", "
      )}) VALUES (${placeholders.join(", ")}) RETURNING *`
      memberQueries.push(pool.query(query, values)) // Push each query to the array
    }
  }

  // Execute all queries concurrently
  const results = await Promise.all(memberQueries)

  // Return inserted members
  return results.map(result => result.rows[0])
}

// Function to add achievement
const addAchievement = async (
  client,
  teamid,
  eventname,
  segment,
  organizer,
  venu,
  startdate,
  enddate,
  rank,
  rankarea,
  task,
  solution,
  techstack,
  resources,
  photos,
  approval_status
) => {
  console.log("Inserting into Achievements table...")
  const { rows } = await client.query(
    `INSERT INTO Achievements 
        (teamid, eventname, segment, organizer, venu, startdate, enddate, rank, 
        rankarea, task, solution, techstack, resources, photos, approval_status) 
     VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
     RETURNING *`,
    [
      teamid,
      eventname,
      segment,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status
    ]
  )

  if (rows.length === 0) {
    throw new CustomError("Could not create achievement", 500)
  }

  console.log("Achievement created with ID:", rows[0].achieveid)
  return rows[0] // Ensure the returned value is of the correct type
}

const createTeamAndAchievement = async (req, res) => {
  const client = await pool.connect()
  try {
    const {
      teamname,
      mentor,
      teammembers,
      others,
      eventname,
      segment,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status
    } = req.body

    console.log("Starting the transaction...")

    // Step 1: Create Team
    const teamid = await createTeams(teamname, mentor) // Returns a number (teamid)

    // Step 2: Add Team Members
    await insertTeamMembers(teamid, teammembers, others)

    // Step 3: Add Achievement
    const achievement = await addAchievement(
      client,
      teamid,
      eventname,
      segment,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status
    )

    await client.query("COMMIT")
    console.log("Transaction committed successfully.")

    // Return the created team and achievement
    res.status(201).json({
      team: { teamid, teamname, mentor },
      achievement
    })
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Error during the transaction:", error)
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message })
    } else {
      res.status(500).json({ error: "Could not complete the transaction" })
    }
  } finally {
    client.release()
    console.log("Database client released.")
  }
}


module.exports = {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getAllTeamMembers,
  getTeamMembersByTeamId,
  removeTeamMember,
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  getUserAchievements,
  createTeamAndAchievement,
  getAchievementsAll,
  updateAchievementStatus,
  getApprovedAchievements
};
