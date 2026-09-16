const express = require("express");
const router  = express.Router();
const { getAllLogs, getMyLogs, getLogsByUser, getLogsByCategory } = require("../controllers/activityLog.js");
const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

router.get("/",                    validateBearerToken, getAllLogs);
router.get("/my",                  validateBearerToken, getMyLogs);
router.get("/user/:userid",        validateBearerToken, getLogsByUser);
router.get("/category/:category",  validateBearerToken, getLogsByCategory);

module.exports = router;
