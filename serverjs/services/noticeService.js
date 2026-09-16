const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const createNotice = async ({ notice_provider, notice_date, expire_date, headline, notice_body, picture, file }) => {
  const { rows } = await pool.query(
    "INSERT INTO GeneralNotices (notice_provider, notice_date, expire_date, headline, notice_body, picture, file) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
    [notice_provider, notice_date, expire_date, headline, notice_body, picture, file]
  );
  return rows[0];
};

const getAllNotices = async () => {
  const { rows } = await pool.query("SELECT * FROM GeneralNotices");
  return rows;
};

const updateNotice = async (noticeId, { notice_provider, notice_date, expire_date, headline, notice_body, picture, file }) => {
  const { rows } = await pool.query(
    "UPDATE GeneralNotices SET notice_provider=$1, notice_date=$2, expire_date=$3, headline=$4, notice_body=$5, picture=$6, file=$7 WHERE noticeId=$8 RETURNING *",
    [notice_provider, notice_date, expire_date, headline, notice_body, picture, file, noticeId]
  );
  if (rows.length === 0) throw new CustomError("Notice not found", 404);
  return rows[0];
};

const getNoticeById = async (noticeId) => {
  const { rows } = await pool.query("SELECT * FROM GeneralNotices WHERE noticeId = $1", [noticeId]);
  if (rows.length === 0) throw new CustomError("Notice not found", 404);
  return rows[0];
};

const deleteNotice = async (noticeId) => {
  const { rowCount } = await pool.query("DELETE FROM GeneralNotices WHERE noticeId = $1", [noticeId]);
  if (rowCount === 0) throw new CustomError("Notice not found", 404);
};

module.exports = { createNotice, getAllNotices, updateNotice, getNoticeById, deleteNotice };
