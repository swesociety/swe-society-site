const express = require("express");
const router = express.Router();

const {
  deleteMultipleUser,
  deleteUser,
  getAllUsers,
  getUserById,
  roleAccess,
  updateUser,
} = require("../controllers/users.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/:userId").put(validateBearerToken, updateUser);
router.route("/").get(getAllUsers);
router.route("/roleaccess").get(validateBearerToken, roleAccess);
router.route("/:userId").get(getUserById);
router.route("/:userId").delete(validateBearerToken, deleteUser);
router.route("/").delete(validateBearerToken, deleteMultipleUser);

module.exports = router;
