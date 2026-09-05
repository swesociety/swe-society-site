const express = require("express");
const {
  assignRole,
  createRole,
  deleteRole,
  getAllRole,
  getRoleById,
  getRoleInfo,
  updateDefaultRole,
  updateRole,
} = require("../controllers/role.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

const roleRoute = express.Router();


roleRoute.put("/assign", validateBearerToken, assignRole);
roleRoute.post("/", validateBearerToken, createRole);
roleRoute.put("/:roleid", validateBearerToken, updateRole);
roleRoute.delete("/:roleid", validateBearerToken, deleteRole);
roleRoute.put("/default/:roleid", validateBearerToken, updateDefaultRole);
roleRoute.get("/info", validateBearerToken, getRoleInfo);
roleRoute.get("/", getAllRole);
roleRoute.get("/:roleid", getRoleById);

module.exports = roleRoute;
