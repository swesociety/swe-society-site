const errorWrapper = require("../middlewares/errorWrapper.js");
const {
  checkActivityLogAccess,
  getAllLogs,
  getMyLogs,
  getLogsByUser,
  getLogsByCategory,
} = require("../services/activityLogQueryService.js");

/**
 * GET /activity-logs
 * Admin view: all logs, paginated + filterable
 * Query params: page, limit, from, to, category, action, status, userid
 */
const getAllLogsHandler = errorWrapper(async (req, res) => {
  const hasAccess = await checkActivityLogAccess(req.jwtPayload.userid);
  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied. You do not have permission to view activity logs." });
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const filters = {
    category: req.query.category,
    action:   req.query.action,
    status:   req.query.status,
    userid:   req.query.userid,
    from:     req.query.from,
    to:       req.query.to,
  };

  const { total, logs } = await getAllLogs({ page, limit, filters });

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs,
  });
}, { statusCode: 500, message: "Couldn't retrieve activity logs" });


/**
 * GET /activity-logs/my
 * Authenticated user: their own logs only
 */
const getMyLogsHandler = errorWrapper(async (req, res) => {
  const userid = req.jwtPayload.userid;
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const filters = {
    category: req.query.category,
    from:     req.query.from,
    to:       req.query.to,
  };

  const { total, logs } = await getMyLogs(userid, { page, limit, filters });

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs,
  });
}, { statusCode: 500, message: "Couldn't retrieve your activity logs" });


/**
 * GET /activity-logs/user/:userid
 * Admin view: logs for a specific user
 */
const getLogsByUserHandler = errorWrapper(async (req, res) => {
  const hasAccess = await checkActivityLogAccess(req.jwtPayload.userid);
  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { userid } = req.params;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));

  const { total, logs } = await getLogsByUser(userid, { page, limit });

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs,
  });
}, { statusCode: 500, message: "Couldn't retrieve user logs" });


/**
 * GET /activity-logs/category/:category
 * Admin view: logs filtered by category
 */
const getLogsByCategoryHandler = errorWrapper(async (req, res) => {
  const hasAccess = await checkActivityLogAccess(req.jwtPayload.userid);
  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { category } = req.params;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));

  const { total, logs } = await getLogsByCategory(category, { page, limit });

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs,
  });
}, { statusCode: 500, message: "Couldn't retrieve logs by category" });


module.exports = {
  getAllLogs: getAllLogsHandler,
  getMyLogs: getMyLogsHandler,
  getLogsByUser: getLogsByUserHandler,
  getLogsByCategory: getLogsByCategoryHandler,
};
