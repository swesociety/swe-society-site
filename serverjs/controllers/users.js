const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;

const updateUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.params
    const updates = req.body

    if (Number(userId) !== req.jwtPayload.userid) {
      return res.status(403).json({
        message:
          "Access denied. You do not have permission to update this profile."
      })
    }

    try {
      // List of allowed fields to update
      const allowedFields = [
        "bio",
        "blood_group",
        "college",
        "cv",
        "email",
        "experience",
        "facebook_id",
        "fullname",
        "github_id",
        "hometown",
        "linkedin_id",
        "profile_picture",
        "projects",
        "school",
        "session",
        "skills",
        "stop_stalk_id",
        "whatsapp",
        "phone_number"
      ]

      // Build query dynamically
      const fields = []
      const values = []
      let index = 1

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = $${index}`)
          values.push(value)
          index++
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({
          message: "No valid fields provided for update."
        })
      }

      const query = `
      UPDATE Users
      SET ${fields.join(", ")}
      WHERE userId = $${index}
      RETURNING *;
    `

      values.push(userId) // Add userId as the final parameter

      const { rows } = await pool.query(query, values)

      if (rows.length === 0) {
        throw new CustomError("User not found", 404)
      }

      res.json(rows[0])
    } catch (error) {
      console.error("Error updating user:", error)
      res.status(500).json({ error: "Error updating user" })
    }
  },
  { statusCode: 500, message: `Couldn't update user` }
)

const getAllUsers = errorWrapper(
  async (req, res) => {
    try {
      const { rows } = await pool.query(`
      SELECT 
        u.userid,
        u.fullname,
        u.email,
        u.regno,
        u.session,
        r.roletitle AS role,
        u.profile_picture,
        u.bio,
        u.linkedin_id,
        u.github_id,
        u.stop_stalk_id,
        u.whatsapp,
        u.facebook_id,
        u.blood_group,
        u.school,
        u.college,
        u.hometown,
        u.cv,
        u.experience,
        u.projects,
        u.skills,
        u.is_alumni
      FROM Users u
      LEFT JOIN Roles r
      ON u.roleid = r.roleid
    `)

      res.json(rows)
    } catch (error) {
      console.error("Error fetching users with roles:", error)
      res.status(500).json({ message: `Couldn't get Users` })
    }
  },
  { statusCode: 500, message: `Couldn't get Users` }
)

const getUserById = errorWrapper(
  async (req, res) => {
    const { userId } = req.params
    const { rows } = await pool.query(
      `
  SELECT 
      u.userid,
      u.fullname,
      u.email,
      u.regno,
      u.session,
      r.roletitle AS role,
      u.profile_picture,
      u.bio,
      u.linkedin_id,
      u.github_id,
      u.stop_stalk_id,
      u.whatsapp,
      u.facebook_id,
      u.blood_group,
      u.school,
      u.college,
      u.hometown,
      u.cv,
      u.experience,
      u.projects,
      u.skills,
      u.is_alumni
    FROM Users u
    LEFT JOIN Roles r
    ON u.roleid = r.roleid WHERE userId = $1`,
      [userId]
    )

    if (rows.length === 0) {
      throw new CustomError("User not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get User by UserId` }
)

const deleteUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.params
    const { rowCount } = await pool.query(
      "DELETE FROM Users WHERE userId = $1",
      [userId]
    )

    if (rowCount === 0) {
      throw new CustomError("User not found", 404)
    }

    res.json({ message: "User deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete User` }
)

const deleteMultipleUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.body

    if (!Array.isArray(userId) || userId.length === 0) {
      throw new CustomError("No user IDs provided", 400)
    }

    // Access check
    const { rows: accessCheckRows } = await pool.query(
      `SELECT membersaccess 
   FROM Roles 
   JOIN Users ON Roles.roleid = Users.roleid 
   WHERE Users.userid = $1`,
      [req.jwtPayload.userid]
    )

    // Ensure permission exists and is granted
    if (accessCheckRows.length === 0 || !accessCheckRows[0].membersaccess) {
      return res.status(403).json({
        message:
          "Access denied. You do not have permission to delete member(s)."
      })
    }

    // Proceed with deletion
    const {
      rowCount
    } = await pool.query("DELETE FROM Users WHERE userId = ANY($1::int[])", [
      userId
    ])

    if (rowCount === 0) {
      throw new CustomError("No users found to delete", 404)
    }

    res.json({
      message: `${rowCount} user(s) deleted successfully`
    })
  },
  { statusCode: 500, message: `Couldn't delete multiple Users` }
)

const roleAccess = errorWrapper(
  async (req, res) => {
    const userid = req.jwtPayload.userid

    // Query to fetch the user's role and access permissions
    const { rows } = await pool.query(
      `SELECT 
    blogaccess AS blog,
    achievementaccess AS achievement,
    achievementmanageaccess AS achievementmanage,
    bulkmailaccess AS bulkmail,
    eventaccess AS events,
    ecaccess AS ec,
    landingpageaccess AS landingpage,
    membersaccess AS member,
    noticeaccess AS notice,
    rolesaccess AS roles,
    userblogaccess AS usersblog,
    billingmanageaccess AS billingmanage,
    billingaccess AS billing,
    statisticsaccess AS statistics
 FROM Roles 
 JOIN Users ON Roles.roleid = Users.roleid 
 WHERE Users.userid = $1`,
      [userid]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "User or role not found" })
    }

    const access = {
      statistics: rows[0].statistics || false,
      achievement: rows[0].achievement || false,
      achievementmanage: rows[0].achievementmanage || false,
      blog: rows[0].blog || false,
      member: rows[0].member || false,
      notice: rows[0].notice || false,
      bulkmail: rows[0].bulkmail || false,
      landingpage: rows[0].landingpage || false,
      events: rows[0].events || false,
      ec: rows[0].ec || false,
      roles: rows[0].roles || false,
      usersblog: rows[0].usersblog || false,
      billingmanage: rows[0].billingmanage || false,
      billing: rows[0].billing || false
    }

    res.json(access)
  },
  { statusCode: 500, message: `Couldn't fetch user role access` }
)

module.exports = {
  deleteMultipleUser,
  deleteUser,
  getAllUsers,
  getUserById,
  roleAccess,
  updateUser
}
