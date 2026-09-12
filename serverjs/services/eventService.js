const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const checkEventAccess = async (userid) => {
  const { rows } = await pool.query(
    `SELECT eventAccess FROM Roles JOIN Users ON Roles.roleid = Users.roleid WHERE Users.userid = $1`,
    [userid]
  );
  return rows.length > 0 && rows[0].eventaccess;
};

const createEvent = async (userid, { start_time, end_time, headline, event_details, coverphoto }) => {
  const { rows } = await pool.query(
    "INSERT INTO Events (event_creator, start_time, end_time, headline, event_details, coverphoto) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [userid, start_time, end_time, headline, event_details, coverphoto]
  );
  return rows[0];
};

const getAllEvents = async () => {
  const { rows } = await pool.query(
    "SELECT eventid, start_time, end_time, headline, event_details, coverphoto, fullname, created_time FROM Events JOIN Users ON Events.event_creator = Users.userId ORDER BY start_time DESC"
  );
  return rows;
};

const updateEvent = async (eventid, userid, { start_time, end_time, headline, event_details, coverphoto }) => {
  const { rows } = await pool.query(
    "UPDATE Events SET event_creator=$1, start_time=$2, end_time=$3, headline=$4, event_details=$5, coverphoto=$6 WHERE eventid=$7 RETURNING *",
    [userid, start_time, end_time, headline, event_details, coverphoto, eventid]
  );
  if (rows.length === 0) throw new CustomError("Event not found", 404);
  return rows[0];
};

const getEventById = async (eventid) => {
  const { rows } = await pool.query("SELECT * FROM Events WHERE eventid = $1", [eventid]);
  if (rows.length === 0) throw new CustomError("Event not found", 404);
  return rows[0];
};

const deleteEvent = async (eventid) => {
  const { rowCount } = await pool.query("DELETE FROM Events WHERE eventid = $1", [eventid]);
  if (rowCount === 0) throw new CustomError("Event not found", 404);
};

module.exports = {
  checkEventAccess, createEvent, getAllEvents, updateEvent, getEventById, deleteEvent,
};
