const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");

const createBlog = async ({ userid, headline, designation, current_institution, article, photos, blogtype, approval_status }) => {
  const { rows } = await pool.query(
    `INSERT INTO Blogs (userid, headline, designation, current_institution, article, photos, blogtype, approval_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [userid, headline, designation, current_institution, article, photos, blogtype, approval_status]
  );
  return rows[0];
};

const getAllBlogs = async () => {
  const { rows } = await pool.query(
    `SELECT b.*, u.fullname FROM Blogs b JOIN Users u ON b.userid = u.userid`
  );
  return rows;
};

const getApprovedBlogs = async () => {
  const { rows } = await pool.query(
    `SELECT b.*, u.fullname FROM Blogs b JOIN Users u ON b.userid = u.userid WHERE b.approval_status = true`
  );
  return rows;
};

const getBlogById = async (blogid) => {
  const { rows } = await pool.query(
    `SELECT b.*, u.fullname FROM Blogs b JOIN Users u ON b.userid = u.userid WHERE b.blogid = $1`,
    [blogid]
  );
  if (rows.length === 0) throw new CustomError("Blog not found", 404);
  return rows[0];
};

const getUserBlogs = async (userid) => {
  const { rows } = await pool.query(
    `SELECT b.*, u.fullname FROM Blogs b JOIN Users u ON b.userid = u.userid WHERE b.userid = $1`,
    [userid]
  );
  return rows;
};

const updateBlog = async (blogid, { userid, headline, designation, current_institution, article, photos, blogtype, approval_status }) => {
  const { rows } = await pool.query(
    `UPDATE Blogs SET userid=$1, headline=$2, designation=$3, current_institution=$4, article=$5, photos=$6, blogtype=$7, approval_status=$8
     WHERE blogid=$9 RETURNING *`,
    [userid, headline, designation, current_institution, article, photos, blogtype, approval_status, blogid]
  );
  if (rows.length === 0) throw new CustomError("Blog not found", 404);
  return rows[0];
};

const updateBlogStatus = async (blogid, approval_status) => {
  const { rows } = await pool.query(
    `UPDATE Blogs SET approval_status=$1 WHERE blogid=$2 RETURNING *`,
    [approval_status, blogid]
  );
  if (rows.length === 0) throw new CustomError("Blog not found", 404);
  return rows[0];
};

const deleteBlog = async (blogid) => {
  const { rowCount } = await pool.query("DELETE FROM Blogs WHERE blogid = $1", [blogid]);
  if (rowCount === 0) throw new CustomError("Blog not found", 404);
};

module.exports = {
  createBlog, getAllBlogs, getApprovedBlogs, getBlogById,
  getUserBlogs, updateBlog, updateBlogStatus, deleteBlog,
};
