const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

// ─── Teams ────────────────────────────────────────────────────────────────────

const createTeam = async (teamname, mentor) => {
  const { rows } = await pool.query(
    "INSERT INTO Teams (teamname, mentor) VALUES ($1, $2) RETURNING *",
    [teamname, mentor],
  );
  return rows[0];
};

const getAllTeams = async () => {
  const { rows } = await pool.query("SELECT * FROM Teams");
  return rows;
};

const updateTeam = async (teamid, { teamname, mentor }) => {
  const updates = [];
  const values = [];

  if (teamname) {
    updates.push("teamname = $" + (updates.length + 1));
    values.push(teamname);
  }
  if (mentor) {
    updates.push("mentor = $" + (updates.length + 1));
    values.push(mentor);
  }
  if (updates.length === 0) throw new CustomError("No fields to update", 400);

  values.push(teamid);
  const { rows } = await pool.query(
    `UPDATE Teams SET ${updates.join(", ")} WHERE teamid = $${values.length} RETURNING *`,
    values,
  );
  if (rows.length === 0) throw new CustomError("Team not found", 404);
  return rows[0];
};

const deleteTeam = async (teamid) => {
  const { rowCount } = await pool.query("DELETE FROM Teams WHERE teamid = $1", [
    teamid,
  ]);
  if (rowCount === 0) throw new CustomError("Team not found", 404);
};

// ─── Team Members ─────────────────────────────────────────────────────────────

const addTeamMember = async ({
  teamid,
  userid,
  othermember,
  other_member_institute,
}) => {
  const columns = ["teamid"];
  const values = [teamid];
  const placeholders = ["$1"];

  if (userid) {
    columns.push("userid");
    values.push(userid);
    placeholders.push(`$${placeholders.length + 1}`);
  }
  if (othermember) {
    columns.push("othermember");
    values.push(othermember);
    placeholders.push(`$${placeholders.length + 1}`);
  }
  if (other_member_institute) {
    columns.push("other_member_institute");
    values.push(other_member_institute);
    placeholders.push(`$${placeholders.length + 1}`);
  }

  const { rows } = await pool.query(
    `INSERT INTO TeamMembers (${columns.join(", ")}) VALUES (${placeholders.join(", ")}) RETURNING *`,
    values,
  );
  return rows[0];
};

const getAllTeamMembers = async () => {
  const { rows } = await pool.query("SELECT * FROM TeamMembers");
  return rows;
};

const getTeamMembersByTeamId = async (teamid) => {
  const { rows } = await pool.query(
    "SELECT * FROM TeamMembers WHERE teamid = $1",
    [teamid],
  );
  return rows;
};

const removeTeamMember = async (userid, teamid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM TeamMembers WHERE userid = $1 AND teamid = $2",
    [userid, teamid],
  );
  if (rowCount === 0) throw new CustomError("Team member not found", 404);
};

// ─── Achievements ─────────────────────────────────────────────────────────────

const createAchievement = async ({
  teamid,
  eventname,
  organizer,
  venu,
  startdate,
  enddate,
  rank,
  rankarea,
  task,
  solution,
  techstack,
  resources,
  photos,
  approval_status,
}) => {
  const { rows } = await pool.query(
    `INSERT INTO Achievements (teamid, eventname, organizer, venu, startdate, enddate, rank, rankarea, task, solution, techstack, resources, photos, approval_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
    [
      teamid,
      eventname,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status,
    ],
  );
  return rows[0];
};

const getAllAchievements = async () => {
  const { rows } = await pool.query("SELECT * FROM Achievements");
  return rows;
};

const getAchievementById = async (achieveid) => {
  const { rows } = await pool.query(
    "SELECT * FROM Achievements WHERE achieveid = $1",
    [achieveid],
  );
  if (rows.length === 0) throw new CustomError("Achievement not found", 404);
  return rows[0];
};

const updateAchievement = async (
  achieveid,
  {
    eventname,
    organizer,
    venu,
    startdate,
    enddate,
    rank,
    rankarea,
    task,
    solution,
    techstack,
    resources,
    photos,
    approval_status,
  },
) => {
  const { rows } = await pool.query(
    `UPDATE Achievements SET eventname=$1,organizer=$2,venu=$3,startdate=$4,enddate=$5,rank=$6,rankarea=$7,task=$8,solution=$9,techstack=$10,resources=$11,photos=$12,approval_status=$13
     WHERE achieveid=$14 RETURNING *`,
    [
      eventname,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status,
      achieveid,
    ],
  );
  if (rows.length === 0) throw new CustomError("Achievement not found", 404);
  return rows[0];
};

const updateAchievementStatus = async (achieveid, approval_status) => {
  const { rows } = await pool.query(
    `UPDATE Achievements SET approval_status=$1 WHERE achieveid=$2 RETURNING *`,
    [approval_status, achieveid],
  );
  if (rows.length === 0) throw new CustomError("Achievement not found", 404);
  return rows[0];
};

const deleteAchievement = async (achieveid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM Achievements WHERE achieveid = $1",
    [achieveid],
  );
  if (rowCount === 0) throw new CustomError("Achievement not found", 404);
};

const getUserAchievements = async (userid) => {
  const { rows } = await pool.query(
    `SELECT a.achieveid, a.teamid, t.teamname, t.mentor, a.eventname, a.segment,
            a.organizer, a.venu, a.startdate, a.enddate, a.rank, a.rankarea,
            a.task, a.solution, a.techstack, a.resources, a.photos, a.approval_status,
            (SELECT json_agg(json_build_object('userid',u.userid,'fullname',u.fullname,'session',u.session))
             FROM TeamMembers tm JOIN Users u ON tm.userid=u.userid WHERE tm.teamid=a.teamid) AS teamMembers
     FROM Achievements a
     JOIN TeamMembers tm ON a.teamid=tm.teamid
     JOIN Teams t ON a.teamid=t.teamid
     WHERE tm.userid=$1`,
    [userid],
  );
  return rows;
};

const getAllAchievementsFull = async () => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (a.achieveid)
            a.achieveid, a.teamid, t.teamname, t.mentor, a.eventname, a.segment,
            a.organizer, a.venu, a.startdate, a.enddate, a.rank, a.rankarea,
            a.task, a.solution, a.techstack, a.resources, a.photos, a.approval_status,
            (SELECT json_agg(json_build_object('userid',u.userid,'fullname',u.fullname,'session',u.session))
             FROM TeamMembers tm JOIN Users u ON tm.userid=u.userid WHERE tm.teamid=a.teamid) AS teamMembers
     FROM Achievements a
     LEFT JOIN TeamMembers tm ON a.teamid=tm.teamid
     LEFT JOIN Teams t ON a.teamid=t.teamid
     WHERE a.achieveid >= 0`,
  );
  return rows;
};

const getApprovedAchievements = async () => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (a.achieveid)
            a.achieveid, a.teamid, t.teamname, t.mentor, a.eventname, a.segment,
            a.organizer, a.venu, a.startdate, a.enddate, a.rank, a.rankarea,
            a.task, a.solution, a.techstack, a.resources, a.photos, a.approval_status,
            (SELECT json_agg(json_build_object('userid',u.userid,'fullname',u.fullname,'session',u.session))
             FROM TeamMembers tm JOIN Users u ON tm.userid=u.userid WHERE tm.teamid=a.teamid) AS teamMembers
     FROM Achievements a
     JOIN TeamMembers tm ON a.teamid=tm.teamid
     JOIN Teams t ON a.teamid=t.teamid
     WHERE a.approval_status=true
     ORDER BY a.achieveid`,
  );
  return rows;
};

// ─── Composite Transaction ────────────────────────────────────────────────────

const insertTeamMembersInTransaction = async (teamid, teammembers, others) => {
  const queries = [];
  if (Array.isArray(teammembers)) {
    for (const userid of teammembers) {
      queries.push(
        pool.query(
          "INSERT INTO TeamMembers (teamid, userid) VALUES ($1, $2) RETURNING *",
          [teamid, userid],
        ),
      );
    }
  }
  if (Array.isArray(others)) {
    for (const { othermember, other_member_institute } of others) {
      queries.push(
        pool.query(
          "INSERT INTO TeamMembers (teamid, othermember, other_member_institute) VALUES ($1, $2, $3) RETURNING *",
          [teamid, othermember, other_member_institute],
        ),
      );
    }
  }
  const results = await Promise.all(queries);
  return results.map((r) => r.rows[0]);
};

const insertAchievementInTransaction = async (
  client,
  teamid,
  eventname,
  segment,
  organizer,
  venu,
  startdate,
  enddate,
  rank,
  rankarea,
  task,
  solution,
  techstack,
  resources,
  photos,
  approval_status,
) => {
  const { rows } = await client.query(
    `INSERT INTO Achievements
       (teamid,eventname,segment,organizer,venu,startdate,enddate,rank,rankarea,task,solution,techstack,resources,photos,approval_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
    [
      teamid,
      eventname,
      segment,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status,
    ],
  );
  if (rows.length === 0)
    throw new CustomError("Could not create achievement", 500);
  return rows[0];
};

const createTeamAndAchievementTransaction = async ({
  teamname,
  mentor,
  teammembers,
  others,
  eventname,
  segment,
  organizer,
  venu,
  startdate,
  enddate,
  rank,
  rankarea,
  task,
  solution,
  techstack,
  resources,
  photos,
  approval_status,
}) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: teamRows } = await client.query(
      "INSERT INTO Teams (teamname, mentor) VALUES ($1, $2) RETURNING *",
      [teamname, mentor],
    );
    if (teamRows.length === 0)
      throw new CustomError("Could not create team", 500);
    const teamid = teamRows[0].teamid;

    await insertTeamMembersInTransaction(teamid, teammembers, others);

    const achievement = await insertAchievementInTransaction(
      client,
      teamid,
      eventname,
      segment,
      organizer,
      venu,
      startdate,
      enddate,
      rank,
      rankarea,
      task,
      solution,
      techstack,
      resources,
      photos,
      approval_status,
    );

    await client.query("COMMIT");
    return { team: { teamid, teamname, mentor }, achievement };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createTeam,
  getAllTeams,
  updateTeam,
  deleteTeam,
  addTeamMember,
  getAllTeamMembers,
  getTeamMembersByTeamId,
  removeTeamMember,
  createAchievement,
  getAllAchievements,
  getAchievementById,
  updateAchievement,
  updateAchievementStatus,
  deleteAchievement,
  getUserAchievements,
  getAllAchievementsFull,
  getApprovedAchievements,
  createTeamAndAchievementTransaction,
};
