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


router.route("/create").post(createBlog)
router.route("/:blogid").get(getBlogById)
router.route("/userblog/:userid").get(getUserBlogs)
router.route("/").get(getAllBlogs)
router.route("/landing/approved").get(getApprovedBlogs)
router.route("/:blogid").put(updateBlog)
router.route("/status/:blogid").put(updateBlogStatus)
router.route("/:blogid").delete(deleteBlog)

module.exports = router
