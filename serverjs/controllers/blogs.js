const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;
const { logActivity } = require("../services/activityLogService.js");


// Create a new blog
const createBlog = errorWrapper(
  async (req, res) => {
    const {
      userid,
      headline,
      designation,
      current_institution,
      article,
      photos,
      blogtype,
      approval_status
    } = req.body

    const { rows } = await pool.query(
      `INSERT INTO Blogs (userid, headline, designation, current_institution, article, photos, blogtype, approval_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        userid,
        headline,
        designation,
        current_institution,
        article,
        photos,
        blogtype,
        approval_status
      ]
    )

    res.status(201).json(rows[0])

    req.jwtPayload = req.jwtPayload || { userid };
    await logActivity({
      req,
      action: "blog.create",
      category: "blog",
      targetType: "blog",
      targetId: rows[0].blogid,
      description: `Created blog: ${headline}`,
      metadata: { headline, blogtype }
    });
  },
  { statusCode: 500, message: `Couldn't create blog` }
)

// Get all blogs
const getAllBlogs = errorWrapper(
  async (req, res) => {
    const blogsQuery = `
        SELECT b.*, u.fullname
        FROM Blogs b
        JOIN Users u ON b.userid = u.userid;
    `

    const { rows } = await pool.query(blogsQuery)
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get blogs` }
)

// get approved blogs
const getApprovedBlogs = errorWrapper(
  async (req, res) => {
    const blogsQuery = `
        SELECT b.*, u.fullname
        FROM Blogs b
        JOIN Users u ON b.userid = u.userid
        WHERE b.approval_status = true;
    `

    const { rows } = await pool.query(blogsQuery)
    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get approved blogs` }
)

// Get a blog by ID
const getBlogById = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params

    const blogQuery = `
        SELECT b.*, u.fullname
        FROM Blogs b
        JOIN Users u ON b.userid = u.userid
        WHERE b.blogid = $1;
    `

    const { rows } = await pool.query(blogQuery, [blogid])

    if (rows.length === 0) {
      throw new CustomError("Blog not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't get blog by blogid` }
)

const getUserBlogs = errorWrapper(
  async (req, res) => {
    const { userid } = req.params

    if (!userid) {
      throw new CustomError("User ID is required", 400)
    }

    const blogsQuery = `
        SELECT b.*, u.fullname
        FROM Blogs b
        JOIN Users u ON b.userid = u.userid
        WHERE b.userid = $1;
    `

    const { rows } = await pool.query(blogsQuery, [userid])

    res.json(rows)
  },
  { statusCode: 500, message: `Couldn't get user blogs` }
)

// Update a blog
const updateBlog = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params
    const {
      userid,
      headline,
      designation,
      current_institution,
      article,
      photos,
      blogtype,
      approval_status
    } = req.body

    const { rows } = await pool.query(
      `UPDATE Blogs
     SET userid = $1, headline = $2, designation = $3, current_institution = $4, article = $5, photos = $6, blogtype = $7, approval_status = $8
     WHERE blogid = $9 RETURNING *`,
      [
        userid,
        headline,
        designation,
        current_institution,
        article,
        photos,
        blogtype,
        approval_status,
        blogid
      ]
    )

    if (rows.length === 0) {
      throw new CustomError("Blog not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update blog` }
)

const updateBlogStatus = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params
    const { approval_status } = req.body

    if (approval_status === undefined) {
      throw new CustomError("approval_status is required", 400)
    }

    const { rows } = await pool.query(
      `UPDATE Blogs
     SET approval_status = $1
     WHERE blogid = $2
     RETURNING *`,
      [approval_status, blogid]
    )

    if (rows.length === 0) {
      throw new CustomError("Blog not found", 404)
    }

    res.json(rows[0])
  },
  { statusCode: 500, message: `Couldn't update blog` }
)

// Delete a blog
const deleteBlog = errorWrapper(
  async (req, res) => {
    const { blogid } = req.params
    const { rowCount } = await pool.query(
      "DELETE FROM Blogs WHERE blogid = $1",
      [blogid]
    )

    if (rowCount === 0) {
      throw new CustomError("Blog not found", 404)
    }

    res.json({ message: "Blog deleted successfully" })
  },
  { statusCode: 500, message: `Couldn't delete blog` }
)

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
  getApprovedBlogs,
  getUserBlogs
}
