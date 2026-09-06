const pool = require("../db/dbconnect.js").pool;

/**
 * Log an activity to the ActivityLogs table.
 * This is non-blocking — errors here never crash the main request.
 *
 * @param {object} opts
 * @param {import('express').Request} opts.req   - Express request (used for IP + JWT payload)
 * @param {string}  opts.action      - Dot-notation action string, e.g. "auth.login"
 * @param {string}  opts.category    - High-level category: auth | user | role | payment | election | achievement | blog | event | notice | candidate | vote
 * @param {string}  [opts.targetType]  - Entity type affected, e.g. "payment"
 * @param {string|number} [opts.targetId]   - ID of the affected entity
 * @param {string}  [opts.description] - Human-readable summary
 * @param {object}  [opts.metadata]   - Extra JSONB data (changed fields, old/new values, etc.)
 * @param {string}  [opts.status]     - "success" | "fail" (default: "success")
 */
async function logActivity({
  req,
  action,
  category,
  targetType = null,
  targetId = null,
  description = null,
  metadata = null,
  status = "success",
}) {
  try {
    const payload = req?.jwtPayload || null;
    const actor_userid = payload?.userid ?? null;
    const actor_regno = payload?.regno ?? null;

    // Resolve actor role title (best-effort, cached per-request via closure)
    let actor_role = null;
    if (actor_userid) {
      try {
        const { rows } = await pool.query(
          `SELECT r.roletitle FROM Roles r JOIN Users u ON r.roleid = u.roleid WHERE u.userid = $1 LIMIT 1`,
          [actor_userid]
        );
        actor_role = rows[0]?.roletitle ?? null;
      } catch (_) {
        // ignore role lookup failure
      }
    }

    // Resolve IP address
    const ip_address =
      (req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim() ||
      req?.socket?.remoteAddress ||
      req?.ip ||
      null;

    await pool.query(
      `INSERT INTO ActivityLogs
        (actor_userid, actor_regno, actor_role, action, category, target_type, target_id, description, metadata, ip_address, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        actor_userid,
        actor_regno,
        actor_role,
        action,
        category,
        targetType,
        targetId !== null ? String(targetId) : null,
        description,
        metadata ? JSON.stringify(metadata) : null,
        ip_address,
        status,
      ]
    );
  } catch (err) {
    // Log to console but never throw — logging must never break the main flow
    console.error("[ActivityLog] Failed to write log:", err?.message || err);
  }
}

module.exports = { logActivity };
