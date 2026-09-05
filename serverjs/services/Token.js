const jwt = require("jsonwebtoken");
const CustomError = require("./CustomError.js");


const tokenBlacklist = new Set()

const getToken = req => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.split(" ")[1]
}

const JWT_SECRET = process.env.JWT_SECRET || "societyJwtKey"

const generateToken = (info, expiry) => {
  return jwt.sign(info, JWT_SECRET, { expiresIn: expiry })
}

const verifyToken = token => {
  if (tokenBlacklist.has(token)) {
    throw new CustomError("User is logged out!", 401)
  }

  return jwt.verify(token, JWT_SECRET)
}

const invalidateToken = token => {
  tokenBlacklist.add(token)
  return
}

module.exports = { generateToken, getToken, invalidateToken, verifyToken }
