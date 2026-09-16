const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const roleService = require("../services/roleService.js");
const {
  createBillingACL,
  updateBillingACL,
  formatBillingACL,
} = require("../services/billingAclService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

const getAllRole = errorWrapper(
  async (req, res) => {
    const rows = await roleService.getAllRoles();
    const formatted = rows.map((r) => ({
      ...r,
      billingacl: formatBillingACL(r.billingacl)
    }));
    res.json(formatted);
  },
  {
    statusCode: 500,
    message: "Couldn't get roles"
  }
);

const getRoleById = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params;
    const role = await roleService.getRoleById(roleid);

    if (!role) {
      return res.status(404).json({ message: "Role not found." });
    }

    role.billingacl = formatBillingACL(role.billingacl);
    res.json(role);
  },
  { statusCode: 500, message: "Couldn't get role by ID." }
);

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
      billingacl
    } = req.body;

    const hasAccess = await roleService.checkRolesAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      });
    }

    if (isdefaultrole) {
      const conflict = await roleService.isDefaultRoleConflict();
      if (conflict) {
        return res
          .status(400)
          .json({ message: "Only one default role is allowed." });
      }
    }

    const acl = await createBillingACL(billingacl);
    const billingaclid = acl.billingaclid;

    const createdRole = await roleService.insertRole({
      roletitle,
      blogaccess,
      achievementaccess,
      bulkmailaccess,
      eventaccess,
      ecaccess,
      landingpageaccess,
      membersaccess,
      noticeaccess,
      rolesaccess,
      statisticsaccess,
      isdefaultrole,
      achievementmanageaccess,
      userblogaccess,
      billingaccess,
      standingsaccess,
      activitylogaccess,
      billingaclid
    });

    const created = {
      ...createdRole,
      billingacl: formatBillingACL(acl)
    };

    await logActivity({
      req,
      action: ActivityAction.ROLE_CREATED,
      category: "role",
      targetType: "role",
      targetId: createdRole.roleid,
      description: `Created role: ${roletitle}`,
      metadata: { roletitle, isdefaultrole }
    });

    res.status(201).json(created);
  },
  { statusCode: 500, message: "Failed to create role." }
);

const updateRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params;
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
    } = req.body;

    const hasAccess = await roleService.checkRolesAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to update roles."
      });
    }

    if (billingacl !== undefined) {
      const roleRow = await roleService.getRoleBillingAclId(roleid);
      if (!roleRow) {
        return res.status(404).json({ message: "Role not found." });
      }

      const existingAclId = roleRow.billingaclid;
      if (existingAclId) {
        await updateBillingACL(existingAclId, billingacl);
      } else {
        const newAcl = await createBillingACL(billingacl);
        await roleService.updateRoleBillingAclId(roleid, newAcl.billingaclid);
      }
    }

    const updatedRole = await roleService.updateRoleById(roleid, {
      roletitle,
      blogaccess,
      achievementaccess,
      bulkmailaccess,
      eventaccess,
      ecaccess,
      landingpageaccess,
      membersaccess,
      noticeaccess,
      rolesaccess,
      statisticsaccess,
      achievementmanageaccess,
      userblogaccess,
      billingaccess,
      standingsaccess,
      activitylogaccess
    });

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found." });
    }

    const aclResult = await roleService.getAclForRole(updatedRole.billingaclid);

    await logActivity({
      req,
      action: ActivityAction.ROLE_UPDATED,
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Updated role: ${roletitle} (ID: ${roleid})`,
    });

    res.json({
      ...updatedRole,
      billingacl: formatBillingACL(aclResult)
    });
  },
  { statusCode: 500, message: "Failed to update role." }
);

const deleteRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params;

    if (roleid === "1") {
      return res.status(400).json({ message: "Cannot delete the super role." });
    }

    const defaultCheck = await roleService.isRoleDefault(roleid);
    if (!defaultCheck) {
      return res.status(404).json({ message: "Role not found." });
    }
    if (defaultCheck.isdefaultrole) {
      return res.status(400).json({ message: "Cannot delete the default role." });
    }

    const hasAccess = await roleService.checkRolesAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      });
    }

    const defaultRoleId = await roleService.getDefaultRoleId();
    if (!defaultRoleId) {
      return res.status(500).json({ message: "No default role found for reassignment." });
    }

    await roleService.reassignUsersToDefaultRole(roleid, defaultRoleId);
    await roleService.deleteRoleById(roleid);

    await logActivity({
      req,
      action: ActivityAction.ROLE_DELETED,
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Deleted role ID: ${roleid}`,
    });

    res.status(204).json({ message: "Delete role successfully" });
  },
  { statusCode: 500, message: "Failed to delete role." }
);

const updateDefaultRole = errorWrapper(
  async (req, res) => {
    const { roleid } = req.params;

    const hasAccess = await roleService.checkRolesAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to create roles."
      });
    }

    const result = await roleService.setNewDefaultRole(roleid);

    await logActivity({
      req,
      action: ActivityAction.ROLE_DEFAULT_CHANGED,
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Set role ID: ${roleid} as the default role`,
    });

    res.json(result);
  },
  { statusCode: 500, message: "Failed to update default role." }
);

const getRoleInfo = errorWrapper(
  async (req, res) => {
    const rows = await roleService.getRoleInfo();
    res.json(rows);
  },
  {
    statusCode: 500,
    message: "Couldn't get role information"
  }
);

const assignRole = errorWrapper(
  async (req, res) => {
    const { roleid, userIds } = req.body;

    if (!Array.isArray(userIds) || !roleid) {
      return res.status(400).json({
        message: "Invalid request. Please provide a valid roleid and an array of userIds."
      });
    }

    const hasAccess = await roleService.checkRolesAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to assign roles."
      });
    }

    const roleExists = await roleService.checkRoleExists(roleid);
    if (!roleExists) {
      return res.status(404).json({
        message: `Role with id ${roleid} does not exist.`
      });
    }

    const rowCount = await roleService.assignRoleToUsers(roleid, userIds);
    if (rowCount === 0) {
      throw new CustomError("No users found to delete", 404);
    }

    await logActivity({
      req,
      action: ActivityAction.ROLE_ASSIGNED,
      category: "role",
      targetType: "role",
      targetId: roleid,
      description: `Assigned role ID: ${roleid} to ${rowCount} user(s)`,
      metadata: { roleid, userIds }
    });

    res.json({
      message: `${rowCount} user(s) role updated successfully`
    });
  },
  { statusCode: 500, message: "Couldn't assign roles" }
);

module.exports = {
  createRole,
  deleteRole,
  getAllRole,
  getRoleById,
  getRoleInfo,
  updateDefaultRole,
  updateRole,
  assignRole
};
