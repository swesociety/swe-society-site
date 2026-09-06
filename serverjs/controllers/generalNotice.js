const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;
const { logActivity } = require("../services/activityLogService.js");


const createNotice = errorWrapper(
  async (req, res) => {
    const {
      notice_provider,
      notice_date,
      expire_date,
      headline,
      notice_body,
      picture,
      file
    } = req.body

    const {
      rows
    } = await pool.query(
      "INSERT INTO GeneralNotices (notice_provider, notice_date, expire_date, headline, notice_body, picture, file) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        notice_provider,
        notice_date,
        expire_date,
        headline,
        notice_body,
        picture,
        file
      ]
    )

    await logActivity({
      req,
      action: "notice.create",
      category: "notice",
      targetType: "notice",
      targetId: rows[0].noticeid,
      description: `Created notice: ${headline}`,
      metadata: { headline, notice_date, expire_date }
    });

    res.status(201).json(rows[0])
  },
  { statusCode: 500, message: `Couldn't create notice` }
)

const getAllNotices = errorWrapper(
  async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM GeneralNotices")
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get notices` }
)

const updateNotice = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params
    const {
      notice_provider,
      notice_date,
      expire_date,
      headline,
      notice_body,
      picture,
      file
    } = req.body
    const {
      rows
    } = await pool.query(
      "UPDATE GeneralNotices SET notice_provider = $1, notice_date = $2, expire_date = $3, headline = $4, notice_body = $5, picture = $6, file = $7 WHERE noticeId = $8 RETURNING *",
      [
        notice_provider,
        notice_date,
        expire_date,
        headline,
        notice_body,
        picture,
        file,
        noticeId
      ]
    )

    if (rows.length === 0) {
      throw new CustomError("Notice not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update notice` }
)

const getNoticeById = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params
    const {
      rows
    } = await pool.query("SELECT * FROM GeneralNotices WHERE noticeId = $1", [
      noticeId
    ])

    if (rows.length === 0) {
      throw new CustomError("Notice not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get notice by noticeId` }
)

const deleteNotice = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params
    const {
      rowCount
    } = await pool.query("DELETE FROM GeneralNotices WHERE noticeId = $1", [
      noticeId
    ])

    if (rowCount === 0) {
      throw new CustomError("Notice not found", 404)
    }

    res.json({ message: "Notice deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete notice` }
)

module.exports = {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
  getNoticeById
}
