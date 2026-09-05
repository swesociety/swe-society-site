const express = require("express");
const router = express.Router();

const {
    createVote, deleteVote, getVoteCountByElection, getAllVotesDescending
} = require("../controllers/votes.js");
const { validateBearerToken } = require("../middlewares/validateBearerToken.js");


router.route("/create").post(validateBearerToken, createVote)
router.route("/:candidate_id/:userId").delete(validateBearerToken,deleteVote)

router.route("/list/:electionid").get(validateBearerToken,getVoteCountByElection)
router.route("/all").get(validateBearerToken,getAllVotesDescending)

module.exports = router
