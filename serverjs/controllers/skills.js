const errorWrapper = require("../middlewares/errorWrapper.js");
const skillService = require("../services/skillService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

// Create a new skill
const createSkill = errorWrapper(
  async (req, res) => {
    const { skill, area } = req.body;
    const result = await skillService.createSkill(skill, area);

    await logActivity({
      req,
      action: ActivityAction.SKILL_CREATED,
      category: "skill",
      targetType: "skill",
      targetId: result.skill_id,
      description: `Created skill: ${skill} (area: ${area})`,
      metadata: { skill, area },
    });

    res.status(201).json(result);
  },
  { statusCode: 500, message: `Couldn't create skill` }
);

// Get all skills
const getAllSkills = errorWrapper(
  async (req, res) => {
    const result = await skillService.getAllSkills();
    res.json(result);
  },
  { statusCode: 500, message: `Couldn't get skills` }
);

// Update a skill
const updateSkill = errorWrapper(
  async (req, res) => {
    const { skillId } = req.params;
    const { skill, area } = req.body;
    const result = await skillService.updateSkill(skillId, skill, area);

    await logActivity({
      req,
      action: ActivityAction.SKILL_UPDATED,
      category: "skill",
      targetType: "skill",
      targetId: skillId,
      description: `Updated skill ID: ${skillId} — ${skill}`,
      metadata: { skill, area },
    });

    res.json(result);
  },
  { statusCode: 500, message: `Couldn't update skill` }
);

const deleteSkill = errorWrapper(
  async (req, res) => {
    const { skillId } = req.params;
    await skillService.deleteSkill(skillId);

    await logActivity({
      req,
      action: ActivityAction.SKILL_DELETED,
      category: "skill",
      targetType: "skill",
      targetId: skillId,
      description: `Deleted skill ID: ${skillId}`,
    });

    res.json({ message: "Skill deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete skill` }
);

// Create a new userSkill
const createUserSkill = errorWrapper(
  async (req, res) => {
    const { userid, skill_id } = req.body;
    const result = await skillService.createUserSkill(userid, skill_id);

    await logActivity({
      req,
      action: ActivityAction.USER_SKILL_ADDED,
      category: "skill",
      targetType: "user_skill",
      targetId: userid,
      description: `Added skill ID: ${skill_id} to user ID: ${userid}`,
      metadata: { userid, skill_id },
    });

    res.status(201).json(result);
  },
  { statusCode: 500, message: `Couldn't create user skill` }
);

// Get all user skills
const getAllUserSkills = errorWrapper(
  async (req, res) => {
    const result = await skillService.getAllUserSkills();
    res.json(result);
  },
  { statusCode: 500, message: `Couldn't get user skills` }
);

// Update a userSkill
const updateUserSkill = errorWrapper(
  async (req, res) => {
    const { userSkillId } = req.params;
    const { userid, skill_id } = req.body;
    const result = await skillService.updateUserSkill(userSkillId, userid, skill_id);

    await logActivity({
      req,
      action: ActivityAction.USER_SKILL_UPDATED,
      category: "skill",
      targetType: "user_skill",
      targetId: userSkillId,
      description: `Updated user skill ID: ${userSkillId} for user ID: ${userid}`,
      metadata: { userid, skill_id },
    });

    res.json(result);
  },
  { statusCode: 500, message: `Couldn't update user skill` }
);

const deleteUserSkill = errorWrapper(
  async (req, res) => {
    const { userSkillId } = req.params;
    await skillService.deleteUserSkill(userSkillId);

    await logActivity({
      req,
      action: ActivityAction.USER_SKILL_DELETED,
      category: "skill",
      targetType: "user_skill",
      targetId: userSkillId,
      description: `Deleted user skill ID: ${userSkillId}`,
    });

    res.json({ message: "User skill deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete user skill` }
);

// custom Apis

const getUserSkills = errorWrapper(
  async (req, res) => {
    const { userid } = req.params;
    const result = await skillService.getUserSkills(userid);
    res.json(result);
  },
  { statusCode: 500, message: `Couldn't get user skills` }
);

const addUserMultipleSkills = errorWrapper(
  async (req, res) => {
    const { userid, skills } = req.body;
    const { insertedSkills, skillDetails } = await skillService.addUserMultipleSkills(userid, skills);

    if (insertedSkills.length > 0) {
      const skillIds = insertedSkills.map(skill => skill.skill_id);

      await logActivity({
        req,
        action: ActivityAction.USER_SKILL_BULK_ADDED,
        category: "skill",
        targetType: "user_skill",
        targetId: userid,
        description: `Bulk added ${insertedSkills.length} skill(s) to user ID: ${userid}`,
        metadata: { userid, added_skill_ids: skillIds },
      });

      res.status(201).json(skillDetails);
    } else {
      res.status(204).json({ message: "No new skills were added." });
    }
  },
  { statusCode: 500, message: `Couldn't add user skills` }
);

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
};
