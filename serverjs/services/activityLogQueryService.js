const pool = require("../db/dbconnect.js").pool;

/**
 * Check if a user has permission to view activity logs.
 * Returns true for super admin (roleid=1) or if activitylogaccess is granted.
 */
const checkActivityLogAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT r.activitylogaccess, r.roleid
     FROM Roles r JOIN Users u ON r.roleid = u.roleid
     WHERE u.userid = $1`,
    [userid]
  );
  if (rows.length === 0) return false;
  return rows[0].roleid === 1 || rows[0].activitylogaccess;
};

/**
 * Build paginated query result with optional filters.
 * filters: { category, action, status, userid, from, to }
 */
const getAllLogs = async ({ page, limit, filters = {} }) => {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (filters.category) { params.push(filters.category);           conditions.push(`category = $${params.length}`); }
  if (filters.action)   { params.push(`%${filters.action}%`);      conditions.push(`action ILIKE $${params.length}`); }
  if (filters.status)   { params.push(filters.status);             conditions.push(`status = $${params.length}`); }
  if (filters.userid)   { params.push(filters.userid);             conditions.push(`actor_userid = $${params.length}`); }
  if (filters.from)     { params.push(filters.from);               conditions.push(`created_at >= $${params.length}`); }
  if (filters.to)       { params.push(filters.to);                 conditions.push(`created_at <= $${params.length}`); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(`SELECT COUNT(*) FROM ActivityLogs ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT * FROM ActivityLogs ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { total, logs: rows };
};

/**
 * Get paginated logs for a single authenticated user.
 * filters: { category, from, to }
 */
const getMyLogs = async (userid, { page, limit, filters = {} }) => {
  const offset = (page - 1) * limit;
  const params = [userid];
  const conditions = ["actor_userid = $1"];

  if (filters.category) { params.push(filters.category); conditions.push(`category = $${params.length}`); }
  if (filters.from)     { params.push(filters.from);     conditions.push(`created_at >= $${params.length}`); }
  if (filters.to)       { params.push(filters.to);       conditions.push(`created_at <= $${params.length}`); }

  const where = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query(`SELECT COUNT(*) FROM ActivityLogs ${where}`, params);
  const total = parseInt(countResult.rows[0].count);

  params.push(limit, offset);
  const { rows } = await pool.query(
    `SELECT logid, action, category, target_type, description, status, created_at
     FROM ActivityLogs ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return { total, logs: rows };
};

/**
 * Get paginated logs for a specific user (admin view).
 */
const getLogsByUser = async (userid, { page, limit }) => {
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

  return { total, logs: rows };
};

/**
 * Get paginated logs filtered by category (admin view).
 */
const getLogsByCategory = async (category, { page, limit }) => {
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

  return { total, logs: rows };
};

module.exports = {
  checkActivityLogAccess,
  getAllLogs,
  getMyLogs,
  getLogsByUser,
  getLogsByCategory,
};
