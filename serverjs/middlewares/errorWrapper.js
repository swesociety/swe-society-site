const CustomError = require("../services/CustomError.js");

const errorWrapper = (fn, errorInfo) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);

      if (error instanceof CustomError) {
        const statusCode = error?.statusCode || 500;
        const message = error?.message || "Something went wrong";

        res.status(statusCode).json({ message });
      } else if (errorInfo) {
        const statusCode = errorInfo.statusCode;
        const message = errorInfo.message;
        res.status(statusCode).json({ message, details: error.message });
      } else {
        res.status(500).json({ message: "Something went wrong" });
      }
    }
  };
};

// Use module.exports to export the function
module.exports = errorWrapper;
