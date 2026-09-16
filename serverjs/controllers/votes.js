const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const { xorDecrypt, reqSalt_keys, encryptArray, decryptArray } = require("../services/encryption.js");
const voteService = require("../services/voteService.js");
const { election_status } = require("../services/electionStatus.js");
const { logActivity } = require("../services/activityLogService.js");

const createVote = errorWrapper(async (req, res) => {
  const { user_id, vote } = req.body;

  const decrypted_user_id = xorDecrypt(user_id, reqSalt_keys.vote.create);
  const decrypted_vote_objects = decryptArray(vote, reqSalt_keys.vote.create);

  if (
    !decrypted_user_id ||
    !Array.isArray(decrypted_vote_objects) ||
    decrypted_vote_objects.length === 0
  ) {
    throw new CustomError("Invalid vote payload", 400);
  }

  const candidateIds = decrypted_vote_objects
    .map(obj => {
      if (!obj || typeof obj.candidate_id !== "string" || obj.candidate_id.trim() === "") {
        return null;
      }
      const parsed = parseInt(obj.candidate_id);
      return isNaN(parsed) ? null : parsed;
    })
    .filter(id => id !== null);

  if (candidateIds.length === 0) {
    throw new CustomError("No valid candidate IDs found in vote", 400);
  }

  const election = await voteService.getElectionByCandidate(candidateIds[0]);
  if (!election) {
    throw new CustomError("Election not found", 404);
  }

  const canVote = await voteService.checkAlreadyVoted(candidateIds[0], decrypted_user_id);
  console.log("can vote :", canVote);
  if (!canVote) {
    throw new CustomError("You have already voted for this candidate", 403);
  }

  if (election.election_status === election_status.voting_start) {
    const rows = await voteService.insertVotes(decrypted_user_id, candidateIds);

    req.jwtPayload = req.jwtPayload || { userid: decrypted_user_id };
    await logActivity({
      req,
      action: "vote.cast",
      category: "vote",
      description: "User cast a vote in an election",
      metadata: { votes_count: rows.length }
    });

    res.status(201).json({
      message: "Votes submitted successfully",
      submitted_votes: rows.length,
      data: rows,
    });
  } else {
    throw new CustomError("Voting is not currently allowed for this election", 403);
  }
}, {
  statusCode: 500,
  message: `Couldn't create vote`,
});

const deleteVote = errorWrapper(async (req, res) => {
  const { userId, candidate_id } = req.params;
  await voteService.deleteVote(userId, candidate_id);
  res.status(200).json({ message: "Vote deleted successfully" });
}, { statusCode: 500, message: `Couldn't delete vote` });

const getVoteCountByElection = errorWrapper(async (req, res) => {
  const { electionid } = req.params;
  const decrypted_electionid = xorDecrypt(electionid, reqSalt_keys.vote.getVoteCountByID);

  const access = await voteService.checkStandingsAccess(req.jwtPayload.userid);
  if (!access) {
    return res.status(403).json({ message: "Access denied. User role not found." });
  }

  const { roleid, standingsaccess } = access;
  if (roleid !== 1 && !standingsaccess) {
    return res.status(403).json({ message: "Access denied. You do not have permission to view standings." });
  }

  const rows = await voteService.getVoteCountByElection(decrypted_electionid);
  res.status(200).json(encryptArray(rows, reqSalt_keys.vote.getVoteCountByID));
}, { statusCode: 500, message: `Couldn't fetch vote counts` });

const getAllVotesDescending = errorWrapper(async (req, res) => {
  const rows = await voteService.getAllVotesDescending();
  res.status(200).json(rows);
}, { statusCode: 500, message: `Couldn't fetch votes` });

module.exports = { createVote, deleteVote, getVoteCountByElection, getAllVotesDescending };
