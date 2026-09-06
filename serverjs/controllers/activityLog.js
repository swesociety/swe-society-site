const errorWrapper = require("../middlewares/errorWrapper.js");
const pool = require("../db/dbconnect.js").pool;

/**
 * GET /activity-logs
 * Admin view: all logs, paginated + filterable
 * Query params: page, limit, from, to, category, action, status, userid
 */
const getAllLogs = errorWrapper(async (req, res) => {
  // Check activitylogaccess
  const { rows: accessRows } = await pool.query(
    `SELECT r.activitylogaccess, r.roleid
     FROM Roles r JOIN Users u ON r.roleid = u.roleid
     WHERE u.userid = $1`,
    [req.jwtPayload.userid]
  );

  const hasAccess =
    accessRows.length > 0 &&
    (accessRows[0].roleid === 1 || accessRows[0].activitylogaccess);

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied. You do not have permission to view activity logs." });
  }

  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const conditions = [];
  const params     = [];

  if (req.query.category) {
    params.push(req.query.category);
    conditions.push(`category = $${params.length}`);
  }
  if (req.query.action) {
    params.push(`%${req.query.action}%`);
    conditions.push(`action ILIKE $${params.length}`);
  }
  if (req.query.status) {
    params.push(req.query.status);
    conditions.push(`status = $${params.length}`);
  }
  if (req.query.userid) {
    params.push(req.query.userid);
    conditions.push(`actor_userid = $${params.length}`);
  }
  if (req.query.from) {
    params.push(req.query.from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (req.query.to) {
    params.push(req.query.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total
  const countResult = await pool.query(
    `SELECT COUNT(*) FROM ActivityLogs ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Fetch page
  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT * FROM ActivityLogs ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs: rows,
  });
}, { statusCode: 500, message: "Couldn't retrieve activity logs" });


/**
 * GET /activity-logs/my
 * Authenticated user: their own logs only
 */
const getMyLogs = errorWrapper(async (req, res) => {
  const userid = req.jwtPayload.userid;

  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  const params = [userid];
  const conditions = ["actor_userid = $1"];

  if (req.query.category) {
    params.push(req.query.category);
    conditions.push(`category = $${params.length}`);
  }
  if (req.query.from) {
    params.push(req.query.from);
    conditions.push(`created_at >= $${params.length}`);
  }
  if (req.query.to) {
    params.push(req.query.to);
    conditions.push(`created_at <= $${params.length}`);
  }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM ActivityLogs ${where}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT logid, action, category, target_type, description, status, created_at
     FROM ActivityLogs ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs: rows,
  });
}, { statusCode: 500, message: "Couldn't retrieve your activity logs" });


/**
 * GET /activity-logs/user/:userid
 * Admin view: logs for a specific user
 */
const getLogsByUser = errorWrapper(async (req, res) => {
  // Access check
  const { rows: accessRows } = await pool.query(
    `SELECT r.activitylogaccess, r.roleid
     FROM Roles r JOIN Users u ON r.roleid = u.roleid
     WHERE u.userid = $1`,
    [req.jwtPayload.userid]
  );

  const hasAccess =
    accessRows.length > 0 &&
    (accessRows[0].roleid === 1 || accessRows[0].activitylogaccess);

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { userid } = req.params;
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM ActivityLogs WHERE actor_userid = $1`,
    [userid]
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT * FROM ActivityLogs WHERE actor_userid = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userid, limit, offset]
  );

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs: rows,
  });
}, { statusCode: 500, message: "Couldn't retrieve user logs" });


/**
 * GET /activity-logs/category/:category
 * Admin view: logs filtered by category
 */
const getLogsByCategory = errorWrapper(async (req, res) => {
  const { rows: accessRows } = await pool.query(
    `SELECT r.activitylogaccess, r.roleid
     FROM Roles r JOIN Users u ON r.roleid = u.roleid
     WHERE u.userid = $1`,
    [req.jwtPayload.userid]
  );

  const hasAccess =
    accessRows.length > 0 &&
    (accessRows[0].roleid === 1 || accessRows[0].activitylogaccess);

  if (!hasAccess) {
    return res.status(403).json({ message: "Access denied." });
  }

  const { category } = req.params;
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM ActivityLogs WHERE category = $1`,
    [category]
  );
  const total = parseInt(countResult.rows[0].count);

  const { rows } = await pool.query(
    `SELECT * FROM ActivityLogs WHERE category = $1
     ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [category, limit, offset]
  );

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    logs: rows,
  });
}, { statusCode: 500, message: "Couldn't retrieve logs by category" });


module.exports = { getAllLogs, getMyLogs, getLogsByUser, getLogsByCategory };
