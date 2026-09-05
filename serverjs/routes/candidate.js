const express = require("express");
const router = express.Router();

const {
    createCandidate, deleteCandidate, updateCandidate, getCandidatesByElection, getApprovedCandidatesByElection , approve_all_candidate_by_election,getCandidatesFilteredByElectionAccess,getCandidateBy_Uid_electionid
} = require("../controllers/candidate.js");
const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/create").post(validateBearerToken,createCandidate)
router.route("/:candidate_id").delete(validateBearerToken,deleteCandidate)
router.route("/:candidate_id").put(validateBearerToken,updateCandidate)
router.route("/approve_all/:electionid").put(validateBearerToken,approve_all_candidate_by_election)

router.route("/:electionid").get(validateBearerToken,getCandidatesByElection)
router.route("/approved/:electionid").get(validateBearerToken,getApprovedCandidatesByElection)
router.route("/filtered/:electionid/:userId").get(validateBearerToken,getCandidatesFilteredByElectionAccess)


module.exports = router
