const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const eventService = require("../services/eventService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

const createEvent = errorWrapper(
  async (req, res) => {
    const { start_time, end_time, headline, event_details, coverphoto } = req.body;

    const hasAccess = await eventService.checkEventAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      throw new CustomError(
        "Access denied. You do not have permission to create events.",
        403
      );
    }

    const newEvent = await eventService.createEvent(req.jwtPayload.userid, {
      start_time,
      end_time,
      headline,
      event_details,
      coverphoto,
    });

    await logActivity({
      req,
      action: ActivityAction.EVENT_CREATED,
      category: "event",
      targetType: "event",
      targetId: newEvent.eventid,
      description: `Created event: ${headline}`,
      metadata: { headline, start_time, end_time }
    });

    res.status(201).json(newEvent);
  },
  { statusCode: 500, message: `Couldn't create event` }
);

const getAllEvents = errorWrapper(
  async (req, res) => {
    const events = await eventService.getAllEvents();
    res.json(events);
  },
  { statusCode: 500, message: `Couldn't get events` }
);

const updateEvent = errorWrapper(
  async (req, res) => {
    const { eventid } = req.params;
    const { start_time, end_time, headline, event_details, coverphoto } = req.body;

    const hasAccess = await eventService.checkEventAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      throw new CustomError(
        "Access denied. You do not have permission to update events.",
        403
      );
    }

    const updatedEvent = await eventService.updateEvent(eventid, req.jwtPayload.userid, {
      start_time,
      end_time,
      headline,
      event_details,
      coverphoto,
    });

    await logActivity({
      req,
      action: ActivityAction.EVENT_UPDATED,
      category: "event",
      targetType: "event",
      targetId: eventid,
      description: `Updated event ID: ${eventid} — ${headline}`,
      metadata: { headline, start_time, end_time },
    });

    res.json(updatedEvent);
  },
  { statusCode: 500, message: `Couldn't update event` }
);

const getEventById = errorWrapper(
  async (req, res) => {
    const { eventid } = req.params;
    const event = await eventService.getEventById(eventid);
    res.json(event);
  },
  { statusCode: 500, message: `Couldn't get event by eventid` }
);

const deleteEvent = errorWrapper(
  async (req, res) => {
    const { eventid } = req.params;

    const hasAccess = await eventService.checkEventAccess(req.jwtPayload.userid);
    if (!hasAccess) {
      throw new CustomError(
        "Access denied. You do not have permission to delete events.",
        403
      );
    }

    await eventService.deleteEvent(eventid);

    await logActivity({
      req,
      action: ActivityAction.EVENT_DELETED,
      category: "event",
      targetType: "event",
      targetId: eventid,
      description: `Deleted event ID: ${eventid}`,
    });

    res.json({ message: "Event deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete event` }
);

module.exports = { createEvent, getAllEvents, updateEvent, deleteEvent, getEventById };
