const express = require("express");
const router = express.Router();

const {
  createEventUpdates,
  getAllEventUpdates,
  getEventUpdateById,
  updateEventUpdate,
  deleteEventUpdate
} = require("../controllers/eventUpdates.js");


  router.route("/create").post(createEventUpdates);
  router.route("/:event_updateid").get(getEventUpdateById);
  router.route("/").get(getAllEventUpdates);
  router.route("/:event_updateid").put(updateEventUpdate);
  router.route("/:event_updateid").delete(deleteEventUpdate);


  module.exports = router;