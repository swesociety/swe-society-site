const express = require("express");
const router = express.Router();

const {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getAllTeamMembers,
  getTeamMembersByTeamId,
  removeTeamMember,
  createAchievement,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  getUserAchievements,
  createTeamAndAchievement,
  getAchievementsAll,
  updateAchievementStatus,
  getApprovedAchievements
} = require("../controllers/achievement.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/team/create").post(createTeam)
router.route("/team").get(getAllTeams)
router.route("/team/:teamid").put(updateTeam)
router.route("/team/:teamid").delete(deleteTeam)

router.route("/member/create").post(addTeamMember)
router.route("/member/:teamid").get(getTeamMembersByTeamId)
router.route("/member").get(getAllTeamMembers)
router.route("/member").delete(removeTeamMember)

router.route("/post/create").post(createAchievement)
router.route("/post/:achieveid").get(getAchievementById)
router.route("/post").get(getAchievementsAll)
router.route("/landing/approved").get(getApprovedAchievements)
router.route("/post/:achieveid").put(updateAchievement)
router.route("/post/:achieveid").delete(deleteAchievement)

router.route("/individual/:userid").get(getUserAchievements)

router
  .route("/post/fullachievement")
  .post(validateBearerToken, createTeamAndAchievement)
router
  .route("/poststatus/:achieveid")
  .put(validateBearerToken, updateAchievementStatus)

  module.exports = router
