const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");
const achievementSvc = require("../services/achievementService.js");

// ─── Teams ───────────────────────────────────────────────────────────────────

const createTeam = errorWrapper(
  async (req, res) => {
    const { teamname, mentor } = req.body;
    const team = await achievementSvc.createTeam(teamname, mentor);

    await logActivity({
      req,
      action: ActivityAction.TEAM_CREATED,
      category: "achievement",
      targetType: "team",
      targetId: team.teamid,
      description: `Created team: ${teamname}`,
      metadata: { teamname, mentor },
    });

    res.status(201).json(team);
  },
  { statusCode: 500, message: `Couldn't create team` }
);

const getAllTeams = errorWrapper(
  async (req, res) => {
    const teams = await achievementSvc.getAllTeams();
    res.json(teams);
  },
  { statusCode: 500, message: `Couldn't get teams` }
);

const updateTeam = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params;
    const { teamname, mentor } = req.body;
    const team = await achievementSvc.updateTeam(teamid, { teamname, mentor });

    await logActivity({
      req,
      action: ActivityAction.TEAM_UPDATED,
      category: "achievement",
      targetType: "team",
      targetId: teamid,
      description: `Updated team ID: ${teamid}`,
      metadata: { teamname, mentor },
    });

    res.json(team);
  },
  { statusCode: 500, message: `Couldn't update team` }
);

const deleteTeam = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params;
    await achievementSvc.deleteTeam(teamid);

    await logActivity({
      req,
      action: ActivityAction.TEAM_DELETED,
      category: "achievement",
      targetType: "team",
      targetId: teamid,
      description: `Deleted team ID: ${teamid}`,
    });

    res.json({ message: "Team deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete team` }
);

// ─── Team Members ─────────────────────────────────────────────────────────────

const addTeamMember = errorWrapper(
  async (req, res) => {
    const { userid, teamid, othermember, other_member_institute } = req.body;
    const member = await achievementSvc.addTeamMember({ teamid, userid, othermember, other_member_institute });

    await logActivity({
      req,
      action: ActivityAction.TEAM_MEMBER_ADDED,
      category: "achievement",
      targetType: "team",
      targetId: teamid,
      description: `Added member to team ID: ${teamid}`,
      metadata: { userid, othermember },
    });

    res.status(201).json(member);
  },
  { statusCode: 500, message: `Couldn't add team member` }
);

const getAllTeamMembers = errorWrapper(
  async (req, res) => {
    const members = await achievementSvc.getAllTeamMembers();
    res.json(members);
  },
  { statusCode: 500, message: `Couldn't get team members` }
);

const getTeamMembersByTeamId = errorWrapper(
  async (req, res) => {
    const { teamid } = req.params;
    const members = await achievementSvc.getTeamMembersByTeamId(teamid);
    res.json(members);
  },
  { statusCode: 500, message: `Couldn't get team members by teamid` }
);

const removeTeamMember = errorWrapper(
  async (req, res) => {
    const { userid, teamid } = req.body;
    await achievementSvc.removeTeamMember(userid, teamid);

    await logActivity({
      req,
      action: ActivityAction.TEAM_MEMBER_REMOVED,
      category: "achievement",
      targetType: "team",
      targetId: teamid,
      description: `Removed user ${userid} from team ID: ${teamid}`,
      metadata: { userid, teamid },
    });

    res.json({ message: "Team member removed successfully" });
  },
  { statusCode: 500, message: `Couldn't remove team member` }
);

// ─── Achievements ─────────────────────────────────────────────────────────────

const createAchievement = errorWrapper(
  async (req, res) => {
    const {
      teamid, eventname, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    } = req.body;
    const achievement = await achievementSvc.createAchievement({
      teamid, eventname, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    });

    await logActivity({
      req,
      action: ActivityAction.ACHIEVEMENT_CREATED,
      category: "achievement",
      targetType: "achievement",
      targetId: achievement.achieveid,
      description: `Created achievement: ${eventname}`,
      metadata: { eventname, organizer, rank },
    });

    res.status(201).json(achievement);
  },
  { statusCode: 500, message: `Couldn't create achievement` }
);

const getAllAchievements = errorWrapper(
  async (req, res) => {
    const achievements = await achievementSvc.getAllAchievements();
    res.json(achievements);
  },
  { statusCode: 500, message: `Couldn't get achievements` }
);

const getAchievementById = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params;
    const achievement = await achievementSvc.getAchievementById(achieveid);
    res.json(achievement);
  },
  { statusCode: 500, message: `Couldn't get achievement by achieveid` }
);

const updateAchievement = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params;
    const {
      eventname, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    } = req.body;
    const achievement = await achievementSvc.updateAchievement(achieveid, {
      eventname, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    });

    await logActivity({
      req,
      action: ActivityAction.ACHIEVEMENT_UPDATED,
      category: "achievement",
      targetType: "achievement",
      targetId: achieveid,
      description: `Updated achievement ID: ${achieveid} — ${eventname}`,
      metadata: { eventname, rank },
    });

    res.json(achievement);
  },
  { statusCode: 500, message: `Couldn't update achievement` }
);

const updateAchievementStatus = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params;
    const { approval_status } = req.body;

    if (approval_status === undefined) throw new CustomError("approval_status is required", 400);

    const achievement = await achievementSvc.updateAchievementStatus(achieveid, approval_status);

    await logActivity({
      req,
      action: ActivityAction.ACHIEVEMENT_STATUS_CHANGED,
      category: "achievement",
      targetType: "achievement",
      targetId: achieveid,
      description: `Achievement ID ${achieveid} approval status set to: ${approval_status}`,
      metadata: { approval_status },
    });

    res.json(achievement);
  },
  { statusCode: 500, message: `Couldn't update approval status` }
);

const deleteAchievement = errorWrapper(
  async (req, res) => {
    const { achieveid } = req.params;
    await achievementSvc.deleteAchievement(achieveid);

    await logActivity({
      req,
      action: ActivityAction.ACHIEVEMENT_DELETED,
      category: "achievement",
      targetType: "achievement",
      targetId: achieveid,
      description: `Deleted achievement ID: ${achieveid}`,
    });

    res.json({ message: "Achievement deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete achievement` }
);

const getUserAchievements = errorWrapper(
  async (req, res) => {
    const { userid } = req.params;
    const achievements = await achievementSvc.getUserAchievements(userid);
    res.json(achievements);
  },
  { statusCode: 500, message: `Couldn't retrieve achievements` }
);

const getAchievementsAll = errorWrapper(
  async (req, res) => {
    const achievements = await achievementSvc.getAllAchievementsFull();
    res.json({ achievements });
  },
  { statusCode: 500, message: "Couldn't retrieve achievements" }
);

const getApprovedAchievements = errorWrapper(
  async (req, res) => {
    const achievements = await achievementSvc.getApprovedAchievements();
    res.json({ achievements });
  },
  { statusCode: 500, message: "Couldn't retrieve approved achievements" }
);

// ─── Composite: Team + Members + Achievement ──────────────────────────────────

const createTeamAndAchievement = async (req, res) => {
  try {
    const {
      teamname, mentor, teammembers, others,
      eventname, segment, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    } = req.body;

    const result = await achievementSvc.createTeamAndAchievementTransaction({
      teamname, mentor, teammembers, others,
      eventname, segment, organizer, venu, startdate, enddate,
      rank, rankarea, task, solution, techstack, resources, photos, approval_status
    });

    await logActivity({
      req,
      action: ActivityAction.ACHIEVEMENT_FULL_CREATED,
      category: "achievement",
      targetType: "achievement",
      targetId: result.achievement.achieveid,
      description: `Full achievement submitted: ${eventname} by team ${teamname}`,
      metadata: { teamname, eventname, rank, members_count: (teammembers?.length || 0) + (others?.length || 0) },
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error during the transaction:", error);
    if (error instanceof CustomError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Could not complete the transaction" });
    }
  }
};

module.exports = {
  createTeam, getAllTeams, updateTeam, deleteTeam,
  addTeamMember, getAllTeamMembers, getTeamMembersByTeamId, removeTeamMember,
  createAchievement, getAllAchievements, getAchievementById,
  updateAchievement, updateAchievementStatus, deleteAchievement,
  getUserAchievements, getAchievementsAll, getApprovedAchievements,
  createTeamAndAchievement,
};
