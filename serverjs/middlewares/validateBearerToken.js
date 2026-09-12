const CustomError = require("../services/CustomError.js");
const { getToken, verifyToken } = require("../services/Token.js");

const validateBearerToken = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) {
      throw new CustomError("Authorization token missing.", 401);
    }
    const decodedToken = verifyToken(token);
    if (decodedToken && decodedToken.userid && decodedToken.regno) {
      req.jwtPayload = {
        userid: decodedToken.userid,
        regno: decodedToken.regno,
        role: decodedToken.role ?? null,
      };
      next();
    } else {
      res.status(401).json({ message: "Invalid token payload." });
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access. Invalid token." });
  }
};

// Use module.exports to export the function
module.exports = { validateBearerToken };
