const express = require("express");
const router = express.Router();

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  getApprovedBlogs,
  getUserBlogs
} = require("../controllers/blogs.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

router.route("/create").post(validateBearerToken, createBlog)
router.route("/:blogid").get(getBlogById)
router.route("/userblog/:userid").get(getUserBlogs)
router.route("/").get(getAllBlogs)
router.route("/landing/approved").get(getApprovedBlogs)
router.route("/:blogid").put(validateBearerToken, updateBlog)
router.route("/status/:blogid").put(validateBearerToken, updateBlogStatus)
router.route("/:blogid").delete(validateBearerToken, deleteBlog)

module.exports = router
