const express = require("express");
const router = express.Router();

const {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,

  createCommitteepost,
  getAllCommitteeposts,
  getCommitteepostById,
  updateCommitteepost,
  deleteCommitteepost,

  createCommitteeMember,
  getAllCommitteeMembers,
  getCommitteeMemberById,
  updateCommitteeMember,
  deleteCommitteeMember,


    createElectionAccess,
  deleteElectionAccess,
  updateElectionAccess,
  getAllElectionAccessByElectionId,

  getCommitteeMembersByElectionId,

  createCandidateTrack,
  updateCandidateTrackStatus,
  getRunningElectionCandidates,
  getStatusByRegnoAndElectionId
 
} = require("../controllers/elections.js");

const { validateBearerToken } = require("../middlewares/validateBearerToken.js");

  router.route("/newelection/create").post(validateBearerToken , createElection);
  router.route("/newelection/:electionid").get(getElectionById);
  router.route("/newelection").get(getAllElections);
  router.route("/newelection/:electionid").put(validateBearerToken, updateElection);
  router.route("/newelection/:electionid").delete(validateBearerToken, deleteElection);

  router.route("/positions/create").post(validateBearerToken, createCommitteepost);
  router.route("/positions/:committeepostid").get(getCommitteepostById);
  router.route("/positions").get(getAllCommitteeposts);
  router.route("/positions/:committeepostid").put(validateBearerToken , updateCommitteepost);
  router.route("/positions/:committeepostid").delete(validateBearerToken, deleteCommitteepost);

  router.route("/members/create").post(validateBearerToken, createCommitteeMember);
  router.route("/members/:committeeid").get(getCommitteeMemberById);
  router.route("/members").get(getAllCommitteeMembers);
  router.route("/members/:committeeid").put(validateBearerToken , updateCommitteeMember);
  router.route("/members/:committeeid").delete(validateBearerToken , deleteCommitteeMember);
  router.route("/allmembers/:electionid").get(getCommitteeMembersByElectionId);


  router.route("/electionvotingaccess/create").post(validateBearerToken , createElectionAccess);
  router.route("/electionvotingaccess/:election_accessid").delete(validateBearerToken, deleteElectionAccess);
  router.route("/electionvotingaccess/:election_accessid").put(validateBearerToken, updateElectionAccess);
  router.route("/electionvotingaccess/:electionid").get(getAllElectionAccessByElectionId);

  router.route("/candidatetrack/createtrackkks").post(validateBearerToken , createCandidateTrack);
  router.route("/candidatetrack/updatecandidate").post(validateBearerToken , updateCandidateTrackStatus);
  router.route("/candidatetrack/getstatus").post(validateBearerToken , getStatusByRegnoAndElectionId);
  router.route("/candidatetrack/getalltrackss/:electionid").get(validateBearerToken , getRunningElectionCandidates);
  
 
 

  
  module.exports = router;