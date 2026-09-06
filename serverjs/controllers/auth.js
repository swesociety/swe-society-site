const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { generateToken } = require("../services/Token.js");
const { sendMail } = require("../services/mailService.js");
const { generateRandomPassword, generateOTP } = require("../services/utils.js");
const { election_status } = require("../services/electionStatus.js");
const bcrypt = require("bcrypt");
const { xorEncrypt, reqSalt_keys, xorDecrypt } = require("../services/encryption.js");
const pool = require("../db/dbconnect.js").pool;
const { logActivity } = require("../services/activityLogService.js");


const createUser = errorWrapper(
  async (req, res) => {
    const { regno, session, email, password, role, roleid } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const {
      rows
    } = await pool.query(
      "INSERT INTO Users (regno, session, email, password, role, roleid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [regno, session, email, hashedPassword, role, roleid]
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create user` }
)

const login = errorWrapper(
  async (req, res) => {
    const { regno, password, longsession } = req.body

    const { rows } = await pool.query("SELECT * FROM Users WHERE regno = $1 ", [
      regno
    ])

    const election_running_val = election_status.voting_start;
    const runningElection = await pool.query(
      "SELECT electionid FROM Elections WHERE election_status = $1 LIMIT 1",
      [election_running_val]
    );



    

    if (runningElection.rows.length > 0) {
        election_ids = runningElection.rows[0].electionid;
        candidate_stauts = null;

      const { rows: rowselectionaccess } = await pool.query(
      `
      SELECT regexp_replace(status, '^.*_', '') AS last_status
      FROM ElectionCandidateTrack
      WHERE regno = $1 AND electionid = $2
      LIMIT 1
      `,
      [regno, election_ids]
    );

          if (rowselectionaccess.length != 0) {
              candidate_stauts = rowselectionaccess[0].last_status
          }

    }else{
      election_ids = null;
      candidate_stauts = null;
    }



    if (rows.length === 0) {
      throw new CustomError("This regno do not exists", 404)
    } else {
      // User found, return user details
      //  res.json(rows[0]);

      let isPasswordValid = false;

      //this is for dev only  will be removed in production
      try {
        isPasswordValid = await bcrypt.compare(password, rows[0].password);
      } catch (e) {
        isPasswordValid = false;
      }

      if (!isPasswordValid) {
        try {
          const decrypted = xorDecrypt(rows[0].password, reqSalt_keys.user.password);
          isPasswordValid = decrypted === password;
        } catch (e) {
          isPasswordValid = false;
        }
      }

      if (!isPasswordValid) {
        await logActivity({
          req,
          action: "auth.login",
          category: "auth",
          description: `Failed login attempt for regno: ${regno}`,
          metadata: { regno },
          status: "fail",
        });
        throw new CustomError("Invalid Credentials", 401)
      }

      const token = generateToken(
        {
          userid: rows[0].userid,
          role: rows[0].role,
          regno: rows[0].regno
        },
        longsession ? "30d" : "1h"
      )

      // Attach jwtPayload so logActivity can pick up userid
      req.jwtPayload = { userid: rows[0].userid, regno: rows[0].regno };
      await logActivity({
        req,
        action: "auth.login",
        category: "auth",
        description: `User logged in`,
        metadata: { regno, longsession: !!longsession },
        status: "success",
      });

      res.json({ user: rows[0], token, electionid: election_ids, candidate_stauts: candidate_stauts })
    }
  },
  { statusCode: 500, message: `Login Failed` }
)

const createUserWithMailSend = errorWrapper(
  async (req, res) => {
    const { regno, session, email, role } = req.body
    const password = generateRandomPassword(8)
    const hashedPassword = xorEncrypt(password, reqSalt_keys.user.password)

    const {
      rows
    } = await pool.query(
      "INSERT INTO Users (regno, session, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [regno, session, email, hashedPassword, role]
    )

    await sendMail(
      regno,
      email,
      `Welcome To SWE Society!`,
      `Your account has been created by Admin! Here are the Credentials:`,
      `regno: ${regno}<br>email: ${email}<br> password: ${password}<br><br>Regards,<br>SWE Society Committee`
    )

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create user` }
)

const createMultiUsersWithMailSend = errorWrapper(
  async (req, res) => {
    const users = req.body
    const failedUsers = []
    console.log(req.jwtPayload.userid)

    try {
      const { rows: accessCheckRows } = await pool.query(
        `SELECT membersaccess 
   FROM Roles 
   JOIN Users ON Roles.roleid = Users.roleid 
   WHERE Users.userid = $1`,
        [req.jwtPayload.userid]
      )
      console.log(accessCheckRows)

      if (accessCheckRows.length === 0 || !accessCheckRows[0].membersaccess) {
        return res.status(403).json({
          message: "Access denied. You do not have permission to add member."
        })
      }

      const defaultRole = await pool.query(
        "SELECT roleid FROM Roles WHERE isDefaultRole = TRUE LIMIT 1"
      )

      if (defaultRole.rows.length === 0) {
        return res.status(500).json({
          message: "Default role is not defined in the database"
        })
      }

      const defaultRoleId = defaultRole.rows[0].roleid

      for (const user of users) {
        const { regno, session, email, fullname } = user

        // Check if registration number or email already exists
        const regnoExists = await pool.query(
          "SELECT 1 FROM Users WHERE regno = $1",
          [regno]
        )
        const emailExists = await pool.query(
          "SELECT 1 FROM Users WHERE email = $1",
          [email]
        )

        if (regnoExists.rows.length > 0) {
          failedUsers.push({
            regno,
            email,
            message: "Registration number already exists"
          })
          continue
        }

        if (emailExists.rows.length > 0) {
          failedUsers.push({
            regno,
            email,
            message: "Email address already exists"
          })
          continue
        }

        const password = generateRandomPassword(8)
        const hashedPassword = xorEncrypt(password, reqSalt_keys.user.password)

        try {
          const {
            rows
          } = await pool.query(
            "INSERT INTO Users (regno, session, email, fullname, password, roleid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [regno, session, email, fullname,  hashedPassword, defaultRoleId]
          )

          await sendMail(
            regno,
            email,
            `Welcome To SWE Society!`,
            `Your account has been created by Admin! Here are the Credentials:`,
            `regno: ${regno}<br>email: ${email}<br>password: ${password}<br><br>Regards,<br>SWE Society Committee`
          )
        } catch (error) {
          console.error(`Failed to create user with regno ${regno}:`, error)
          failedUsers.push({ regno, email, message: "Failed to create user" })
        }
      }

      if (failedUsers.length > 0) {
        res.status(207).json({
          message: "Some users could not be created",
          failedUsers
        })
      } else {
        res.status(201).json({
          message: "All users created successfully"
        })
      }

      await logActivity({
        req,
        action: "user.bulk_create",
        category: "user",
        description: `Admin bulk created ${users.length} users (${failedUsers.length} failed)`,
        metadata: { 
          total_attempted: users.length, 
          failed_count: failedUsers.length,
          failed_users: failedUsers.map(u => u.regno)
        },
        status: failedUsers.length === users.length ? "fail" : "success"
      });

    } catch (error) {
      console.error("Error fetching default role:", error)
      res.status(500).json({
        message: "An error occurred while creating users"
      })
    }
  },
  { statusCode: 500, message: `Couldn't create users` }
)

const updateUserPassword = errorWrapper(
  async (req, res) => {
    const { userid } = req.body

    try {
      // Find user details by userid
      const userResult = await pool.query(
        "SELECT regno, email FROM Users WHERE userid = $1",
        [userid]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }

      const { regno, email } = userResult.rows[0]

      // Generate a new password
      const newPassword = generateRandomPassword(8)
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update the user's password in the database
      await pool.query(
        "UPDATE Users SET password = $1 WHERE userid = $2 RETURNING *",
        [hashedPassword, userid]
      )

      // Send email with the new credentials
      await sendMail(
        regno,
        email,
        `Your Password Has Been Updated`,
        `Your password has been updated by Admin. Here are your new credentials:`,
        `regno: ${regno}<br>email: ${email}<br>password: ${newPassword}<br><br>Regards,<br>SWE Society Committee`
      )

      await logActivity({
        req,
        action: "user.password_reset_by_admin",
        category: "auth",
        targetType: "user",
        targetId: userid,
        description: `Admin reset password for user ${regno}`,
      });

      // Return the userid in the response
      res.status(200).json({ userid })
    } catch (error) {
      console.error(`Failed to update password for userid ${userid}:`, error)
      res.status(500).json({ message: `Couldn't update user's password` })
    }
  },
  { statusCode: 500, message: `Couldn't update user's password` }
)

const changePass = errorWrapper(
  async (req, res) => {
    const { regno, oldpass, newpass } = req.body

    const userQueryResult = await pool.query(
      "SELECT * FROM Users WHERE regno = $1",
      [regno]
    )
    if (userQueryResult.rows.length === 0) {
      throw new CustomError("This regno do not exists", 404)
    } else {
      const isPasswordValid = await bcrypt.compare(
        oldpass,
        userQueryResult.rows[0].password
      )
      if (!isPasswordValid) {
        throw new Error("Old password doesn't match")
      }
      const hashedPassword = await bcrypt.hash(newpass, 10)
      await pool.query("UPDATE Users SET password = $1 WHERE regno = $2", [
        hashedPassword,
        regno
      ])
      await sendMail(
        regno,
        userQueryResult.rows[0].email, //mail subject
        `Your Password Has Been Changed`,
        `Your password for the SWE Society account associated with registration number ${regno} has been successfully changed. If you did not initiate this change, please contact our committeee immediately.<br><br>Regards,<br><strong>SWE Society Committee</strong><br><br>`,
        `<p style="text-align: center;"><span style="font-size: 12px;">This is an automated message. Please do not reply to this email.</span></p>`
      )

      await logActivity({
        req,
        action: "user.password_change",
        category: "auth",
        description: `User ${regno} changed their password`,
      });

      res.json({ message: "Password changed successfully" })
    }
  },
  { statusCode: 500, message: `Can't changed password` }
)

const generateOTPForUser = errorWrapper(
  async (req, res) => {
    const { regno } = req.body

    try {
      // Check if user exists
      const userResult = await pool.query(
        "SELECT email FROM Users WHERE regno = $1",
        [regno]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found" })
      }

      const userEmail = userResult.rows[0].email
      const otp = generateOTP()
      const expiresAt = new Date(Date.now() + 5 * 60000) // 5 minutes from now

      // Check if OTP already exists for this regno
      const existingOTP = await pool.query(
        "SELECT id FROM OTPVerification WHERE regno = $1",
        [regno]
      )

      if (existingOTP.rows.length > 0) {
        // Update existing OTP
        await pool.query(
          "UPDATE OTPVerification SET otp = $1, expires_at = $2 WHERE regno = $3",
          [otp, expiresAt, regno]
        )
      } else {
        // Create new OTP record
        await pool.query(
          "INSERT INTO OTPVerification (regno, otp, expires_at) VALUES ($1, $2, $3)",
          [regno, otp, expiresAt]
        )
      }

      // Send OTP via email
      await sendMail(
        regno,
        userEmail,
        "Password Reset OTP",
        "Your password reset OTP is:",
        `OTP: ${otp}<br>This OTP will expire in 5 minutes.<br><br>If you didn't request this, please ignore this email.<br><br>Regards,<br>SWE Society Committee`
      )

      await logActivity({
        req,
        action: "auth.otp_generated",
        category: "auth",
        description: `OTP generated for password reset for ${regno}`,
      });

      res.status(201).json({
        message: "OTP generated and sent successfully"
      })
    } catch (error) {
      console.error("Error generating OTP:", error)
      res.status(500).json({
        message: "An error occurred while generating OTP"
      })
    }
  },
  { statusCode: 500, message: "Couldn't generate OTP" }
)

const verifyOTP = errorWrapper(
  async (req, res) => {
    const { regno, otp } = req.body

    if (!regno || !otp) {
      return res.status(400).json({
        message: "Registration number and OTP are required"
      })
    }

    try {
      // Get OTP record
      const otpResult = await pool.query(
        "SELECT expires_at FROM OTPVerification WHERE regno = $1 AND otp = $2",
        [regno, otp]
      )

      if (otpResult.rows.length === 0) {
        return res.status(400).json({
          message: "Invalid OTP"
        })
      }

      const expiresAt = new Date(otpResult.rows[0].expires_at)
      if (expiresAt < new Date()) {
        // Delete expired OTP
        await pool.query("DELETE FROM OTPVerification WHERE regno = $1", [
          regno
        ])
        return res.status(400).json({
          message: "OTP has expired"
        })
      }
      // Get user details
      const userResult = await pool.query(
        "SELECT userid, email FROM Users WHERE regno = $1",
        [regno]
      )

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          message: "User not found"
        })
      }

      const { userid, email } = userResult.rows[0]

      // Delete verified OTP
      await pool.query("DELETE FROM OTPVerification WHERE regno = $1", [regno])

      // Generate and update new password
      const newPassword = generateRandomPassword(8)
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Update the user's password in the database
      await pool.query("UPDATE Users SET password = $1 WHERE userid = $2", [
        hashedPassword,
        userid
      ])

      // Send email with the new credentials
      await sendMail(
        regno,
        email,
        `Your Password Has Been Reset`,
        `Your password has been reset successfully. Here are your new credentials:`,
        `Registration Number: ${regno}<br>Email: ${email}<br>New Password: ${newPassword}<br><br>Please change your password after logging in.<br><br>Regards,<br>SWE Society Committee`
      )

      await logActivity({
        req,
        action: "auth.otp_password_reset",
        category: "auth",
        description: `User ${regno} reset password via OTP`,
      });

      res.status(200).json({
        message:
          "Password reset successful. Please check your email for the new password"
      })
    } catch (error) {
      console.error("Error verifying OTP:", error)
      throw error
    }
  },
  { statusCode: 500, message: "Couldn't verify OTP and reset password" }
)


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendCredentialsToUsers = errorWrapper(
  async (req, res) => {
    const { fromuserid, touserid } = req.body;

    if (!fromuserid || !touserid || isNaN(fromuserid) || isNaN(touserid)) {
      return res.status(400).json({ message: "Invalid fromuserid or touserid" });
    }

    const { rows: users } = await pool.query(
      `SELECT userid, email, regno, password 
       FROM Users 
       WHERE userid BETWEEN $1 AND $2 
       ORDER BY userid`,
      [fromuserid, touserid]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found in the given range" });
    }

    for (const user of users) {
      const decryptedPassword = xorDecrypt(user.password, reqSalt_keys.user.password);

      try {
        await sendMail(
          user.regno,
          user.email,
          `Welcome To SWE Society!`,
          `Your account has been created by Admin! Here are the Credentials:`,
          `regno: ${user.regno}<br>password: ${decryptedPassword}<br><br>Regards,<br>SWE Society Committee`
        );

        console.log(`Mail sent to userid ${user.userid} email ${user.email}`);
      } catch (err) {
        console.error(`Failed to send mail to ${user.userid} email ${user.email}:`, err);
      }

      // wait 1.5 seconds before sending to next user
      await sleep(1500);
    }


    res.status(200).json({ message: `Credentials sent to ${users.length} users.` });
  },
  { statusCode: 500, message: `Failed to send credentials` }
);


const sendCredentialsByRegno = errorWrapper(
  async (req, res) => {
    const { regno, nemail } = req.body;

    if (!regno) {
      return res.status(400).json({ message: "regno is required in request body" });
    }

    const { rows: users } = await pool.query(
      `SELECT userid, email, regno, password 
       FROM Users 
       WHERE regno = $1
       LIMIT 1`,
      [regno]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: `No user found with regno: ${regno}` });
    }

    const user = users[0];
    let decryptedPassword = xorDecrypt(user.password, reqSalt_keys.user.password);

    if (!decryptedPassword) {
      const newPassword = generateRandomPassword(8);
      const hashedPassword = xorEncrypt(newPassword, reqSalt_keys.user.password);
      await pool.query("UPDATE Users SET password = $1 WHERE regno = $2", [
        hashedPassword,
        regno,
      ]);
      decryptedPassword = newPassword;
    }

    let sendToEmail = user.email;

    // If nemail is provided and different from db email, update and send to nemail
    if (nemail && nemail !== user.email) {
      try {
        await pool.query(
          "UPDATE Users SET email = $1 WHERE regno = $2",
          [nemail, regno]
        );
        sendToEmail = nemail;
      } catch (err) {
        console.error(`Failed to update email for regno ${user.regno}:`, err);
        return res.status(500).json({ message: `Failed to update email for ${user.regno}` });
      }
    }

    try {
      await sendMail(
        user.regno,
        sendToEmail,
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

    const placeholders = emails.map((_, idx) => `$${idx + 1}`).join(", ");

    const { rows: users } = await pool.query(
      `
      SELECT email, fullname, regno, password
      FROM Users
      WHERE email IN (${placeholders})
      `,
      emails
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found for the provided emails" });
    }

    const result = users.map(user => {
      const decryptedPassword = xorDecrypt(user.password, reqSalt_keys.user.password);
      return {
        email: user.email,
        regno: user.regno,
        fullname: user.fullname,
        password: decryptedPassword
      };
    });

    res.status(200).json({ users: result });
  },
  { statusCode: 500, message: `Failed to fetch credentials` }
);

const signup = errorWrapper(
  async (req, res) => {
    const { regno, fullname, email, password, session } = req.body;

    // Validate required fields
    if (!regno || !fullname || !email || !password || !session) {
      throw new CustomError("regno, fullname, email, password and session are all required", 400);
    }

    // Check regno uniqueness
    const { rows: regnoCheck } = await pool.query(
      "SELECT 1 FROM Users WHERE regno = $1",
      [regno]
    );
    if (regnoCheck.length > 0) {
      throw new CustomError("This registration number is already registered", 409);
    }

    // Check email uniqueness
    const { rows: emailCheck } = await pool.query(
      "SELECT 1 FROM Users WHERE email = $1",
      [email]
    );
    if (emailCheck.length > 0) {
      throw new CustomError("This email address is already registered", 409);
    }

    // Get default role
    const { rows: defaultRoleRows } = await pool.query(
      "SELECT roleid FROM Roles WHERE isDefaultRole = TRUE LIMIT 1"
    );
    if (defaultRoleRows.length === 0) {
      throw new CustomError("No default role configured. Please contact admin.", 500);
    }
    const defaultRoleId = defaultRoleRows[0].roleid;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { rows } = await pool.query(
      `INSERT INTO Users (regno, fullname, email, password, session, roleid)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING userid, regno, fullname, email, session, roleid`,
      [regno, fullname, email, hashedPassword, session, defaultRoleId]
    );

    // Send welcome email (non-blocking)
    sendMail(
      regno,
      email,
      "Welcome To SWE Society!",
      "Your account has been created successfully.",
      `Hello ${fullname},<br><br>Welcome to SWE Society! Your account has been created.<br><br>regno: ${regno}<br>email: ${email}<br><br>Regards,<br>SWE Society Committee`
    ).catch(err => console.error("Welcome mail error:", err));

    res.status(201).json({
      message: "Account created successfully",
      user: rows[0]
    });

    req.jwtPayload = { userid: rows[0].userid, regno: rows[0].regno };
    await logActivity({
      req,
      action: "auth.signup",
      category: "auth",
      description: `New user signed up: ${regno}`,
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
}


