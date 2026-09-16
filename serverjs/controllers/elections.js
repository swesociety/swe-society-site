const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { xorDecrypt, toISODateString, reqSalt_keys, encryptArray, decryptObject, encryptObject } = require("../services/encryption.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");
const electionSvc = require("../services/electionService.js");

const generateOTP = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return otp;
};

// ─── Elections ────────────────────────────────────────────────────────────────

const createElection = errorWrapper(
  async (req, res) => {
    const { year, election_type, batch, election_commissioner, assistant_commissioner,
            candidatereg_start, candidatereg_end, election_start, election_end } = req.body;

    const electioninfo = { year, election_type, batch, election_commissioner, assistant_commissioner,
                           candidatereg_start, candidatereg_end, election_start, election_end };
    const d = decryptObject(electioninfo, reqSalt_keys.election.createElection);

    const election = await electionSvc.createElection({
      year: d.year, election_type: d.election_type, batch: d.batch,
      election_commissioner: d.election_commissioner, assistant_commissioner: d.assistant_commissioner,
      candidatereg_start: toISODateString(d.candidatereg_start),
      candidatereg_end: toISODateString(d.candidatereg_end),
      election_start: toISODateString(d.election_start),
      election_end: toISODateString(d.election_end),
    });

    await logActivity({
      req,
      action: ActivityAction.ELECTION_CREATED,
      category: "election",
      targetType: "election",
      targetId: election.electionid,
      description: `Created election: ${d.election_type} ${d.year}`,
      metadata: { year: d.year, election_type: d.election_type, batch: d.batch }
    });

    res.status(201).json(encryptObject(election, reqSalt_keys.election.createElection));
  },
  { statusCode: 500, message: `Couldn't create election` }
);

const updateElection = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const election = await electionSvc.updateElection(electionid, req.body);

    await logActivity({
      req,
      action: ActivityAction.ELECTION_UPDATED,
      category: "election",
      targetType: "election",
      targetId: electionid,
      description: `Updated election ID: ${electionid}`,
      metadata: { updated_fields: Object.keys(req.body) },
    });

    res.json(election);
  },
  { statusCode: 500, message: `Couldn't update election` }
);

const getAllElections = errorWrapper(
  async (req, res) => {
    const elections = await electionSvc.getAllElections();
    res.json(encryptArray(elections, reqSalt_keys.election.getAllElection));
  },
  { statusCode: 500, message: `Couldn't get elections` }
);

const getElectionById = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedId = xorDecrypt(electionid, reqSalt_keys.election.getElectionbyID);
    const election = await electionSvc.getElectionById(decryptedId);
    res.json(encryptObject(election, reqSalt_keys.election.getElectionbyID));
  },
  { statusCode: 500, message: `Couldn't get election by electionid` }
);

const deleteElection = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedId = xorDecrypt(electionid, reqSalt_keys.election.deleteElection);
    await electionSvc.deleteElection(decryptedId);

    await logActivity({
      req,
      action: ActivityAction.ELECTION_DELETED,
      category: "election",
      targetType: "election",
      targetId: decryptedId,
      description: `Deleted election ID: ${decryptedId}`,
    });

    res.json({ message: "Election deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete election` }
);

// ─── Committee Posts ──────────────────────────────────────────────────────────

const createCommitteepost = errorWrapper(
  async (req, res) => {
    const { post_name } = req.body;
    const post = await electionSvc.createCommitteepost(post_name);

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_POST_CREATED,
      category: "election",
      targetType: "committee_post",
      targetId: post.committeepostid,
      description: `Created committee post: ${post_name}`,
    });

    res.status(201).json(post);
  },
  { statusCode: 500, message: `Couldn't create committeepost` }
);

const getAllCommitteeposts = errorWrapper(
  async (req, res) => {
    const posts = await electionSvc.getAllCommitteeposts();
    res.json(posts);
  },
  { statusCode: 500, message: `Couldn't get committeeposts` }
);

const getCommitteepostById = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params;
    const post = await electionSvc.getCommitteepostById(committeepostid);
    res.json(post);
  },
  { statusCode: 500, message: `Couldn't get committeepost by committeepostid` }
);

const updateCommitteepost = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params;
    const { post_name } = req.body;
    const post = await electionSvc.updateCommitteepost(committeepostid, post_name);

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_POST_UPDATED,
      category: "election",
      targetType: "committee_post",
      targetId: committeepostid,
      description: `Updated committee post ID: ${committeepostid} — ${post_name}`,
    });

    res.json(post);
  },
  { statusCode: 500, message: `Couldn't update committeepost` }
);

const deleteCommitteepost = errorWrapper(
  async (req, res) => {
    const { committeepostid } = req.params;
    await electionSvc.deleteCommitteepost(committeepostid);

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_POST_DELETED,
      category: "election",
      targetType: "committee_post",
      targetId: committeepostid,
      description: `Deleted committee post ID: ${committeepostid}`,
    });

    res.json({ message: "Committeepost deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete committeepost` }
);

// ─── Committee Members ────────────────────────────────────────────────────────

const createCommitteeMember = errorWrapper(
  async (req, res) => {
    const { userid, postid, electionid = null, executive_committeeid, service_start, service_end } = req.body;

    if (!userid || !postid || !executive_committeeid || !service_start || !service_end) {
      throw new CustomError("User, post, executive committee, service start, and service end are required", 400);
    }
    if (new Date(service_end) <= new Date(service_start)) {
      throw new CustomError("Service end must be after service start", 400);
    }

    const alreadyExists = await electionSvc.checkExistingCommitteeMember(userid, executive_committeeid);
    if (alreadyExists) throw new CustomError("This user already has a role in this executive committee", 409);

    const member = await electionSvc.createCommitteeMember({ userid, postid, electionid, executive_committeeid, service_start, service_end });

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_MEMBER_ADDED,
      category: "election",
      targetType: "committee_member",
      targetId: member.committeeid,
      description: `Added committee member user ID: ${userid} to executive committee ID: ${executive_committeeid}`,
      metadata: { userid, postid, executive_committeeid, service_start, service_end },
    });

    res.status(201).json(member);
  },
  { statusCode: 500, message: `Couldn't create committee member` }
);

const getAllCommitteeMembers = errorWrapper(
  async (req, res) => {
    const members = await electionSvc.getAllCommitteeMembers();
    res.json(members);
  },
  { statusCode: 500, message: `Couldn't get committee members` }
);

const getCommitteeMemberById = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params;
    const member = await electionSvc.getCommitteeMemberById(committeeid);
    res.json(member);
  },
  { statusCode: 500, message: `Couldn't get committee member by committeeid` }
);

const updateCommitteeMember = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params;
    const { userid, postid, electionid = null, executive_committeeid, service_start, service_end } = req.body;

    if (!userid || !postid || !executive_committeeid || !service_start || !service_end) {
      throw new CustomError("User, post, executive committee, service start, and service end are required", 400);
    }
    if (new Date(service_end) <= new Date(service_start)) {
      throw new CustomError("Service end must be after service start", 400);
    }

    const alreadyExists = await electionSvc.checkExistingCommitteeMember(userid, executive_committeeid, committeeid);
    if (alreadyExists) throw new CustomError("This user already has a role in this executive committee", 409);

    const member = await electionSvc.updateCommitteeMember(committeeid, { userid, postid, electionid, executive_committeeid, service_start, service_end });

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_MEMBER_UPDATED,
      category: "election",
      targetType: "committee_member",
      targetId: committeeid,
      description: `Updated committee member ID: ${committeeid}, user ID: ${userid}`,
      metadata: { userid, postid, executive_committeeid, service_start, service_end },
    });

    res.json(member);
  },
  { statusCode: 500, message: `Couldn't update committee member` }
);

const deleteCommitteeMember = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params;
    await electionSvc.deleteCommitteeMember(committeeid);

    await logActivity({
      req,
      action: ActivityAction.COMMITTEE_MEMBER_REMOVED,
      category: "election",
      targetType: "committee_member",
      targetId: committeeid,
      description: `Removed committee member ID: ${committeeid}`,
    });

    res.json({ message: "Committee member deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete committee member` }
);

// ─── Executive Committees ─────────────────────────────────────────────────────

const createExecutiveCommittee = errorWrapper(
  async (req, res) => {
    const { committee_name, year } = req.body;
    if (!committee_name || !year) throw new CustomError("Committee name and year are required", 400);

    const ec = await electionSvc.createExecutiveCommittee(committee_name, year);

    await logActivity({
      req,
      action: ActivityAction.EXECUTIVE_COMMITTEE_CREATED,
      category: "election",
      targetType: "executive_committee",
      targetId: ec.committeeid,
      description: `Created executive committee: ${committee_name} (${year})`,
      metadata: { committee_name, year },
    });

    res.status(201).json(ec);
  },
  { statusCode: 500, message: `Couldn't create executive committee` }
);

const getAllExecutiveCommittees = errorWrapper(
  async (req, res) => {
    const ecs = await electionSvc.getAllExecutiveCommittees();
    res.json(ecs);
  },
  { statusCode: 500, message: `Couldn't get executive committees` }
);

const updateExecutiveCommittee = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params;
    const { committee_name, year } = req.body;
    if (!committee_name || !year) throw new CustomError("Committee name and year are required", 400);

    const ec = await electionSvc.updateExecutiveCommittee(committeeid, committee_name, year);

    await logActivity({
      req,
      action: ActivityAction.EXECUTIVE_COMMITTEE_UPDATED,
      category: "election",
      targetType: "executive_committee",
      targetId: committeeid,
      description: `Updated executive committee ID: ${committeeid} — ${committee_name} (${year})`,
      metadata: { committee_name, year },
    });

    res.json(ec);
  },
  { statusCode: 500, message: `Couldn't update executive committee` }
);

const deleteExecutiveCommittee = errorWrapper(
  async (req, res) => {
    const { committeeid } = req.params;
    await electionSvc.deleteExecutiveCommittee(committeeid);

    await logActivity({
      req,
      action: ActivityAction.EXECUTIVE_COMMITTEE_DELETED,
      category: "election",
      targetType: "executive_committee",
      targetId: committeeid,
      description: `Deleted executive committee ID: ${committeeid}`,
    });

    res.json({ message: "Executive committee deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete executive committee` }
);

const getCommitteeMembersByElectionId = async (req, res) => {
  const { electionid } = req.params;
  try {
    let decryptedElectionId;
    try {
      decryptedElectionId = xorDecrypt(electionid, reqSalt_keys.election.getAllMembers);
    } catch (decryptErr) {
      return res.status(400).json({ error: "Invalid electionid: not a valid encrypted value." });
    }

    const members = await electionSvc.getCommitteeMembersByElectionId(decryptedElectionId);
    if (members.length === 0) return res.status(200).json([]);
    res.json(members);
  } catch (error) {
    console.error("Error fetching committee members:", error);
    res.status(500).json({ error: "Couldn't get committee members data" });
  }
};

// ─── Election Access ──────────────────────────────────────────────────────────

const createElectionAccess = errorWrapper(
  async (req, res) => {
    const { electionid, session, allowed_sessions } = req.body;
    const access = await electionSvc.createElectionAccess({ electionid, session, allowed_sessions });

    await logActivity({
      req,
      action: ActivityAction.ELECTION_ACCESS_CREATED,
      category: "election",
      targetType: "election_access",
      targetId: access.election_accessid,
      description: `Created voting access for election ID: ${electionid}, session: ${session}`,
      metadata: { electionid, session, allowed_sessions },
    });

    res.status(201).json(access);
  },
  { statusCode: 500, message: `Couldn't create election access` }
);

const deleteElectionAccess = errorWrapper(
  async (req, res) => {
    const { election_accessid } = req.params;
    await electionSvc.deleteElectionAccess(election_accessid);

    await logActivity({
      req,
      action: ActivityAction.ELECTION_ACCESS_DELETED,
      category: "election",
      targetType: "election_access",
      targetId: election_accessid,
      description: `Deleted election voting access ID: ${election_accessid}`,
    });

    res.status(200).json({ message: `ElectionAccess ${election_accessid} deleted successfully` });
  },
  { statusCode: 500, message: `Couldn't delete election access` }
);

const getAllElectionAccessByElectionId = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const rows = await electionSvc.getAllElectionAccessByElectionId(electionid);
    res.status(200).json(rows);
  },
  { statusCode: 500, message: `Couldn't fetch election access records` }
);

const updateElectionAccess = errorWrapper(
  async (req, res) => {
    const { election_accessid } = req.params;
    const { electionid, session, allowed_sessions } = req.body;
    const access = await electionSvc.updateElectionAccess(election_accessid, { electionid, session, allowed_sessions });

    await logActivity({
      req,
      action: ActivityAction.ELECTION_ACCESS_UPDATED,
      category: "election",
      targetType: "election_access",
      targetId: election_accessid,
      description: `Updated election voting access ID: ${election_accessid} for election ID: ${electionid}`,
      metadata: { electionid, session, allowed_sessions },
    });

    res.status(200).json(access);
  },
  { statusCode: 500, message: `Couldn't update election access` }
);

// ─── Candidate Tracking ───────────────────────────────────────────────────────

const createCandidateTrack = errorWrapper(
  async (req, res) => {
    const { regno, election_code } = req.body;
    if (!regno) throw new CustomError("regno is required", 400);
    if (election_code !== "oremama56") throw new CustomError("unauthenticated", 400);

    const runningElection = await electionSvc.findRunningElection();
    if (!runningElection) throw new CustomError("No running election found.", 400);

    const otp = generateOTP();
    const track = await electionSvc.createCandidateTrack(runningElection.electionid, regno, otp);

    await logActivity({
      req,
      action: ActivityAction.ELECTION_TRACK_CREATED,
      category: "election",
      targetType: "election_candidate_track",
      targetId: track.election_on_arival_id,
      description: `Candidate track created for regno: ${regno}, election ID: ${runningElection.electionid}`,
      metadata: { regno, electionid: runningElection.electionid },
    });

    res.status(201).json(track);
  },
  { statusCode: 500, message: `Couldn't create ElectionCandidateTrack` }
);

const updateCandidateTrackStatus = errorWrapper(
  async (req, res) => {
    const { regno, status } = req.body;
    if (!regno || !status) throw new CustomError("regno and status are required", 400);

    const runningElection = await electionSvc.findRunningElection();
    if (!runningElection) throw new CustomError("No running election found.", 400);

    const track = await electionSvc.findCandidateTrack(runningElection.electionid, regno);
    if (!track) throw new CustomError("You are not registered for the current election.", 400);

    const newStatus = `${track.status}_${status}`;
    const updated = await electionSvc.updateCandidateTrackStatus(track.election_on_arival_id, newStatus);

    await logActivity({
      req,
      action: ActivityAction.ELECTION_TRACK_STATUS_UPDATED,
      category: "election",
      targetType: "election_candidate_track",
      targetId: track.election_on_arival_id,
      description: `Candidate track status updated for regno: ${regno} — new status: ${newStatus}`,
      metadata: { regno, electionid: runningElection.electionid, previous_status: track.status, new_status: newStatus },
    });

    res.json(updated);
  },
  { statusCode: 500, message: `Couldn't update ElectionCandidateTrack status` }
);

const getRunningElectionCandidates = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    if (!electionid) throw new CustomError("electionid parameter is required", 400);

    const tracks = await electionSvc.getRunningElectionCandidates(electionid);
    res.json(tracks);
  },
  { statusCode: 500, message: `Couldn't fetch candidates for given electionid` }
);

const getStatusByRegnoAndElectionId = errorWrapper(
  async (req, res) => {
    const { regno, electionid } = req.body;
    if (!regno || !electionid) throw new CustomError("regno and electionid are required", 400);

    const lastStatus = await electionSvc.getStatusByRegnoAndElectionId(regno, electionid);
    res.json({ regno, electionid, status: lastStatus });
  },
  { statusCode: 500, message: `Couldn't fetch status` }
);

module.exports = {
  createElection, getAllElections, getElectionById, updateElection, deleteElection,
  createCommitteepost, getAllCommitteeposts, getCommitteepostById, updateCommitteepost, deleteCommitteepost,
  createCommitteeMember, getAllCommitteeMembers, getCommitteeMemberById, updateCommitteeMember, deleteCommitteeMember,
  createExecutiveCommittee, getAllExecutiveCommittees, updateExecutiveCommittee, deleteExecutiveCommittee,
  getCommitteeMembersByElectionId,
  createElectionAccess, deleteElectionAccess, updateElectionAccess, getAllElectionAccessByElectionId,
  createCandidateTrack, updateCandidateTrackStatus, getRunningElectionCandidates, getStatusByRegnoAndElectionId
};