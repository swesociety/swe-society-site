const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const {
  getBillingPermissions,
  getSocietyFeeUsers,
  getSocietyFeePayments,
  getFeeStatus,
  getFeeAdminIds,
  saveSocietyFeeStatus,
  manualSaveSocietyFeeRecord,
  deleteSocietyFeeRecord,
  updateBatchSocietyFeeStatusService,
} = require("../services/societyFeeService.js");

const requireBillingPermission = (permission) => async (req, res, next) => {
  try {
    const permissions = await getBillingPermissions(req.jwtPayload.userid);
    if (!permissions || !permissions[permission]) {
      return res.status(403).json({
        message: "You do not have permission to perform this billing action.",
      });
    }
    req.billingPermissions = permissions;
    next();
  } catch (error) {
    next(error);
  }
};

const { SemesterKey, normalizeSemesterKey } = require("../services/paymentService.js");

// Enums for Society Fee Status and 7 Semester Keys
const SocietyFeeStatus = Object.freeze({
  PENDING: "Pending",
  VERIFIED: "Verified",
});

const DEFAULT_SEMESTER_FEES = Object.freeze({
  [SemesterKey.YEAR_1]: 1000,
  [SemesterKey.SEM_2_1]: 300,
  [SemesterKey.SEM_2_2]: 300,
  [SemesterKey.SEM_3_1]: 300,
  [SemesterKey.SEM_3_2]: 300,
  [SemesterKey.SEM_4_1]: 300,
  [SemesterKey.SEM_4_2]: 300,
});

const SOCIETY_FEE_KEYS = [
  SemesterKey.YEAR_1,
  SemesterKey.SEM_2_1,
  SemesterKey.SEM_2_2,
  SemesterKey.SEM_3_1,
  SemesterKey.SEM_3_2,
  SemesterKey.SEM_4_1,
  SemesterKey.SEM_4_2,
];

// Get all society fee data with 2-step verifier & accepter profile info
const getSocietyFeeData = errorWrapper(async (req, res) => {
  const semesterConfigs = SOCIETY_FEE_KEYS.map((key) => ({
    semester_key: key,
    default_amount: DEFAULT_SEMESTER_FEES[key] || 300,
  }));

  const users = await getSocietyFeeUsers();
  const payments = await getSocietyFeePayments();

  const paymentMap = {};
  for (const p of payments) {
    const normKey = normalizeSemesterKey(p.semester_key);
    const key = `${p.userid}_${normKey}`;
    paymentMap[key] = p;
  }

  const userPayments = users.map((u) => {
    const payments_map = {};
    for (const sem of semesterConfigs) {
      const key = `${u.userid}_${sem.semester_key}`;
      if (paymentMap[key]) {
        payments_map[sem.semester_key] = paymentMap[key];
      }
    }
    return {
      userid: u.userid,
      fullname: u.fullname,
      regno: u.regno,
      session: u.session,
      batch: u.batch,
      payments: payments_map,
    };
  });

  res.status(200).json({
    semesters: semesterConfigs,
    users: userPayments,
    enums: {
      SocietyFeeStatus,
      SemesterKey,
      DEFAULT_SEMESTER_FEES,
    },
  });
}, { statusCode: 500, message: "Couldn't retrieve society fee data" });

// Get individual user society fee status with verifier/accepter admin details
const getIndividualUserSocietyFee = errorWrapper(async (req, res) => {
  const { userId } = req.params;

  const semesterConfigs = SOCIETY_FEE_KEYS.map((key) => ({
    semester_key: key,
    default_amount: DEFAULT_SEMESTER_FEES[key] || 300,
  }));

  const payments = await getSocietyFeePayments(userId);

  const paymentMap = {};
  for (const p of payments) {
    const normKey = normalizeSemesterKey(p.semester_key);
    paymentMap[normKey] = p;
  }

  let totalLifetimeFee = 0;
  let totalPaid = 0;

  const breakdown = semesterConfigs.map((sem) => {
    const rec = paymentMap[sem.semester_key];
    const feeAmount =
      rec?.amount !== undefined && rec?.amount !== null
        ? Number(rec.amount)
        : sem.default_amount;
    totalLifetimeFee += feeAmount;

    const isTxVerified = Boolean(rec && rec.transaction_verified);
    const isPaymentAccepted = Boolean(rec && rec.status === SocietyFeeStatus.VERIFIED);
    const isFullyCleared = isTxVerified && isPaymentAccepted;

    if (isFullyCleared) {
      totalPaid += feeAmount;
    }

    return {
      semester_key: sem.semester_key,
      default_amount: sem.default_amount,
      amount: feeAmount,
      record: rec || null,
      transaction_verified: isTxVerified,
      payment_status: rec ? rec.status : SocietyFeeStatus.PENDING,
      isFullyCleared,
      isDue: !isFullyCleared,
    };
  });

  const totalDue = Math.max(0, totalLifetimeFee - totalPaid);

  res.status(200).json({
    userId,
    totalDue,
    totalPaid,
    totalLifetimeFee,
    breakdown,
  });
}, { statusCode: 500, message: "Couldn't retrieve user society fee status" });

// Update 2-step verification status and record verified_by / accepted_by admin IDs
const updateSocietyFeeStatus = errorWrapper(async (req, res) => {
  const { userid, semester_key, status, transaction_verified, amount, transaction_id, admin_userid } = req.body;

  if (!userid || !semester_key) {
    throw new CustomError("userid and semester_key are required", 400);
  }

  if (status && !Object.values(SocietyFeeStatus).includes(status)) {
    throw new CustomError(`Invalid status. Must be one of: ${Object.values(SocietyFeeStatus).join(", ")}`, 400);
  }

  if (!Object.values(SemesterKey).includes(semester_key)) {
    throw new CustomError(`Invalid semester key. Must be one of: ${Object.values(SemesterKey).join(", ")}`, 400);
  }

  const feeAmount = amount || DEFAULT_SEMESTER_FEES[semester_key] || 300;
  const targetStatus = status || SocietyFeeStatus.PENDING;
  const isTxVerified = transaction_verified !== undefined ? Boolean(transaction_verified) : false;
  const txId = transaction_id || null;

  const permissions = req.billingPermissions || await getBillingPermissions(req.jwtPayload.userid);
  const previousRecord = await getFeeStatus(userid, semester_key);
  const changesVerification = isTxVerified !== Boolean(previousRecord.transaction_verified);
  const changesAcceptance = targetStatus !== previousRecord.status;

  if (changesVerification && !permissions.canVerifyTransaction) {
    throw new CustomError("You do not have permission to verify transactions.", 403);
  }
  if (changesAcceptance && !permissions.canAcceptTransaction) {
    throw new CustomError("You do not have permission to accept payments.", 403);
  }

  // Strict Constraint: Cannot accept payment if Step 1 (Tx Verification) is not completed
  if (targetStatus === SocietyFeeStatus.VERIFIED && !isTxVerified) {
    throw new CustomError("Transaction is not verified. Please complete Step 1 (Tx Verification) before accepting payment.", 400);
  }

  // Determine admin ID from payload or req.user
  const adminId = req.jwtPayload.userid;

  // Check existing record to preserve previous verifier/accepter IDs
  const prevRec = await getFeeAdminIds(userid, semester_key);
  let newVerifiedBy = null;
  let newAcceptedBy = null;

  if (isTxVerified) {
    // Keep existing verifier if available; otherwise set current admin ID
    newVerifiedBy = prevRec.verified_by ? prevRec.verified_by : adminId;
  } else {
    newVerifiedBy = null;
  }

  if (targetStatus === SocietyFeeStatus.VERIFIED) {
    // Keep existing accepter if available; otherwise set current admin ID
    newAcceptedBy = prevRec.accepted_by ? prevRec.accepted_by : adminId;
  } else {
    newAcceptedBy = null;
  }

  const fullRecord = await saveSocietyFeeStatus({
    userid,
    semester_key,
    amount: feeAmount,
    status: targetStatus,
    transaction_verified: isTxVerified,
    transaction_id: txId,
    verified_by: newVerifiedBy,
    accepted_by: newAcceptedBy,
  });

  res.status(200).json(fullRecord);
}, { statusCode: 500, message: "Couldn't update 2-step verification status" });

// Manually add or edit a society fee record
const addOrEditManualSocietyFee = errorWrapper(async (req, res) => {
  const { userid, semester_key, amount, status, transaction_verified, transaction_id } = req.body;

  if (!userid || !semester_key) {
    throw new CustomError("userid and semester_key are required", 400);
  }

  if (amount !== undefined && (isNaN(amount) || Number(amount) < 0)) {
    throw new CustomError("Amount must be a non-negative number", 400);
  }

  const targetStatus = status || SocietyFeeStatus.PENDING;
  const isTxVerified = transaction_verified !== undefined ? Boolean(transaction_verified) : false;
  const adminId = req.jwtPayload.userid;

  const prevRec = await getFeeAdminIds(userid, semester_key);
  const newVerifiedBy = isTxVerified ? (prevRec.verified_by || adminId) : null;
  const newAcceptedBy = (targetStatus === SocietyFeeStatus.VERIFIED) ? (prevRec.accepted_by || adminId) : null;

  const result = await manualSaveSocietyFeeRecord({
    userid: Number(userid),
    semester_key,
    amount: Number(amount || DEFAULT_SEMESTER_FEES[semester_key] || 300),
    status: targetStatus,
    transaction_verified: isTxVerified,
    transaction_id: transaction_id || null,
    verified_by: newVerifiedBy,
    accepted_by: newAcceptedBy,
  });

  res.status(200).json(result);
}, { statusCode: 500, message: "Couldn't save society fee record" });

// Delete a society fee record
const deleteSocietyFee = errorWrapper(async (req, res) => {
  const { society_fee_id } = req.params;
  const { userid, semester_key } = req.query;

  const deleted = await deleteSocietyFeeRecord({
    society_fee_id: society_fee_id ? Number(society_fee_id) : undefined,
    userid: userid ? Number(userid) : undefined,
    semester_key: semester_key ? String(semester_key) : undefined,
  });

  if (!deleted) {
    throw new CustomError("Society fee record not found or already deleted", 404);
  }

  res.status(200).json({ message: "Society fee record deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete society fee record" });

// Batch update society fee status (Verify All / Accept All)
const updateBatchSocietyFeeStatus = errorWrapper(async (req, res) => {
  const adminId = req.jwtPayload.userid;
  const { action, societyFeeIds } = req.body;

  const result = await updateBatchSocietyFeeStatusService({
    adminId,
    action,
    societyFeeIds,
  });

  res.status(200).json(result);
}, { statusCode: 500, message: "Couldn't process batch society fee update" });

module.exports = {
  getSocietyFeeData,
  getIndividualUserSocietyFee,
  updateSocietyFeeStatus,
  addOrEditManualSocietyFee,
  deleteSocietyFee,
  updateBatchSocietyFeeStatus,
  requireBillingPermission,
  SocietyFeeStatus,
  SemesterKey,
  DEFAULT_SEMESTER_FEES,
};
