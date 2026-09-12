const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const {
  reqSalt_keys, xorEncrypt, xorDecrypt,
  encryptObject, decryptObject, encryptArray, decryptArray,
} = require("../services/encryption.js");
const { election_status } = require("../services/electionStatus.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");
const candidateSvc = require("../services/candidateService.js");

// Create a new candidate
const createCandidate = errorWrapper(
  async (req, res) => {
    const { electionid, userId, marka_name, slogan, logo_url, committeepostid } = req.body;
    const request_approval_status = false;

    const decrypted_data = decryptObject(
      { electionid, userId, marka_name, slogan, logo_url, committeepostid },
      reqSalt_keys.candidate.createcandidate
    );

    if (!decrypted_data.userId || !decrypted_data.electionid) {
      return res.status(400).json({
        message: "Invalid user or election information. Session expired or user not logged in."
      });
    }

    const existingCandidates = await candidateSvc.findExistingCandidate(
      decrypted_data.electionid, decrypted_data.userId
    );
    if (existingCandidates.length > 0) {
      return res.status(409).json({ message: "User is already a candidate in this election" });
    }

    const electionRow = await candidateSvc.getElectionStatus(decrypted_data.electionid);

    switch (electionRow.election_status) {
      case election_status.candidate_reg_start:
        await candidateSvc.insertCandidate({
          electionid: decrypted_data.electionid,
          userId: decrypted_data.userId,
          marka_name: decrypted_data.marka_name,
          slogan: decrypted_data.slogan,
          logo_url: decrypted_data.logo_url,
          committeepostid: decrypted_data.committeepostid,
          request_approval_status,
        });

        await logActivity({
          req,
          action: ActivityAction.CANDIDATE_REGISTERED,
          category: "candidate",
          targetType: "election",
          targetId: decrypted_data.electionid,
          description: `Candidate registered for election ID ${decrypted_data.electionid}`,
        });

        return res.status(201).json({ message: "Candidate registration successful" });

      default:
        throw new CustomError("Nomination form submission is not allowed at this moment", 400);
    }
  },
  { statusCode: 500, message: `Couldn't create candidate` }
);

// Delete a candidate by ID
const deleteCandidate = errorWrapper(
  async (req, res) => {
    const { candidate_id } = req.params;
    const decryptedId = xorDecrypt(candidate_id, reqSalt_keys.candidate.deleteNomination);
    await candidateSvc.deleteCandidateById(decryptedId);

    await logActivity({
      req,
      action: ActivityAction.CANDIDATE_DELETED,
      category: "candidate",
      targetType: "candidate",
      targetId: decryptedId,
      description: `Deleted candidate ID: ${decryptedId}`,
    });

    res.status(200).json({ message: "Candidate deleted successfully" });
  },
  { statusCode: 500, message: `Couldn't delete candidate` }
);

// Update specific fields of a candidate
const updateCandidate = errorWrapper(
  async (req, res) => {
    const { candidate_id } = req.params;
    const decryptedId = xorDecrypt(candidate_id, reqSalt_keys.candidate.updateNomination);
    const fields = decryptObject(req.body, reqSalt_keys.candidate.updateNomination);

    const updated = await candidateSvc.updateCandidateById(decryptedId, fields);

    await logActivity({
      req,
      action: ActivityAction.CANDIDATE_UPDATED,
      category: "candidate",
      targetType: "candidate",
      targetId: decryptedId,
      description: `Updated candidate ID: ${decryptedId}`,
    });

    res.status(200).json(updated);
  },
  { statusCode: 500, message: `Couldn't update candidate` }
);

// Get all candidates for a specific election
const getCandidatesByElection = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedId = xorDecrypt(electionid, reqSalt_keys.candidate.getCandidatesByElection);
    const candidates = await candidateSvc.getCandidatesByElectionId(decryptedId);
    res.status(200).json(candidates);
  },
  { statusCode: 500, message: `Couldn't fetch candidates` }
);

const getCandidatesFilteredByElectionAccess = errorWrapper(
  async (req, res) => {
    const { electionid, userId } = req.params;
    const decryptedElectionId = xorDecrypt(electionid, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess);
    const decryptedUserId = xorDecrypt(userId, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess);

    const candidates = await candidateSvc.getCandidatesFilteredByAccess(decryptedElectionId, decryptedUserId);
    res.status(200).json(encryptArray(candidates, reqSalt_keys.candidate.getCandidatesFilteredByElectionAccess));
  },
  { statusCode: 500, message: `Couldn't fetch candidates` }
);

const approve_all_candidate_by_election = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedId = xorDecrypt(electionid, reqSalt_keys.candidate.approveAllNominations);
    const rows = await candidateSvc.approveAllCandidatesByElection(decryptedId);

    if (rows.length >= 0) {
      await logActivity({
        req,
        action: ActivityAction.CANDIDATE_ALL_APPROVED,
        category: "candidate",
        targetType: "election",
        targetId: decryptedId,
        description: `All candidates approved for election ID: ${decryptedId}`,
        metadata: { approved_count: rows.length },
      });
      res.status(200).json({ message: "All candidates approved successfully" });
    } else {
      res.status(200).json({ message: "There are no candidates to approve" });
    }
  },
  { statusCode: 500, message: `Couldn't approved all the candidates` }
);

const getApprovedCandidatesByElection = errorWrapper(
  async (req, res) => {
    const { electionid } = req.params;
    const decryptedId = xorDecrypt(electionid, reqSalt_keys.candidate.getAllApprovedNominations);
    const candidates = await candidateSvc.getApprovedCandidatesByElection(decryptedId);
    res.status(200).json(encryptArray(candidates, reqSalt_keys.candidate.getAllApprovedNominations));
  },
  { statusCode: 500, message: `Couldn't fetch approved candidates` }
);

module.exports = {
  createCandidate, deleteCandidate, updateCandidate,
  getCandidatesByElection, getApprovedCandidatesByElection,
  approve_all_candidate_by_election, getCandidatesFilteredByElectionAccess
};
