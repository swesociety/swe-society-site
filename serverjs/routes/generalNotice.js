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

  router.route("/create").post(validateBearerToken, createNotice);
  router.route("/:noticeId").get(getNoticeById);
  router.route("/").get(getAllNotices);
  router.route("/:noticeId").put(validateBearerToken, updateNotice);
  router.route("/:noticeId").delete(validateBearerToken, deleteNotice);


  module.exports = router;