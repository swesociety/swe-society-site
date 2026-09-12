const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const getAllRoles = async () => {
  const { rows } = await pool.query(`
    SELECT r.*, row_to_json(b) AS billingacl
    FROM Roles r LEFT JOIN BillingACL b ON r.billingaclid = b.billingaclid
  `);
  return rows;
};

const getRoleById = async (roleid) => {
  const { rows } = await pool.query(
    `SELECT r.*, row_to_json(b) AS billingacl
     FROM Roles r LEFT JOIN BillingACL b ON r.billingaclid = b.billingaclid
     WHERE r.roleid = $1`,
    [roleid]
  );
  return rows[0] || null;
};

const checkRolesAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT rolesAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
    [userid]
  );
  return rows.length > 0 && rows[0].rolesaccess;
};

const isDefaultRoleConflict = async () => {
  const { rowCount } = await pool.query(`SELECT 1 FROM Roles WHERE isDefaultRole = true`);
  return rowCount && rowCount > 0;
};

const insertRole = async ({
  roletitle, blogaccess, achievementaccess, bulkmailaccess, eventaccess, ecaccess,
  landingpageaccess, membersaccess, noticeaccess, rolesaccess, statisticsaccess,
  isdefaultrole, achievementmanageaccess, userblogaccess, billingaccess, standingsaccess,
  activitylogaccess, billingaclid
}) => {
  const { rows } = await pool.query(
    `INSERT INTO Roles (
      roletitle, blogAccess, achievementAccess, bulkmailAccess, eventAccess, ecAccess,
      landingpageAccess, membersAccess, noticeAccess, rolesAccess, statisticsAccess,
      isDefaultRole, achievementmanageaccess, userblogaccess, billingaccess, standingsaccess,
      activitylogaccess, billingaclid
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
    [
      roletitle, Boolean(blogaccess), Boolean(achievementaccess), Boolean(bulkmailaccess),
      Boolean(eventaccess), Boolean(ecaccess), Boolean(landingpageaccess), Boolean(membersaccess),
      Boolean(noticeaccess), Boolean(rolesaccess), Boolean(statisticsaccess), Boolean(isdefaultrole),
      Boolean(achievementmanageaccess), Boolean(userblogaccess), Boolean(billingaccess),
      Boolean(standingsaccess), Boolean(activitylogaccess), billingaclid
    ]
  );
  return rows[0];
};

const updateRoleById = async (roleid, {
  roletitle, blogaccess, achievementaccess, bulkmailaccess, eventaccess, ecaccess,
  landingpageaccess, membersaccess, noticeaccess, rolesaccess, statisticsaccess,
  achievementmanageaccess, userblogaccess, billingaccess, standingsaccess, activitylogaccess
}) => {
  const { rows } = await pool.query(
    `UPDATE Roles SET
      roletitle=$1, blogAccess=$2, achievementAccess=$3, bulkmailAccess=$4, eventAccess=$5,
      ecAccess=$6, landingpageAccess=$7, membersAccess=$8, noticeAccess=$9, rolesAccess=$10,
      statisticsAccess=$11, achievementmanageaccess=$12, userblogaccess=$13, billingaccess=$14,
      standingsaccess=$15, activitylogaccess=$16
     WHERE roleid=$17 RETURNING *`,
    [
      roletitle, Boolean(blogaccess), Boolean(achievementaccess), Boolean(bulkmailaccess),
      Boolean(eventaccess), Boolean(ecaccess), Boolean(landingpageaccess), Boolean(membersaccess),
      Boolean(noticeaccess), Boolean(rolesaccess), Boolean(statisticsaccess),
      Boolean(achievementmanageaccess), Boolean(userblogaccess), Boolean(billingaccess),
      Boolean(standingsaccess), Boolean(activitylogaccess), roleid
    ]
  );
  return rows[0] || null;
};

const getAclForRole = async (billingaclid) => {
  const { rows } = await pool.query(
    `SELECT row_to_json(b) AS billingacl FROM BillingACL b WHERE billingaclid = $1`,
    [billingaclid]
  );
  return rows[0]?.billingacl ?? null;
};

const getRoleBillingAclId = async (roleid) => {
  const { rows } = await pool.query(`SELECT billingaclid FROM Roles WHERE roleid = $1`, [roleid]);
  return rows[0] || null;
};

const updateRoleBillingAclId = async (roleid, billingaclid) => {
  await pool.query(`UPDATE Roles SET billingaclid=$1 WHERE roleid=$2`, [billingaclid, roleid]);
};

const isRoleDefault = async (roleid) => {
  const { rows } = await pool.query(`SELECT isDefaultRole FROM Roles WHERE roleid = $1`, [roleid]);
  return rows[0] || null;
};

const getDefaultRoleId = async () => {
  const { rows } = await pool.query(`SELECT roleid FROM Roles WHERE isDefaultRole = true`);
  return rows[0]?.roleid || null;
};

const reassignUsersToDefaultRole = async (roleid, defaultRoleId) => {
  await pool.query(`UPDATE Users SET roleid=$1 WHERE roleid=$2`, [defaultRoleId, roleid]);
};

const deleteRoleById = async (roleid) => {
  await pool.query(`DELETE FROM Roles WHERE roleid=$1`, [roleid]);
};

const setNewDefaultRole = async (roleid) => {
  await pool.query("BEGIN");
  await pool.query(`UPDATE Roles SET isDefaultRole=false WHERE isDefaultRole=true`);
  const { rows } = await pool.query(
    `UPDATE Roles SET isDefaultRole=true WHERE roleid=$1 RETURNING *`, [roleid]
  );
  if (rows.length === 0) {
    await pool.query("ROLLBACK");
    throw new CustomError("Role not found", 404);
  }
  await pool.query("COMMIT");
  return rows[0];
};

const getRoleInfo = async () => {
  const { rows } = await pool.query(`
    SELECT Roles.roleid, Roles.roletitle, Roles.isDefaultRole, COUNT(Users.userid) AS user_count
    FROM Roles LEFT JOIN Users ON Roles.roleid = Users.roleid
    GROUP BY Roles.roleid ORDER BY user_count DESC
  `);
  return rows;
};

const checkRoleExists = async (roleid) => {
  const { rows } = await pool.query("SELECT 1 FROM Roles WHERE roleid = $1", [roleid]);
  return rows.length > 0;
};

const assignRoleToUsers = async (roleid, userIds) => {
  const { rowCount } = await pool.query(
    `UPDATE Users SET roleid=$1 WHERE userid = ANY($2)`, [roleid, userIds]
  );
  return rowCount;
};

module.exports = {
  getAllRoles, getRoleById, checkRolesAccess, isDefaultRoleConflict,
  insertRole, updateRoleById, getAclForRole, getRoleBillingAclId, updateRoleBillingAclId,
  isRoleDefault, getDefaultRoleId, reassignUsersToDefaultRole, deleteRoleById,
  setNewDefaultRole, getRoleInfo, checkRoleExists, assignRoleToUsers,
};
