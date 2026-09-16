const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const paymentService = require("../services/paymentService.js");
const { logActivity } = require("../services/activityLogService.js");
const { ActivityAction } = require("../services/activityActions.js");

// Create Payment Type
const createPaymentType = errorWrapper(async (req, res) => {
  const { payment_type, year, subtype, amount, method } = req.body;
  if (
    !subtype ||
    (!Object.hasOwn(paymentService.SemesterKey, subtype) &&
      !Object.values(paymentService.SemesterKey).includes(subtype))
  ) {
    throw new CustomError(
      `Invalid semester key. Must be one of: ${Object.keys(paymentService.SemesterKey).join(", ")} or ${Object.values(paymentService.SemesterKey).join(", ")}`,
      400,
    );
  }
  const paymentType = await paymentService.createPaymentType({
    payment_type,
    year,
    subtype,
    amount,
    method,
  });

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_TYPE_CREATED,
    category: "payment",
    targetType: "payment_type",
    targetId: paymentType.payment_typeid,
    description: `Created payment type: ${payment_type} (${subtype}, year ${year})`,
    metadata: { payment_type, year, subtype, amount },
  });

  res.status(201).json(paymentType);
}, { statusCode: 500, message: "Couldn't create payment type" });

// Create Method Type
const createMethodType = errorWrapper(async (req, res) => {
  const { method_name, transaction_account, account_holder } = req.body;
  const newMethod = await paymentService.createMethodType({ method_name, transaction_account, account_holder });

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_METHOD_CREATED,
    category: "payment",
    targetType: "method_type",
    targetId: newMethod.payment_methodid,
    description: `Created payment method: ${method_name}`,
    metadata: { method_name, transaction_account, account_holder },
  });

  res.status(201).json(newMethod);
}, { statusCode: 500, message: "Couldn't create method type" });

// Create Payment
const createPayment = errorWrapper(async (req, res) => {
    const { userId, payment_typeid, semester_key, methodid, amount, transaction_id, transaction_slip } = req.body;
    if (!semester_key || !Object.hasOwn(paymentService.SemesterKey, semester_key)) {
      throw new CustomError(`Invalid semester key. Must be one of: ${Object.keys(paymentService.SemesterKey).join(", ")}`, 400);
    }

    const paymentTypeSubtype = await paymentService.getPaymentTypeSubtype(payment_typeid);
    if (!paymentTypeSubtype) {
      throw new CustomError("Invalid payment type", 400);
    }
    if (paymentTypeSubtype !== semester_key) {
      throw new CustomError("Selected semester does not match the payment type", 400);
    }

    if (!Number.isInteger(Number(amount)) || Number(amount) <= 0) {
      throw new CustomError("Payment amount must be a positive number", 400);
    }

    const authenticatedUserId = req.jwtPayload?.userid;
    if (!authenticatedUserId || Number(userId) !== Number(authenticatedUserId)) {
      throw new CustomError("You can only submit a payment for your own account", 403);
    }

    const payment = await paymentService.createPayment({
      userId: authenticatedUserId,
      payment_typeid,
      semester_key,
      methodid,
      amount,
      transaction_id,
      transaction_slip,
    });
    res.status(201).json(payment);
  }, { statusCode: 500, message: "Couldn't create payment" });

// Delete Payment Type
const deletePaymentType = errorWrapper(async (req, res) => {
  const { payment_typeid } = req.params;
  await paymentService.deletePaymentType(payment_typeid);

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_TYPE_DELETED,
    category: "payment",
    targetType: "payment_type",
    targetId: payment_typeid,
    description: `Deleted payment type ID: ${payment_typeid}`,
    metadata: { payment_typeid },
  });

  res.status(200).json({ message: "Payment type deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete payment type" });

// Delete Method Type
const deleteMethodType = errorWrapper(async (req, res) => {
  const { payment_methodid } = req.params;
  await paymentService.deleteMethodType(payment_methodid);

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_METHOD_DELETED,
    category: "payment",
    targetType: "method_type",
    targetId: payment_methodid,
    description: `Deleted payment method ID: ${payment_methodid}`,
    metadata: { payment_methodid },
  });

  res.status(200).json({ message: "Method type deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete method type" });

// Delete Payment
const deletePayment = errorWrapper(async (req, res) => {
  const { paymentid } = req.params;
  await paymentService.deletePayment(paymentid);

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_DELETED,
    category: "payment",
    targetType: "payment",
    targetId: paymentid,
    description: `Deleted payment ID: ${paymentid}`,
    metadata: { paymentid },
  });

  res.status(200).json({ message: "Payment deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete payment" });

// Update Payment Type
const updatePaymentType = errorWrapper(async (req, res) => {
  const { payment_typeid } = req.params;
  const { rows } = await paymentService.dynamicUpdate("payment_types", "payment_typeid", payment_typeid, req.body);

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_TYPE_UPDATED,
    category: "payment",
    targetType: "payment_type",
    targetId: payment_typeid,
    description: `Updated payment type ID: ${payment_typeid}`,
    metadata: { payment_typeid, updates: req.body },
  });

  res.status(200).json(rows[0]);
}, { statusCode: 500, message: "Couldn't update payment type" });

// Update Method Type
const updateMethodType = errorWrapper(async (req, res) => {
  const { payment_methodid } = req.params;
  const { rows } = await paymentService.dynamicUpdate("method_types", "payment_methodid", payment_methodid, req.body);

  await logActivity({
    req,
    action: ActivityAction.PAYMENT_METHOD_UPDATED,
    category: "payment",
    targetType: "method_type",
    targetId: payment_methodid,
    description: `Updated payment method ID: ${payment_methodid}`,
    metadata: { payment_methodid, updates: req.body },
  });

  res.status(200).json(rows[0]);
}, { statusCode: 500, message: "Couldn't update method type" });

// Update Payment (Supports 2-step verification, permissions, auditor tracking, and Society Fee sync)
const updatePayment = errorWrapper(async (req, res) => {
  const { paymentid } = req.params;
  const adminId = req.jwtPayload.userid;
  const { transaction_verified, payment_status, amount } = req.body;

  const updatedRecord = await paymentService.updatePaymentStatusService({
    paymentid,
    adminId,
    transaction_verified,
    payment_status,
    amount,
  });

  await logActivity({
    req,
    action: payment_status ? ActivityAction.PAYMENT_ACCEPTED : (transaction_verified ? ActivityAction.PAYMENT_VERIFIED : ActivityAction.PAYMENT_UPDATED),
    category: "payment",
    targetType: "payment",
    targetId: paymentid,
    description: `Payment ID: ${paymentid} — verified: ${transaction_verified}, accepted: ${payment_status}`,
    metadata: { transaction_verified, payment_status, amount }
  });

  res.status(200).json(updatedRecord);
}, { statusCode: 500, message: "Couldn't update payment" });

// Get All Payment Types
const getAllPaymentTypes = errorWrapper(async (req, res) => {
  const rows = await paymentService.getAllPaymentTypes();
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types" });

const getPaymentTypesByYear = errorWrapper(async (req, res) => {
  const { year } = req.params;
  const rows = await paymentService.getPaymentTypesByYear(year);
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types by year" });

const getPaymentTypesByUserId = errorWrapper(async (req, res) => {
  const { userid } = req.params;
  const rows = await paymentService.getPaymentTypesByUserId(userid);
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types by userid" });

// Get All Method Types
const getAllMethodTypes = errorWrapper(async (req, res) => {
  const rows = await paymentService.getAllMethodTypes();
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve method types" });

// Get Payment List by Payment Type ID
const getPaymentsByType = errorWrapper(async (req, res) => {
  const { payment_typeid } = req.params;
  const rows = await paymentService.getPaymentsByType(payment_typeid);
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payments" });

// Get Method Types by Payment Type ID
const getMethodTypesbyPaymentid = errorWrapper(async (req, res) => {
  const { payment_typeid } = req.params;
  const methodDetails = await paymentService.getMethodTypesbyPaymentid(payment_typeid);
  if (!methodDetails) {
    return res.status(404).json({ message: "No methods found for this payment type" });
  }
  res.status(200).json(methodDetails);
}, { statusCode: 500, message: "Couldn't retrieve method types by payment type ID" });

const getAllPayments = errorWrapper(async (req, res) => {
  const payments = await paymentService.getAllPaymentsWithAuditors();
  res.status(200).json(payments);
}, { statusCode: 500, message: "Couldn't retrieve payments" });

// Get Society Fee Table (all users × all payment types matrix)
const getSocietyFeeTable = errorWrapper(async (req, res) => {
  const result = await paymentService.getSocietyFeeTable();
  res.status(200).json(result);
}, { statusCode: 500, message: "Couldn't retrieve society fee table" });

// Batch Update Payments (Verify All / Accept All)
const updateBatchPayments = errorWrapper(async (req, res) => {
  const adminId = req.jwtPayload.userid;
  const { action, paymentIds } = req.body;

  const result = await paymentService.updateBatchPaymentStatusService({
    adminId,
    action,
    paymentIds,
  });

  await logActivity({
    req,
    action: action === 'verify_all' ? ActivityAction.PAYMENT_BATCH_VERIFIED : ActivityAction.PAYMENT_BATCH_ACCEPTED,
    category: "payment",
    description: `Batch payment action '${action}' on ${paymentIds?.length || 0} payment(s)`,
    metadata: { action, count: paymentIds?.length, paymentIds }
  });

  res.status(200).json(result);
}, { statusCode: 500, message: "Couldn't process batch payment update" });

module.exports = {
  createPaymentType,
  createMethodType,
  createPayment,
  deletePaymentType,
  deleteMethodType,
  deletePayment,
  updatePaymentType,
  updateMethodType,
  updatePayment,
  updateBatchPayments,
  getAllPaymentTypes,
  getAllMethodTypes,
  getPaymentsByType,
  getMethodTypesbyPaymentid,
  getAllPayments,
  getPaymentTypesByYear,
  getPaymentTypesByUserId,
  getSocietyFeeTable
};
