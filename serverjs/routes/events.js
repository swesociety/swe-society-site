const express = require("express");
const router = express.Router();

const {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  getEventById,
} = require("../controllers/events.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/create").post(validateBearerToken, createEvent);
router.route("/:eventid").get(getEventById);
router.route("/").get(getAllEvents);
router.route("/:eventid").put(validateBearerToken, updateEvent);
router.route("/:eventid").delete(validateBearerToken, deleteEvent);


module.exports = router;
