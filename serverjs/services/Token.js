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

const generateToken = (info, expiry) => {
  const secret = "societyJwtKey"
  if (!secret) {
    throw new CustomError("JWT secret is undefined.", 500)
  }
  return jwt.sign(info, secret, { expiresIn: expiry })
}

const verifyToken = token => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT secret is undefined.")
  }
  if (tokenBlacklist.has(token)) {
    throw new CustomError("User is logged out!", 401)
  }

  return jwt.verify(token, secret)
}

const invalidateToken = token => {
  tokenBlacklist.add(token)
  return
}

module.exports = { generateToken, getToken, invalidateToken, verifyToken }
