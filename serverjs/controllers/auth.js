const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { generateToken } = require("../services/Token.js");
const { sendMail } = require("../services/mailService.js");
const { generateRandomPassword, generateOTP } = require("../services/utils.js");
const { election_status } = require("../services/electionStatus.js");
const bcrypt = require("bcrypt");
const { xorEncrypt, reqSalt_keys, xorDecrypt } = require("../services/encryption.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");
const authSvc = require("../services/authService.js");


const createUser = errorWrapper(
  async (req, res) => {
    const { regno, session, email, password, role, roleid } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authSvc.createUser({ regno, session, email, hashedPassword, role, roleid });
    res.status(201).json(user);
  },
  { statusCode: 500, message: `Couldn't create user` }
);

const login = errorWrapper(
  async (req, res) => {
    const { regno, password, longsession } = req.body;

    const user = await authSvc.findUserByRegno(regno);

    const runningElection = await authSvc.findRunningElection(election_status.voting_start);
    let election_ids = null;
    let candidate_stauts = null;

    if (runningElection) {
      election_ids = runningElection.electionid;
      candidate_stauts = await authSvc.getCandidateStatus(regno, election_ids);
    }

    if (!user) {
      throw new CustomError("This regno do not exists", 404);
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      try {
        const decrypted = xorDecrypt(user.password, reqSalt_keys.user.password);
        isPasswordValid = decrypted === password;
      } catch (e) {
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      await logActivity({
        req,
        action: ActivityAction.AUTH_LOGIN_FAILED,
        category: "auth",
        description: `Failed login attempt for regno: ${regno}`,
        metadata: { regno },
        status: "fail",
      });
      throw new CustomError("Invalid Credentials", 401);
    }

    const token = generateToken(
      { userid: user.userid, role: user.role, regno: user.regno },
      longsession ? "30d" : "1h"
    );

    req.jwtPayload = { userid: user.userid, regno: user.regno };
    await logActivity({
      req,
      action: ActivityAction.AUTH_LOGIN_SUCCESS,
      category: "auth",
      description: `User logged in successfully`,
      metadata: { regno, longsession: !!longsession },
      status: "success",
    });

    res.json({ user, token, electionid: election_ids, candidate_stauts });
  },
  { statusCode: 500, message: `Login Failed` }
);

const createUserWithMailSend = errorWrapper(
  async (req, res) => {
    const { regno, session, email, role } = req.body;
    const password = generateRandomPassword(8);
    const hashedPassword = xorEncrypt(password, reqSalt_keys.user.password);
    const user = await authSvc.createUser({ regno, session, email, hashedPassword, role, roleid: undefined });

    await sendMail(
      regno, email,
      `Welcome To SWE Society!`,
      `Your account has been created by Admin! Here are the Credentials:`,
      `regno: ${regno}<br>email: ${email}<br> password: ${password}<br><br>Regards,<br>SWE Society Committee`
    );

    res.status(201).json(user);
  },
  { statusCode: 500, message: `Couldn't create user` }
);

const createMultiUsersWithMailSend = errorWrapper(
  async (req, res) => {
    const users = req.body;
    const failedUsers = [];
    console.log(req.jwtPayload.userid);

    try {
      const hasAccess = await authSvc.checkMembersAccess(req.jwtPayload.userid);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied. You do not have permission to add member." });
      }

      const defaultRole = await authSvc.getDefaultRole();
      if (!defaultRole) {
        return res.status(500).json({ message: "Default role is not defined in the database" });
      }
      const defaultRoleId = defaultRole.roleid;

      for (const user of users) {
        const { regno, session, email, fullname } = user;

        const regnoExists = await authSvc.checkRegnoExists(regno);
        const emailExists = await authSvc.checkEmailExists(email);

        if (regnoExists) {
          failedUsers.push({ regno, email, message: "Registration number already exists" });
          continue;
        }
        if (emailExists) {
          failedUsers.push({ regno, email, message: "Email address already exists" });
          continue;
        }

        const password = generateRandomPassword(8);
        const hashedPassword = xorEncrypt(password, reqSalt_keys.user.password);

        try {
          await authSvc.createUserFull({ regno, session, email, fullname, hashedPassword, roleid: defaultRoleId });
          await sendMail(
            regno, email,
            `Welcome To SWE Society!`,
            `Your account has been created by Admin! Here are the Credentials:`,
            `regno: ${regno}<br>email: ${email}<br>password: ${password}<br><br>Regards,<br>SWE Society Committee`
          );
        } catch (error) {
          console.error(`Failed to create user with regno ${regno}:`, error);
          failedUsers.push({ regno, email, message: "Failed to create user" });
        }
      }

      if (failedUsers.length > 0) {
        res.status(207).json({ message: "Some users could not be created", failedUsers });
      } else {
        res.status(201).json({ message: "All users created successfully" });
      }

      await logActivity({
        req,
        action: ActivityAction.USER_BULK_CREATED,
        category: "user",
        description: `Admin bulk created ${users.length} user(s) (${failedUsers.length} failed)`,
        metadata: {
          total_attempted: users.length,
          failed_count: failedUsers.length,
          failed_users: failedUsers.map(u => u.regno)
        },
        status: failedUsers.length === users.length ? "fail" : "success"
      });

    } catch (error) {
      console.error("Error fetching default role:", error);
      res.status(500).json({ message: "An error occurred while creating users" });
    }
  },
  { statusCode: 500, message: `Couldn't create users` }
);

const updateUserPassword = errorWrapper(
  async (req, res) => {
    const { userid } = req.body;
    try {
      const user = await authSvc.getUserByUserid(userid);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { regno, email } = user;
      const newPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await authSvc.updateUserPassword(userid, hashedPassword);

      await sendMail(
        regno, email,
        `Your Password Has Been Updated`,
        `Your password has been updated by Admin. Here are your new credentials:`,
        `regno: ${regno}<br>email: ${email}<br>password: ${newPassword}<br><br>Regards,<br>SWE Society Committee`
      );

      await logActivity({
        req,
        action: ActivityAction.AUTH_PASSWORD_RESET_BY_ADMIN,
        category: "auth",
        targetType: "user",
        targetId: userid,
        description: `Admin reset password for user ${regno}`,
      });

      res.status(200).json({ userid });
    } catch (error) {
      console.error(`Failed to update password for userid ${userid}:`, error);
      res.status(500).json({ message: `Couldn't update user's password` });
    }
  },
  { statusCode: 500, message: `Couldn't update user's password` }
);

const changePass = errorWrapper(
  async (req, res) => {
    const { regno, oldpass, newpass } = req.body;

    const user = await authSvc.findUserByRegno(regno);
    if (!user) throw new CustomError("This regno do not exists", 404);

    const isPasswordValid = await bcrypt.compare(oldpass, user.password);
    if (!isPasswordValid) throw new Error("Old password doesn't match");

    const hashedPassword = await bcrypt.hash(newpass, 10);
    await authSvc.updateUserPasswordByRegno(regno, hashedPassword);

    await sendMail(
      regno, user.email,
      `Your Password Has Been Changed`,
      `Your password for the SWE Society account associated with registration number ${regno} has been successfully changed. If you did not initiate this change, please contact our committeee immediately.<br><br>Regards,<br><strong>SWE Society Committee</strong><br><br>`,
      `<p style="text-align: center;"><span style="font-size: 12px;">This is an automated message. Please do not reply to this email.</span></p>`
    );

    await logActivity({
      req,
      action: ActivityAction.AUTH_PASSWORD_CHANGED,
      category: "auth",
      description: `User ${regno} changed their own password`,
    });

    res.json({ message: "Password changed successfully" });
  },
  { statusCode: 500, message: `Can't changed password` }
);

const generateOTPForUser = errorWrapper(
  async (req, res) => {
    const { regno } = req.body;
    try {
      const userRow = await authSvc.getUserByRegnoForOTP(regno);
      if (!userRow) return res.status(404).json({ message: "User not found" });

      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60000);

      await authSvc.upsertOTP(regno, otp, expiresAt);

      await sendMail(
        regno, userRow.email,
        "Password Reset OTP",
        "Your password reset OTP is:",
        `OTP: ${otp}<br>This OTP will expire in 5 minutes.<br><br>If you didn't request this, please ignore this email.<br><br>Regards,<br>SWE Society Committee`
      );

      await logActivity({
        req,
        action: ActivityAction.AUTH_OTP_REQUESTED,
        category: "auth",
        description: `OTP requested for password reset — regno: ${regno}`,
      });

      res.status(201).json({ message: "OTP generated and sent successfully" });
    } catch (error) {
      console.error("Error generating OTP:", error);
      res.status(500).json({ message: "An error occurred while generating OTP" });
    }
  },
  { statusCode: 500, message: "Couldn't generate OTP" }
);

const verifyOTP = errorWrapper(
  async (req, res) => {
    const { regno, otp } = req.body;
    if (!regno || !otp) {
      return res.status(400).json({ message: "Registration number and OTP are required" });
    }

    try {
      const otpRow = await authSvc.verifyOTP(regno, otp);
      if (!otpRow) return res.status(400).json({ message: "Invalid OTP" });

      const expiresAt = new Date(otpRow.expires_at);
      if (expiresAt < new Date()) {
        await authSvc.deleteOTP(regno);
        return res.status(400).json({ message: "OTP has expired" });
      }

      const user = await authSvc.getUserForPasswordReset(regno);
      if (!user) return res.status(404).json({ message: "User not found" });

      const { userid, email } = user;
      await authSvc.deleteOTP(regno);

      const newPassword = generateRandomPassword(8);
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authSvc.updatePasswordByUserid(userid, hashedPassword);

      await sendMail(
        regno, email,
        `Your Password Has Been Reset`,
        `Your password has been reset successfully. Here are your new credentials:`,
        `Registration Number: ${regno}<br>Email: ${email}<br>New Password: ${newPassword}<br><br>Please change your password after logging in.<br><br>Regards,<br>SWE Society Committee`
      );

      await logActivity({
        req,
        action: ActivityAction.AUTH_OTP_VERIFIED,
        category: "auth",
        description: `Password reset via OTP for regno: ${regno}`,
      });

      res.status(200).json({ message: "Password reset successful. Please check your email for the new password" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },
  { statusCode: 500, message: "Couldn't verify OTP and reset password" }
);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendCredentialsToUsers = errorWrapper(
  async (req, res) => {
    const { fromuserid, touserid } = req.body;
    if (!fromuserid || !touserid || isNaN(fromuserid) || isNaN(touserid)) {
      return res.status(400).json({ message: "Invalid fromuserid or touserid" });
    }

    const users = await authSvc.getUsersByRange(fromuserid, touserid);
    if (users.length === 0) return res.status(404).json({ message: "No users found in the given range" });

    for (const user of users) {
      const decryptedPassword = xorDecrypt(user.password, reqSalt_keys.user.password);
      try {
        await sendMail(
          user.regno, user.email,
          `Welcome To SWE Society!`,
          `Your account has been created by Admin! Here are the Credentials:`,
          `regno: ${user.regno}<br>password: ${decryptedPassword}<br><br>Regards,<br>SWE Society Committee`
        );
        console.log(`Mail sent to userid ${user.userid} email ${user.email}`);
      } catch (err) {
        console.error(`Failed to send mail to ${user.userid} email ${user.email}:`, err);
      }
      await sleep(1500);
    }

    res.status(200).json({ message: `Credentials sent to ${users.length} users.` });
  },
  { statusCode: 500, message: `Failed to send credentials` }
);

const sendCredentialsByRegno = errorWrapper(
  async (req, res) => {
    const { regno, nemail } = req.body;
    if (!regno) return res.status(400).json({ message: "regno is required in request body" });

    const user = await authSvc.getUserByRegno(regno);
    if (!user) return res.status(404).json({ message: `No user found with regno: ${regno}` });

    let decryptedPassword = xorDecrypt(user.password, reqSalt_keys.user.password);

    if (!decryptedPassword) {
      const newPassword = generateRandomPassword(8);
      const hashedPassword = xorEncrypt(newPassword, reqSalt_keys.user.password);
      await authSvc.updateUserPasswordByRegno(regno, hashedPassword);
      decryptedPassword = newPassword;
    }

    let sendToEmail = user.email;
    if (nemail && nemail !== user.email) {
      try {
        await authSvc.updateUserEmail(regno, nemail);
        sendToEmail = nemail;
      } catch (err) {
        console.error(`Failed to update email for regno ${user.regno}:`, err);
        return res.status(500).json({ message: `Failed to update email for ${user.regno}` });
      }
    }

    try {
      await sendMail(
        user.regno, sendToEmail,
        `Welcome To SWE Society!`,
        `Your account has been modified by Admin! Here are the Credentials:`,
        `regno: ${user.regno}<br>password: ${decryptedPassword}<br><br>Regards,<br>SWE Society Committee`
      );
      console.log(`Mail sent to regno ${user.regno}, email ${sendToEmail}`);
      res.status(200).json({ message: `Credentials sent to ${user.regno}` });
    } catch (err) {
      console.error(`Failed to send mail to regno ${user.regno}, email ${sendToEmail}:`, err);
      res.status(500).json({ message: `Failed to send mail to ${user.regno}` });
    }
  },
  { statusCode: 500, message: `Failed to send credentials` }
);

const getCredentialsByEmails = errorWrapper(
  async (req, res) => {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "Please provide a non-empty array of emails" });
    }

    const users = await authSvc.getUsersByEmails(emails);
    if (users.length === 0) return res.status(404).json({ message: "No users found for the provided emails" });

    const result = users.map(user => ({
      email: user.email,
      regno: user.regno,
      fullname: user.fullname,
      password: xorDecrypt(user.password, reqSalt_keys.user.password),
    }));

    res.status(200).json({ users: result });
  },
  { statusCode: 500, message: `Failed to fetch credentials` }
);

const signup = errorWrapper(
  async (req, res) => {
    const { regno, fullname, email, password, session } = req.body;

    if (!regno || !fullname || !email || !password || !session) {
      throw new CustomError("regno, fullname, email, password and session are all required", 400);
    }

    if (await authSvc.checkRegnoExists(regno)) {
      throw new CustomError("This registration number is already registered", 409);
    }
    if (await authSvc.checkEmailExists(email)) {
      throw new CustomError("This email address is already registered", 409);
    }

    const defaultRole = await authSvc.getDefaultRole();
    if (!defaultRole) throw new CustomError("No default role configured. Please contact admin.", 500);
    const defaultRoleId = defaultRole.roleid;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await authSvc.createSignupUser({ regno, fullname, email, hashedPassword, session, defaultRoleId });

    sendMail(
      regno, email,
      "Welcome To SWE Society!",
      "Your account has been created successfully.",
      `Hello ${fullname},<br><br>Welcome to SWE Society! Your account has been created.<br><br>regno: ${regno}<br>email: ${email}<br><br>Regards,<br>SWE Society Committee`
    ).catch(err => console.error("Welcome mail error:", err));

    res.status(201).json({ message: "Account created successfully", user });

    req.jwtPayload = { userid: user.userid, regno: user.regno };
    await logActivity({
      req,
      action: ActivityAction.AUTH_SIGNUP,
      category: "auth",
      description: `New user signed up — regno: ${regno}`,
      metadata: { regno, email },
      status: "success"
    });
  },
  { statusCode: 500, message: "Couldn't create account" }
);

module.exports = {
  changePass,
  createMultiUsersWithMailSend,
  createUser,
  createUserWithMailSend,
  login,
  updateUserPassword,
  generateOTPForUser,
  verifyOTP,
  sendCredentialsToUsers,
  sendCredentialsByRegno,
  getCredentialsByEmails,
  signup
};
