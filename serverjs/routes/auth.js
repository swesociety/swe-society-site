const express = require("express");
const router = express.Router();

const {
  changePass,
  createMultiUsersWithMailSend,
  createUser,
  createUserWithMailSend,
  generateOTPForUser,
  login,
  verifyOTP,
  sendCredentialsToUsers,
  getCredentialsByEmails,
  sendCredentialsByRegno
} = require("../controllers/auth.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/create").post(validateBearerToken, createUser)
// router.route("/createusers").post(sendCredentialsToUsers)
router.route("/sendcredsssss").post(sendCredentialsByRegno)
router.route("/getpasss").post(getCredentialsByEmails)
router
  .route("/createbymailing")
  .post(validateBearerToken, createUserWithMailSend)
router
  .route("/multiUserCreate")
  .post(validateBearerToken, createMultiUsersWithMailSend)
router.route("/generate-otp").post(generateOTPForUser)
router.route("/verify-otp").post(verifyOTP)
router.route("/login").post(login)
router.route("/changePassword").put(validateBearerToken, changePass) // for change pass in dashboard profile page

module.exports = router
