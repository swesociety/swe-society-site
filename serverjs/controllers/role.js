const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const {
  createBillingACL,
  updateBillingACL,
  formatBillingACL,
} = require("../services/billingAclService.js");
const pool = require("../db/dbconnect.js").pool;
const { logActivity } = require("../services/activityLogService.js");

const getAllRole = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query(`
      SELECT
        r.*,
        row_to_json(b) AS billingacl
      FROM Roles r
      LEFT JOIN BillingACL b ON r.billingaclid = b.billingaclid
    `)
    const formatted = rows.map((r) => ({
      ...r,
      billingacl: formatBillingACL(r.billingacl)
    }))
    res.json(formatted)
  },
  {
    statusCode: 500,
    message: "Couldn't get roles"
  }
)

const getRoleById = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params

    const { rows } = await pool.query(
      `SELECT
         r.*,
         row_to_json(b) AS billingacl
       FROM Roles r
       LEFT JOIN BillingACL b ON r.billingaclid = b.billingaclid
       WHERE r.roleid = $1`,
      [roleid]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Role not found." })
    }

    const role = rows[0]
    role.billingacl = formatBillingACL(role.billingacl)

    res.json(role)
  },
  { statusCode: 500, message: "Couldn't get role by ID." }
)

const createRole = errorWrapper(
  async (req, res) => {
    const {
      roletitle,
      blogaccess = false,
      achievementaccess = false,
      bulkmailaccess = false,
      eventaccess = false,
      ecaccess = false,
      landingpageaccess = false,
      membersaccess = false,
      noticeaccess = false,
      rolesaccess = false,
      statisticsaccess = false,
      isdefaultrole = false,
      achievementmanageaccess = false,
      userblogaccess = false,
      billingaccess = false,
      standingsaccess = false,
      activitylogaccess = false,
      // BillingACL fields (optional, defaults to all-false if omitted)
      billingacl
    } = req.body

    // Access Check
    const {
      rows: accessCheckRows
    } = await pool.query(
      `SELECT rolesAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
      [req.jwtPayload.userid]
    )

    if (accessCheckRows.length === 0 || !accessCheckRows[0].rolesaccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      })
    }

    if (isdefaultrole) {
      const { rowCount } = await pool.query(
        `SELECT 1 FROM Roles WHERE isDefaultRole = true`
      )
      if (rowCount && rowCount > 0) {
        return res
          .status(400)
          .json({ message: "Only one default role is allowed." })
      }
    }

    // Insert BillingACL row first
    const acl = await createBillingACL(billingacl)
    const billingaclid = acl.billingaclid

    // Insert Role with billingaclid
    const { rows } = await pool.query(
      `INSERT INTO Roles (
        roletitle,
        blogAccess,
        achievementAccess,
        bulkmailAccess,
        eventAccess,
        ecAccess,
        landingpageAccess,
        membersAccess,
        noticeAccess,
        rolesAccess,
        statisticsAccess,
        isDefaultRole,
        achievementmanageaccess,
        userblogaccess,
        billingaccess,
        standingsaccess,
        activitylogaccess,
        billingaclid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        roletitle,
        Boolean(blogaccess),
        Boolean(achievementaccess),
        Boolean(bulkmailaccess),
        Boolean(eventaccess),
        Boolean(ecaccess),
        Boolean(landingpageaccess),
        Boolean(membersaccess),
        Boolean(noticeaccess),
        Boolean(rolesaccess),
        Boolean(statisticsaccess),
        Boolean(isdefaultrole),
        Boolean(achievementmanageaccess),
        Boolean(userblogaccess),
        Boolean(billingaccess),
        Boolean(standingsaccess),
        Boolean(activitylogaccess),
        billingaclid
      ]
    )

    // Return role with its ACL
    const created = {
      ...rows[0],
      billingacl: formatBillingACL(acl)
    }

    await logActivity({
      req,
      action: "role.create",
      category: "role",
      targetType: "role",
      targetId: rows[0].roleid,
      description: `Created role: ${roletitle}`,
      metadata: { roletitle, isdefaultrole }
    });

    res.status(201).json(created)
  },
  { statusCode: 500, message: "Failed to create role." }
)

const updateRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params
    const {
      roletitle,
      blogaccess = false,
      achievementaccess = false,
      bulkmailaccess = false,
      eventaccess = false,
      ecaccess = false,
      landingpageaccess = false,
      membersaccess = false,
      noticeaccess = false,
      rolesaccess = false,
      statisticsaccess = false,
      achievementmanageaccess = false,
      userblogaccess = false,
      billingaccess = false,
      standingsaccess = false,
      activitylogaccess = false,
      billingacl
    } = req.body

    const {
      rows: accessCheckRows
    } = await pool.query(
      `SELECT rolesAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
      [req.jwtPayload.userid]
    )

    if (accessCheckRows.length === 0 || !accessCheckRows[0].rolesaccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to update roles."
      })
    }

    // ── Handle BillingACL upsert ─────────────────────────────────
    if (billingacl !== undefined) {
      // Get the current billingaclid for this role
      const { rows: roleRows } = await pool.query(
        `SELECT billingaclid FROM Roles WHERE roleid = $1`,
        [roleid]
      )

      if (roleRows.length === 0) {
        return res.status(404).json({ message: "Role not found." })
      }

      const existingAclId = roleRows[0].billingaclid

      if (existingAclId) {
        await updateBillingACL(existingAclId, billingacl)
      } else {
        const newAcl = await createBillingACL(billingacl)
        await pool.query(
          `UPDATE Roles SET billingaclid = $1 WHERE roleid = $2`,
          [newAcl.billingaclid, roleid]
        )
      }
    }
    // ── End BillingACL upsert ────────────────────────────────────

    const { rows } = await pool.query(
      `UPDATE Roles SET
        roletitle               = $1,
        blogAccess              = $2,
        achievementAccess       = $3,
        bulkmailAccess          = $4,
        eventAccess             = $5,
        ecAccess                = $6,
        landingpageAccess       = $7,
        membersAccess           = $8,
        noticeAccess            = $9,
        rolesAccess             = $10,
        statisticsAccess        = $11,
        achievementmanageaccess = $12,
        userblogaccess          = $13,
        billingaccess           = $14,
        standingsaccess         = $15,
        activitylogaccess       = $16
       WHERE roleid = $17
       RETURNING *`,
      [
        roletitle,
        Boolean(blogaccess),
        Boolean(achievementaccess),
        Boolean(bulkmailaccess),
        Boolean(eventaccess),
        Boolean(ecaccess),
        Boolean(landingpageaccess),
        Boolean(membersaccess),
        Boolean(noticeaccess),
        Boolean(rolesaccess),
        Boolean(statisticsaccess),
        Boolean(achievementmanageaccess),
        Boolean(userblogaccess),
        Boolean(billingaccess),
        Boolean(standingsaccess),
        Boolean(activitylogaccess),
        roleid
      ]
    )

    if (rows.length === 0) {
      return res.status(404).json({ message: "Role not found." })
    }

    // Return updated role with its ACL
    const { rows: aclResult } = await pool.query(
      `SELECT row_to_json(b) AS billingacl FROM BillingACL b WHERE billingaclid = $1`,
      [rows[0].billingaclid]
    )

    await logActivity({
      req,
      action: "role.update",
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Updated role ${roletitle} (ID: ${roleid})`,
    });

    res.json({
      ...rows[0],
      billingacl: formatBillingACL(aclResult[0]?.billingacl ?? null)
    })
  },
  { statusCode: 500, message: "Failed to update role." }
)

const deleteRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params

    //   Check if the super role
    if (roleid === "1") {
      return res.status(400).json({ message: "Cannot delete the super role." })
    }
    // Check if the role is default
    const {
      rows: defaultCheckRows
    } = await pool.query(`SELECT isDefaultRole FROM Roles WHERE roleid = $1`, [
      roleid
    ])
    if (defaultCheckRows.length === 0) {
      return res.status(404).json({ message: "Role not found." })
    }
    if (defaultCheckRows[0].isDefaultRole) {
      return res
        .status(400)
        .json({ message: "Cannot delete the default role." })
    }

    // Access check
    const {
      rows: accessCheckRows
    } = await pool.query(
      `SELECT rolesAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
      [req.jwtPayload.userid]
    )

    if (accessCheckRows.length === 0 || !accessCheckRows[0].rolesaccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      })
    }

    // Find default role ID
    const { rows: defaultRoleRows } = await pool.query(
      `SELECT roleid FROM Roles WHERE isDefaultRole = true`
    )
    if (defaultRoleRows.length === 0) {
      return res
        .status(500)
        .json({ message: "No default role found for reassignment." })
    }
    const defaultRoleId = defaultRoleRows[0].roleid

    // Update users with this role to the default role
    await pool.query(`UPDATE Users SET roleid = $1 WHERE roleid = $2`, [
      defaultRoleId,
      roleid
    ])

    // Delete the role
    await pool.query(`DELETE FROM Roles WHERE roleid = $1`, [roleid])

    await logActivity({
      req,
      action: "role.delete",
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Deleted role ID ${roleid}`,
    });

    res.status(204).json({ message: "Delete role successfully" })
  },
  { statusCode: 500, message: "Failed to delete role." }
)

const updateDefaultRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params

    // Access check
    const {
      rows: accessCheckRows
    } = await pool.query(
      `SELECT rolesAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
      [req.jwtPayload.userid]
    )

    if (accessCheckRows.length === 0 || !accessCheckRows[0].rolesaccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      })
    }

    try {
      // Start transaction
      await pool.query("BEGIN")

      // Set isDefaultRole = false for the current default role
      await pool.query(
        `UPDATE Roles SET isDefaultRole = false WHERE isDefaultRole = true`
      )

      // Set isDefaultRole = true for the specified role
      const {
        rows
      } = await pool.query(
        `UPDATE Roles SET isDefaultRole = true WHERE roleid = $1 RETURNING *`,
        [roleid]
      )

      if (rows.length === 0) {
        await pool.query("ROLLBACK") // Rollback transaction on failure
        return res.status(404).json({ message: "Role not found." })
      }

      // Commit the transaction
      await pool.query("COMMIT")

      await logActivity({
        req,
        action: "role.set_default",
        category: "role",
        targetType: "role",
        targetId: roleid,
        description: `Set role ID ${roleid} as default role`,
      });

      res.json(rows[0])
    } catch (error) {
      await pool.query("ROLLBACK") // Rollback transaction on error
      res.status(500).json({
        message: "Failed to update default role.",
        details: error
      })
    }
  },
  { statusCode: 500, message: "Failed to update default role." }
)

const getRoleInfo = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query(`
    SELECT 
      Roles.roleid, 
      Roles.roletitle, 
      Roles.isDefaultRole,
      COUNT(Users.userid) AS user_count
    FROM Roles
    LEFT JOIN Users ON Roles.roleid = Users.roleid
    GROUP BY Roles.roleid
    ORDER BY user_count DESC
  `)
    res.json(rows)
  },
  {
    statusCode: 500,
    message: "Couldn't get role information"
  }
)

const assignRole = errorWrapper(
  async (req, res) => {
    const { roleid, userIds } = req.body

    // Validate request body
    if (!Array.isArray(userIds) || !roleid) {
      return res.status(400).json({
        message:
          "Invalid request. Please provide a valid roleid and an array of userIds."
      })
    }

    try {
      // Check if the user has permission to assign roles
      const { rows: accessCheckRows } = await pool.query(
        `SELECT rolesAccess 
     FROM Roles 
     JOIN Users ON Roles.roleid = Users.roleid 
     WHERE Users.userid = $1`,
        [req.jwtPayload.userid]
      )

      if (accessCheckRows.length === 0 || !accessCheckRows[0].rolesaccess) {
        return res.status(403).json({
          message: "Access denied. You do not have permission to assign roles."
        })
      }

      // Check if the role exists
      const {
        rows: roleCheckRows
      } = await pool.query("SELECT 1 FROM Roles WHERE roleid = $1", [roleid])

      if (roleCheckRows.length === 0) {
        return res.status(404).json({
          message: `Role with id ${roleid} does not exist.`
        })
      }

      const {
        rowCount
      } = await pool.query(
        `UPDATE Users SET roleid =$1 WHERE userid = ANY($2)`,
        [roleid, userIds]
      )
      if (rowCount === 0) {
        throw new CustomError("No users found to delete", 404)
      }

      await logActivity({
        req,
        action: "role.assign",
        category: "role",
        targetType: "role",
        targetId: roleid,
        description: `Assigned role ID ${roleid} to ${rowCount} user(s)`,
        metadata: { roleid, userIds }
      });

      res.json({
        message: `${rowCount} user(s) role updated successfully`
      })
    } catch (error) {
      console.error("Error during role assignment:", error)
      return res.status(500).json({
        message: "An error occurred while assigning roles."
      })
    }
  },
  { statusCode: 500, message: "Couldn't assign roles" }
)

module.exports = {
  createRole,
  deleteRole,
  getAllRole,
  getRoleById,
  getRoleInfo,
  updateDefaultRole,
  updateRole,
  assignRole
}
