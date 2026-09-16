const errorWrapper = require("../middlewares/errorWrapper.js");
const noticeService = require("../services/noticeService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

const createNotice = errorWrapper(
  async (req, res) => {
    const { headline, notice_date, expire_date } = req.body;
    const newNotice = await noticeService.createNotice(req.body);

    await logActivity({
      req,
      action: ActivityAction.NOTICE_CREATED,
      category: "notice",
      targetType: "notice",
      targetId: newNotice.noticeid,
      description: `Created notice: ${headline}`,
      metadata: { headline, notice_date, expire_date }
    });

    res.status(201).json(newNotice);
  },
  { statusCode: 500, message: `Couldn't create notice` }
);

const getAllNotices = errorWrapper(
  async (req, res) => {
    const notices = await noticeService.getAllNotices();
    res.json(notices);
  },
  { statusCode: 500, message: `Couldn't get notices` }
);

const updateNotice = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params;
    const { headline } = req.body;
    const updatedNotice = await noticeService.updateNotice(noticeId, req.body);

    await logActivity({
      req,
      action: ActivityAction.NOTICE_UPDATED,
      category: "notice",
      targetType: "notice",
      targetId: noticeId,
      description: `Updated notice ID: ${noticeId} — ${headline}`,
      metadata: { headline },
    });

    res.json(updatedNotice);
  },
  { statusCode: 500, message: `Couldn't update notice` }
);

const getNoticeById = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params;
    const notice = await noticeService.getNoticeById(noticeId);
    res.json(notice);
  },
  { statusCode: 500, message: `Couldn't get notice by noticeId` }
);

const deleteNotice = errorWrapper(
  async (req, res) => {
    const { noticeId } = req.params;
    await noticeService.deleteNotice(noticeId);

    await logActivity({
      req,
      action: ActivityAction.NOTICE_DELETED,
      category: "notice",
      targetType: "notice",
      targetId: noticeId,
      description: `Deleted notice ID: ${noticeId}`,
    });

    res.json({ message: "Notice deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete notice` }
);

module.exports = {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
  getNoticeById
};
