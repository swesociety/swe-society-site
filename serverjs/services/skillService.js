const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

// ─── Skills ───────────────────────────────────────────────────────────────────

const createSkill = async (skill, area) => {
  const { rows } = await pool.query(
    "INSERT INTO Skills (skill, area) VALUES ($1, $2) RETURNING *", [skill, area]
  );
  return rows[0];
};

const getAllSkills = async () => {
  const { rows } = await pool.query("SELECT * FROM Skills");
  return rows;
};

const updateSkill = async (skillId, skill, area) => {
  const { rows } = await pool.query(
    "UPDATE Skills SET skill=$1, area=$2 WHERE skill_id=$3 RETURNING *", [skill, area, skillId]
  );
  if (rows.length === 0) throw new CustomError("Skill not found", 404);
  return rows[0];
};

const deleteSkill = async (skillId) => {
  const { rowCount } = await pool.query("DELETE FROM Skills WHERE skill_id = $1", [skillId]);
  if (rowCount === 0) throw new CustomError("Skill not found", 404);
};

// ─── User Skills ──────────────────────────────────────────────────────────────

const createUserSkill = async (userid, skill_id) => {
  const { rows } = await pool.query(
    "INSERT INTO UserSkills (userid, skill_id) VALUES ($1, $2) RETURNING *", [userid, skill_id]
  );
  return rows[0];
};

const getAllUserSkills = async () => {
  const { rows } = await pool.query("SELECT * FROM UserSkills");
  return rows;
};

const updateUserSkill = async (userSkillId, userid, skill_id) => {
  const { rows } = await pool.query(
    "UPDATE UserSkills SET userid=$1, skill_id=$2 WHERE userskillid=$3 RETURNING *",
    [userid, skill_id, userSkillId]
  );
  if (rows.length === 0) throw new CustomError("User skill not found", 404);
  return rows[0];
};

const deleteUserSkill = async (userSkillId) => {
  const { rowCount } = await pool.query(
    "DELETE FROM UserSkills WHERE userskillid = $1", [userSkillId]
  );
  if (rowCount === 0) throw new CustomError("User skill not found", 404);
};

const getUserSkills = async (userid) => {
  const { rows } = await pool.query(
    `SELECT s.skill_id, s.skill
     FROM Skills s JOIN UserSkills us ON s.skill_id = us.skill_id
     WHERE us.userid = $1`,
    [userid]
  );
  return rows;
};

const addUserMultipleSkills = async (userid, skills) => {
  const { rows: insertedSkills } = await pool.query(
    `INSERT INTO UserSkills (userid, skill_id)
     SELECT $1, unnest($2::int[])
     ON CONFLICT (userid, skill_id) DO NOTHING
     RETURNING skill_id`,
    [userid, skills]
  );

  if (insertedSkills.length === 0) return { insertedSkills: [], skillDetails: [] };

  const skillIds = insertedSkills.map(s => s.skill_id);
  const { rows: skillDetails } = await pool.query(
    "SELECT skill_id, skill FROM Skills WHERE skill_id = ANY($1::int[])", [skillIds]
  );

  return { insertedSkills, skillDetails };
};

module.exports = {
  createSkill, getAllSkills, updateSkill, deleteSkill,
  createUserSkill, getAllUserSkills, updateUserSkill, deleteUserSkill,
  getUserSkills, addUserMultipleSkills,
};
