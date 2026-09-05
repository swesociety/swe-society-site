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

module.exports = {
  getUserProfileById,
};
