const express = require("express");
const router = express.Router();
const { validateBearerToken } = require("../middlewares/validateBearerToken.js");
const {
  getSocietyFeeData,
  getIndividualUserSocietyFee,
  updateSocietyFeeStatus,
  updateBatchSocietyFeeStatus,
  addOrEditManualSocietyFee,
  deleteSocietyFee,
  requireBillingPermission,
} = require("../controllers/societyFee.js");

router.use(validateBearerToken);
router.get("/", requireBillingPermission("hasBillingAccess"), getSocietyFeeData);
router.get("/user/:userId", getIndividualUserSocietyFee);
router.put(
  "/status",
  requireBillingPermission("hasBillingAccess"),
  updateSocietyFeeStatus,
);
router.put(
  "/batch-status",
  requireBillingPermission("hasBillingAccess"),
  updateBatchSocietyFeeStatus,
);
router.post(
  "/manual",
  requireBillingPermission("hasBillingAccess"),
  addOrEditManualSocietyFee,
);
router.put(
  "/edit",
  requireBillingPermission("hasBillingAccess"),
  addOrEditManualSocietyFee,
);
router.delete(
  "/:society_fee_id",
  requireBillingPermission("hasBillingAccess"),
  deleteSocietyFee,
);
router.delete(
  "/",
  requireBillingPermission("hasBillingAccess"),
  deleteSocietyFee,
);

module.exports = router;

