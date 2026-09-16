const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");
const blogSvc = require("../services/blogService.js");


// Create a new blog
const createBlog = errorWrapper(
  async (req, res) => {
    const { userid, headline, designation, current_institution, article, photos, blogtype, approval_status } = req.body;
    const blog = await blogSvc.createBlog({ userid, headline, designation, current_institution, article, photos, blogtype, approval_status });

    res.status(201).json(blog);

    await logActivity({
      req,
      action: ActivityAction.BLOG_CREATED,
      category: "blog",
      targetType: "blog",
      targetId: blog.blogid,
      description: `Created blog: ${headline}`,
      metadata: { headline, blogtype }
    });
  },
  { statusCode: 500, message: `Couldn't create blog` }
);

// Get all blogs
const getAllBlogs = errorWrapper(
  async (req, res) => {
    const blogs = await blogSvc.getAllBlogs();
    res.json(blogs);
  },
  { statusCode: 500, message: `Couldn't get blogs` }
);

// Get approved blogs
const getApprovedBlogs = errorWrapper(
  async (req, res) => {
    const blogs = await blogSvc.getApprovedBlogs();
    res.json(blogs);
  },
  { statusCode: 500, message: `Couldn't get approved blogs` }
);

// Get a blog by ID
const getBlogById = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params;
    const blog = await blogSvc.getBlogById(blogid);
    res.json(blog);
  },
  { statusCode: 500, message: `Couldn't get blog by blogid` }
);

const getUserBlogs = errorWrapper(
  async (req, res) => {
    const { userid } = req.params;
    if (!userid) throw new CustomError("User ID is required", 400);
    const blogs = await blogSvc.getUserBlogs(userid);
    res.json(blogs);
  },
  { statusCode: 500, message: `Couldn't get user blogs` }
);

// Update a blog
const updateBlog = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params;
    const { userid, headline, designation, current_institution, article, photos, blogtype, approval_status } = req.body;
    const blog = await blogSvc.updateBlog(blogid, { userid, headline, designation, current_institution, article, photos, blogtype, approval_status });

    await logActivity({
      req,
      action: ActivityAction.BLOG_UPDATED,
      category: "blog",
      targetType: "blog",
      targetId: blogid,
      description: `Updated blog ID: ${blogid} — ${headline}`,
      metadata: { headline, blogtype },
    });

    res.json(blog);
  },
  { statusCode: 500, message: `Couldn't update blog` }
);

const updateBlogStatus = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params;
    const { approval_status } = req.body;
    if (approval_status === undefined) throw new CustomError("approval_status is required", 400);

    const blog = await blogSvc.updateBlogStatus(blogid, approval_status);

    await logActivity({
      req,
      action: ActivityAction.BLOG_STATUS_CHANGED,
      category: "blog",
      targetType: "blog",
      targetId: blogid,
      description: `Blog ID ${blogid} approval status set to: ${approval_status}`,
      metadata: { approval_status },
    });

    res.json(blog);
  },
  { statusCode: 500, message: `Couldn't update blog` }
);

// Delete a blog
const deleteBlog = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params;
    await blogSvc.deleteBlog(blogid);

    await logActivity({
      req,
      action: ActivityAction.BLOG_DELETED,
      category: "blog",
      targetType: "blog",
      targetId: blogid,
      description: `Deleted blog ID: ${blogid}`,
    });

    res.json({ message: "Blog deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete blog` }
);

module.exports = {
  createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog,
  updateBlogStatus, getApprovedBlogs, getUserBlogs
};
