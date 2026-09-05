const express = require("express");
const router = express.Router();

const {
  createNotice,
  getAllNotices,
  updateNotice,
  deleteNotice,
  getNoticeById
} = require("../controllers/generalNotice.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

  router.route("/create").post(createNotice);
  router.route("/:noticeId").get(getNoticeById);
  router.route("/").get(getAllNotices);
  router.route("/:noticeId").put(updateNotice);
  router.route("/:noticeId").delete(deleteNotice);


  module.exports = router;