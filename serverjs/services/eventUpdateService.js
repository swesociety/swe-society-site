const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const createEventUpdate = async (eventid, caption, photos) => {
  const photosArray = photos instanceof Array ? photos : [photos];
  const { rows } = await pool.query(
    "INSERT INTO Event_Updates (eventid, caption, photos) VALUES ($1, $2, $3) RETURNING *",
    [eventid, caption, photosArray]
  );
  return rows[0];
};

const getAllEventUpdates = async () => {
  const { rows } = await pool.query("SELECT * FROM Event_Updates");
  return rows;
};

const getEventUpdateById = async (event_updateid) => {
  const { rows } = await pool.query(
    "SELECT * FROM Event_Updates WHERE event_updateid = $1", [event_updateid]
  );
  if (rows.length === 0) throw new CustomError("Event update not found", 404);
  return rows[0];
};

const updateEventUpdate = async (eventid, { event_creator, start_time, end_time, headline, event_details, coverphoto }) => {
  const { rows } = await pool.query(
    "UPDATE Events SET event_creator=$1, start_time=$2, end_time=$3, headline=$4, event_details=$5, coverphoto=$6 WHERE eventid=$7 RETURNING *",
    [event_creator, start_time, end_time, headline, event_details, coverphoto, eventid]
  );
  if (rows.length === 0) throw new CustomError("Event not found", 404);
  return rows[0];
};

const deleteEventUpdate = async (event_updateid) => {
  const { rowCount } = await pool.query(
    "DELETE FROM Event_Updates WHERE event_updateid = $1", [event_updateid]
  );
  if (rowCount === 0) throw new CustomError("Event update not found", 404);
};

module.exports = {
  createEventUpdate, getAllEventUpdates, getEventUpdateById,
  updateEventUpdate, deleteEventUpdate,
};
