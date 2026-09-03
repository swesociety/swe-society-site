const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/skills.js");


  router.route("/create").post(createSkill);
  router.route("/").get(getAllSkills);
  router.route("/:skillId").put(updateSkill);
  router.route("/:skillId").delete(deleteSkill);

  router.route("/user/create").post(createUserSkill);
  router.route("/user").get(getAllUserSkills);
  router.route("/user/:userSkillId").put(updateUserSkill);
  router.route("/user/:userSkillId").delete(deleteUserSkill);

  router.route("/individual/:userid").get(getUserSkills);
  router.route("/individual/multiple").post(addUserMultipleSkills);
  

  module.exports = router;