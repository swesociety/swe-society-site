const pool = require("../db/dbconnect.js").pool;

async function getUserProfileById(userId) {
  const { rows } = await pool.query(
    `
      SELECT
        u.userid,
        u.fullname,
        u.email,
        u.regno,
        u.session,
        r.roletitle AS role,
        u.profile_picture,
        u.bio,
        u.linkedin_id,
        u.github_id,
        u.stop_stalk_id,
        u.whatsapp,
        u.facebook_id,
        u.blood_group,
        u.school,
        u.college,
        u.hometown,
        u.cv,
        u.experience,
        u.projects,
        u.skills,
        u.is_alumni,
        COALESCE((
          SELECT json_agg(
            json_build_object(
              'post_name', cp.post_name,
              'committee_name', ec.committee_name,
              'committee_year', ec.year
            )
            ORDER BY ec.year DESC, ec.committeeid DESC, cp.post_name
          )
          FROM Committee c
          JOIN Committeeposts cp ON c.postid = cp.committeepostid
          JOIN ExecutiveCommittees ec ON c.executive_committeeid = ec.committeeid
          WHERE c.userid = u.userid
        ), '[]'::json) AS committee_memberships
      FROM Users u
      LEFT JOIN Roles r ON u.roleid = r.roleid
      WHERE u.userId = $1
    `,
    [userId],
  );

  return rows[0] || null;
}

const getAllUsers = async () => {
  const { rows } = await pool.query(`
    SELECT
      u.userid, u.fullname, u.email, u.regno, u.session,
      r.roletitle AS role, u.profile_picture, u.bio, u.linkedin_id,
      u.github_id, u.stop_stalk_id, u.whatsapp, u.facebook_id,
      u.blood_group, u.school, u.college, u.hometown, u.cv,
      u.experience, u.projects, u.skills, u.is_alumni
    FROM Users u LEFT JOIN Roles r ON u.roleid = r.roleid
  `);
  return rows;
};

const ALLOWED_UPDATE_FIELDS = [
  "bio", "blood_group", "college", "cv", "email", "experience",
  "facebook_id", "fullname", "github_id", "hometown", "linkedin_id",
  "profile_picture", "projects", "school", "session", "skills",
  "stop_stalk_id", "whatsapp", "phone_number"
];

const updateUserFields = async (userId, updates) => {
  const fields = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (ALLOWED_UPDATE_FIELDS.includes(key)) {
      fields.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (fields.length === 0) return null;

  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE Users SET ${fields.join(", ")} WHERE userId = $${index} RETURNING *`,
    values
  );
  return rows[0] || null;
};

const deleteUser = async (userId) => {
  const { rowCount } = await pool.query("DELETE FROM Users WHERE userId = $1", [userId]);
  return rowCount;
};

const deleteMultipleUsers = async (userIds) => {
  const { rowCount } = await pool.query(
    "DELETE FROM Users WHERE userId = ANY($1::int[])", [userIds]
  );
  return rowCount;
};

const checkMembersAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT membersaccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
    [userid]
  );
  return rows.length > 0 && rows[0].membersaccess;
};

const getRoleAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT
      blogaccess              AS blog,
      achievementaccess       AS achievement,
      achievementmanageaccess AS achievementmanage,
      bulkmailaccess          AS bulkmail,
      eventaccess             AS events,
      ecaccess                AS ec,
      landingpageaccess       AS landingpage,
      membersaccess           AS member,
      noticeaccess            AS notice,
      rolesaccess             AS roles,
      userblogaccess          AS usersblog,
      billingaccess           AS billing,
      statisticsaccess        AS statistics,
      standingsaccess         AS standings,
      activitylogaccess       AS activitylog,
      b.billingaclid,
      b.hasbillingaccess      AS acl_hasbillingaccess,
      b.canverifytransaction  AS acl_canverifytransaction,
      b.canaccepttransaction  AS acl_canaccepttransaction,
      b.canaddtransaction     AS acl_canaddtransaction,
      b.candeletetransaction  AS acl_candeletetransaction,
      b.canviewpaymentmethod  AS acl_canviewpaymentmethod,
      b.caneditpaymentmethod  AS acl_caneditpaymentmethod,
      b.candeletepaymentmethod AS acl_candeletepaymentmethod,
      b.canviewpaymenttype     AS acl_canviewpaymenttype,
      b.caneditpaymenttype     AS acl_caneditpaymenttype,
      b.candeletepaymenttype   AS acl_candeletepaymenttype
   FROM Roles
   JOIN Users ON Roles.roleid = Users.roleid
   LEFT JOIN BillingACL b ON Roles.billingaclid = b.billingaclid
   WHERE Users.userid = $1`,
    [userid]
  );

  if (rows.length === 0) return null;

  const r = rows[0];

  return {
    statistics:        r.statistics        || false,
    achievement:       r.achievement       || false,
    achievementmanage: r.achievementmanage || false,
    blog:              r.blog              || false,
    member:            r.member            || false,
    notice:            r.notice            || false,
    bulkmail:          r.bulkmail          || false,
    landingpage:       r.landingpage       || false,
    events:            r.events            || false,
    ec:                r.ec                || false,
    roles:             r.roles             || false,
    usersblog:         r.usersblog         || false,
    billing:           r.billing           || false,
    standings:         r.standings         || false,
    activitylog:       r.activitylog       || false,
    billingacl: {
      hasBillingAccess:     r.acl_hasbillingaccess     || false,
      canVerifyTransaction: r.acl_canverifytransaction || false,
      canAcceptTransaction: r.acl_canaccepttransaction || false,
      canAddTransaction:    r.acl_canaddtransaction    || false,
      canDeleteTransaction: r.acl_candeletetransaction || false,
      canViewPaymentMethod: r.acl_canviewpaymentmethod || false,
      canEditPaymentMethod: r.acl_caneditpaymentmethod || false,
      canDeletePaymentMethod: r.acl_candeletepaymentmethod || false,
      canViewPaymentType: r.acl_canviewpaymenttype || false,
      canEditPaymentType: r.acl_caneditpaymenttype || false,
      canDeletePaymentType: r.acl_candeletepaymenttype || false
    }
  };
};

module.exports = {
  getUserProfileById,
  getAllUsers,
  updateUserFields,
  ALLOWED_UPDATE_FIELDS,
  deleteUser,
  deleteMultipleUsers,
  checkMembersAccess,
  getRoleAccess,
};
