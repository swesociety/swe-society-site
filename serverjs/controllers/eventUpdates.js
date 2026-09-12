const errorWrapper = require("../middlewares/errorWrapper.js");
const eventUpdateService = require("../services/eventUpdateService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

const createEventUpdates = errorWrapper(
  async (req, res) => {
    const { eventid, caption, photos } = req.body;
    const result = await eventUpdateService.createEventUpdate(eventid, caption, photos);

    await logActivity({
      req,
      action: ActivityAction.EVENT_UPDATE_CREATED,
      category: "event",
      targetType: "event_update",
      targetId: result.event_updateid,
      description: `Created event update for event ID: ${eventid} — ${caption}`,
      metadata: { eventid, caption },
    });

    res.status(201).json(result);
  },
  { statusCode: 500, message: `Couldn't create event update` }
);

const getAllEventUpdates = errorWrapper(
  async (req, res) => {
    const result = await eventUpdateService.getAllEventUpdates();
    res.json(result);
  },
  { statusCode: 500, message: `Couldn't get event updates` }
);

const getEventUpdateById = errorWrapper(
  async (req, res) => {
    const { event_updateid } = req.params;
    const result = await eventUpdateService.getEventUpdateById(event_updateid);
    res.json(result);
  },
  { statusCode: 500, message: `Couldn't get event update by event_updateid` }
);

const updateEventUpdate = errorWrapper(
  async (req, res) => {
    const { eventid } = req.params;
    const result = await eventUpdateService.updateEventUpdate(eventid, req.body);

    await logActivity({
      req,
      action: ActivityAction.EVENT_UPDATE_UPDATED,
      category: "event",
      targetType: "event",
      targetId: eventid,
      description: `Updated event update for event ID: ${eventid}`,
      metadata: { headline: req.body.headline },
    });

    res.json(result);
  },
  { statusCode: 500, message: `Couldn't update event` }
);

const deleteEventUpdate = errorWrapper(
  async (req, res) => {
    const { event_updateid } = req.params;
    await eventUpdateService.deleteEventUpdate(event_updateid);

    await logActivity({
      req,
      action: ActivityAction.EVENT_UPDATE_DELETED,
      category: "event",
      targetType: "event_update",
      targetId: event_updateid,
      description: `Deleted event update ID: ${event_updateid}`,
    });

    res.json({ message: "Event update deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete event update` }
);

module.exports = {
  createEventUpdates,
  getAllEventUpdates,
  getEventUpdateById,
  updateEventUpdate,
  deleteEventUpdate
};
