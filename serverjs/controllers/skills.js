const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;


// Create a new skill
const createSkill = errorWrapper(
  async (req, res) => {
    const { skill, area } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO Skills (skill, area) VALUES ($1, $2) RETURNING *",
      [skill, area]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create skill` }
)

// Get all skills
const getAllSkills = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM Skills")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get skills` }
)

// Update a skill
const updateSkill = errorWrapper(
  async (req, res) => {
    const { skillId } = req.params
    const { skill, area } = req.body

    const {
      rows
    } = await pool.query(
      "UPDATE Skills SET skill = $1, area = $2 WHERE skill_id = $3 RETURNING *",
      [skill, area, skillId]
    )

    if (rows.length === 0) {
      throw new CustomError("Skill not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update skill` }
)

// Delete a skill
const deleteSkill = errorWrapper(
  async (req, res) => {
    const { skillId } = req.params
    const {
      rowCount
    } = await pool.query("DELETE FROM Skills WHERE skill_id = $1", [skillId])

    if (rowCount === 0) {
      throw new CustomError("Skill not found", 404)
    }

    res.json({ message: "Skill deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete skill` }
)

// Create a new userSkill
const createUserSkill = errorWrapper(
  async (req, res) => {
    const { userid, skill_id } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO UserSkills (userid, skill_id) VALUES ($1, $2) RETURNING *",
      [userid, skill_id]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create user skill` }
)

// Get all user skills
const getAllUserSkills = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM UserSkills")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get user skills` }
)

// Update a userSkill
const updateUserSkill = errorWrapper(
  async (req, res) => {
    const { userSkillId } = req.params
    const { userid, skill_id } = req.body

    const {
      rows
    } = await pool.query(
      "UPDATE UserSkills SET userid = $1, skill_id = $2 WHERE userskillid = $3 RETURNING *",
      [userid, skill_id, userSkillId]
    )

    if (rows.length === 0) {
      throw new CustomError("User skill not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update user skill` }
)

// Delete a userSkill
const deleteUserSkill = errorWrapper(
  async (req, res) => {
    const { userSkillId } = req.params
    const {
      rowCount
    } = await pool.query("DELETE FROM UserSkills WHERE userskillid = $1", [
      userSkillId
    ])

    if (rowCount === 0) {
      throw new CustomError("User skill not found", 404)
    }

    res.json({ message: "User skill deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete user skill` }
)

// custom Apis

const getUserSkills = errorWrapper(
  async (req, res) => {
    const { userid } = req.params

    const { rows } = await pool.query(
      `SELECT s.skill_id, s.skill 
     FROM Skills s 
     JOIN UserSkills us ON s.skill_id = us.skill_id 
     WHERE us.userid = $1`,
      [userid]
    )

    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get user skills` }
)

const addUserMultipleSkills = errorWrapper(
  async (req, res) => {
    const { userid, skills } = req.body

    // Prepare query to ignore existing (userid, skill_id) pairs
    const insertQuery = `
        INSERT INTO UserSkills (userid, skill_id)
        SELECT $1, unnest($2::int[])
        ON CONFLICT (userid, skill_id) DO NOTHING
        RETURNING skill_id;
    `

    const { rows: insertedSkills } = await pool.query(insertQuery, [
      userid,
      skills
    ])

    // Fetch the inserted skills to return their details
    if (insertedSkills.length > 0) {
      const skillIds = insertedSkills.map(skill => skill.skill_id)
      const {
        rows: skillDetails
      } = await pool.query(
        "SELECT skill_id, skill FROM Skills WHERE skill_id = ANY($1::int[])",
        [skillIds]
      )
      res.status(201).json(skillDetails)
    } else {
      res.status(204).json({ message: "No new skills were added." })
    }
  },
  { statusCode: 500, message: `Couldn't add user skills` }
)

module.exports = {
  createSkill,
  getAllSkills,
  updateSkill,
  deleteSkill,
  createUserSkill,
  getAllUserSkills,
  updateUserSkill,
  deleteUserSkill,
  getUserSkills,
  addUserMultipleSkills
}
