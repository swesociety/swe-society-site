const express = require("express");
const   router = express.Router();

const {testing_election_table,removing_att} = require("../controllers/testing.js")

router.route("/election_table").get(testing_election_table);
router.route("/1").delete(removing_att);
module.exports = router;