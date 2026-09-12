const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const userService = require("../services/userService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

const updateUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    if (Number(userId) !== req.jwtPayload.userid) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to update this profile."
      });
    }

    try {
      const hasAllowed = Object.keys(updates).some(k => userService.ALLOWED_UPDATE_FIELDS.includes(k));
      if (!hasAllowed) {
        return res.status(400).json({
          message: "No valid fields provided for update."
        });
      }

      const updatedUser = await userService.updateUserFields(userId, updates);

      if (!updatedUser) {
        throw new CustomError("User not found", 404);
      }

      await logActivity({
        req,
        action: ActivityAction.USER_PROFILE_UPDATED,
        category: "user",
        targetType: "user",
        targetId: userId,
        description: `User profile updated for user ID: ${userId}`,
        metadata: { updated_fields: Object.keys(updates).filter(k => userService.ALLOWED_UPDATE_FIELDS.includes(k)) }
      });

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof CustomError) throw error;
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Error updating user" });
    }
  },
  { statusCode: 500, message: `Couldn't update user` }
);

const getAllUsers = errorWrapper(
  async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users with roles:", error);
      res.status(500).json({ message: `Couldn't get Users` });
    }
  },
  { statusCode: 500, message: `Couldn't get Users` }
);

const getUserById = errorWrapper(
  async (req, res) => {
    const { userId } = req.params;
    const user = await userService.getUserProfileById(userId);

    if (!user) {
      throw new CustomError("User not found", 404);
    }

    res.json(user);
  },
  { statusCode: 500, message: `Couldn't get User by UserId` }
);

const deleteUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.params;
    const rowCount = await userService.deleteUser(userId);

    if (rowCount === 0) {
      throw new CustomError("User not found", 404);
    }

    await logActivity({
      req,
      action: ActivityAction.USER_DELETED,
      category: "user",
      targetType: "user",
      targetId: userId,
      description: `Deleted user ID: ${userId}`,
    });

    res.json({ message: "User deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete User` }
);

const deleteMultipleUser = errorWrapper(
  async (req, res) => {
    const { userId } = req.body;

    if (!Array.isArray(userId) || userId.length === 0) {
      throw new CustomError("No user IDs provided", 400);
    }

    const hasAccess = await userService.checkMembersAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      return res.status(403).json({
        message: "Access denied. You do not have permission to delete member(s)."
      });
    }

    const rowCount = await userService.deleteMultipleUsers(userId);

    if (rowCount === 0) {
      throw new CustomError("No users found to delete", 404);
    }

    await logActivity({
      req,
      action: ActivityAction.USER_BULK_DELETED,
      category: "user",
      description: `Bulk deleted ${rowCount} user(s)`,
      metadata: { deleted_userids: userId }
    });

    res.json({
      message: `${rowCount} user(s) deleted successfully`
    });
  },
  { statusCode: 500, message: `Couldn't delete multiple Users` }
);

const roleAccess = errorWrapper(
  async (req, res) => {
    const userid = req.jwtPayload.userid;
    const access = await userService.getRoleAccess(userid);

    if (!access) {
      return res.status(404).json({ message: "User or role not found" });
    }

    res.json(access);
  },
  { statusCode: 500, message: `Couldn't fetch user role access` }
);

module.exports = {
  deleteMultipleUser,
  deleteUser,
  getAllUsers,
  getUserById,
  roleAccess,
  updateUser
};
