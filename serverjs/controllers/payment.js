const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const {
  SemesterKey,
  createPaymentType: savePaymentType,
  getPaymentTypeSubtype,
  createPayment: savePayment,
  getAllPaymentsWithAuditors,
  updatePaymentStatusService,
  updateBatchPaymentStatusService,
} = require("../services/paymentService.js");
const pool = require("../db/dbconnect.js").pool;
const { logActivity } = require("../services/activityLogService.js");

// Create Payment Type
const createPaymentType = errorWrapper(async (req, res) => {
  const { payment_type, year, subtype, amount, method } = req.body;
  if (
    !subtype ||
    (!Object.hasOwn(SemesterKey, subtype) &&
      !Object.values(SemesterKey).includes(subtype))
  ) {
    throw new CustomError(
      `Invalid semester key. Must be one of: ${Object.keys(SemesterKey).join(", ")} or ${Object.values(SemesterKey).join(", ")}`,
      400,
    );
  }
  const paymentType = await savePaymentType({
    payment_type,
    year,
    subtype,
    amount,
    method,
  });
  res.status(201).json(paymentType);
}, { statusCode: 500, message: "Couldn't create payment type" });

// Create Method Type
const createMethodType = errorWrapper(async (req, res) => {
  const { method_name, transaction_account, account_holder } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO method_types (method_name, transaction_account, account_holder)
     VALUES ($1, $2, $3) RETURNING *`,
    [method_name, transaction_account, account_holder]
  );
  res.status(201).json(rows[0]);
}, { statusCode: 500, message: "Couldn't create method type" });

// Create Payment
// Create Payment (Updated to include payment_status)
const createPayment = errorWrapper(async (req, res) => {
    const { userId, payment_typeid, semester_key, methodid, amount, transaction_id, transaction_slip } = req.body;
    if (!semester_key || !Object.hasOwn(SemesterKey, semester_key)) {
      throw new CustomError(`Invalid semester key. Must be one of: ${Object.keys(SemesterKey).join(", ")}`, 400);
    }

    const paymentTypeSubtype = await getPaymentTypeSubtype(payment_typeid);
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

    const payment = await savePayment({
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
  await pool.query(`DELETE FROM payment_types WHERE payment_typeid = $1`, [payment_typeid]);
  res.status(200).json({ message: "Payment type deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete payment type" });

// Delete Method Type
const deleteMethodType = errorWrapper(async (req, res) => {
  const { payment_methodid } = req.params;
  await pool.query(`DELETE FROM method_types WHERE payment_methodid = $1`, [payment_methodid]);
  res.status(200).json({ message: "Method type deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete method type" });

// Delete Payment
const deletePayment = errorWrapper(async (req, res) => {
  const { paymentid } = req.params;
  await pool.query(`DELETE FROM payment WHERE paymentid = $1`, [paymentid]);
  res.status(200).json({ message: "Payment deleted successfully" });
}, { statusCode: 500, message: "Couldn't delete payment" });

// Dynamic Update Function
const dynamicUpdate = async (table, idField, idValue, updateFields) => {
  const keys = Object.keys(updateFields);
  const values = Object.values(updateFields);
  if (keys.length === 0) throw new CustomError("No fields to update", 400);

  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
  const query = `UPDATE ${table} SET ${setClause} WHERE ${idField} = $${keys.length + 1} RETURNING *`;
  return pool.query(query, [...values, idValue]);
};

// Update Payment Type
const updatePaymentType = errorWrapper(async (req, res) => {
  const { payment_typeid } = req.params;
  const { rows } = await dynamicUpdate("payment_types", "payment_typeid", payment_typeid, req.body);
  res.status(200).json(rows[0]);
}, { statusCode: 500, message: "Couldn't update payment type" });

// Update Method Type
const updateMethodType = errorWrapper(async (req, res) => {
  const { payment_methodid } = req.params;
  const { rows } = await dynamicUpdate("method_types", "payment_methodid", payment_methodid, req.body);
  res.status(200).json(rows[0]);
}, { statusCode: 500, message: "Couldn't update method type" });

// Update Payment (Supports 2-step verification, permissions, auditor tracking, and Society Fee sync)
const updatePayment = errorWrapper(async (req, res) => {
  const { paymentid } = req.params;
  const adminId = req.jwtPayload.userid;
  const { transaction_verified, payment_status, amount } = req.body;

  const updatedRecord = await updatePaymentStatusService({
    paymentid,
    adminId,
    transaction_verified,
    payment_status,
    amount,
  });

  await logActivity({
    req,
    action: payment_status ? "payment.accept" : (transaction_verified ? "payment.verify" : "payment.update"),
    category: "payment",
    targetType: "payment",
    targetId: paymentid,
    description: `Updated payment status (verified: ${transaction_verified}, accepted: ${payment_status})`,
    metadata: { transaction_verified, payment_status, amount }
  });

  res.status(200).json(updatedRecord);
}, { statusCode: 500, message: "Couldn't update payment" });
  


// Get All Payment Types
const getAllPaymentTypes = errorWrapper(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM payment_types
     ORDER BY created_at DESC NULLS LAST, payment_typeid DESC`,
  );
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types" });

const getPaymentTypesByYear = errorWrapper(async (req, res) => {
  const { year } = req.params;
  
  const { rows } = await pool.query(
    `SELECT * FROM payment_types WHERE year = $1`,
    [year]
  );
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types by year" });

const getPaymentTypesByUserId = errorWrapper(async (req, res) => {
  const { userid } = req.params;
  
  const { rows } = await pool.query(
    `SELECT * FROM payment WHERE userId = $1`,
    [userid]
  );
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve payment types by userid" });

// Get All Method Types
const getAllMethodTypes = errorWrapper(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM method_types`);
  res.status(200).json(rows);
}, { statusCode: 500, message: "Couldn't retrieve method types" });

// Get Payment List by Payment Type ID
  // Get Payment List by Payment Type ID (Now includes payment_status)
  const getPaymentsByType = errorWrapper(async (req, res) => {
    const { payment_typeid } = req.params;
    
    const { rows } = await pool.query(
      `SELECT p.*, u.fullname, u.session, u.regno, m.method_name, p.payment_status
       FROM payment p
       JOIN Users u ON p.userId = u.userId
       JOIN method_types m ON p.methodid = m.payment_methodid
       WHERE p.payment_typeid = $1`, 
      [payment_typeid]
    );
    
    res.status(200).json(rows);
  }, { statusCode: 500, message: "Couldn't retrieve payments" });


// Get Method Types by Payment Type ID
const getMethodTypesbyPaymentid = errorWrapper(async (req, res) => {
    const { payment_typeid } = req.params;
    
    // Fetch method IDs from payment_types table
    const { rows: paymentTypeRows } = await pool.query(
      `SELECT method FROM payment_types WHERE payment_typeid = $1`,
      [payment_typeid]
    );
    
    if (paymentTypeRows.length === 0 || !paymentTypeRows[0].method) {
      return res.status(404).json({ message: "No methods found for this payment type" });
    }
    
    const methodIds = paymentTypeRows[0].method;
    
    // Fetch method details from method_types table
    const { rows: methodDetails } = await pool.query(
      `SELECT * FROM method_types WHERE payment_methodid = ANY($1::int[])`,
      [methodIds]
    );
    
    res.status(200).json(methodDetails);
  }, { statusCode: 500, message: "Couldn't retrieve method types by payment type ID" });

const getAllPayments = errorWrapper(async (req, res) => {
  const payments = await getAllPaymentsWithAuditors();
  res.status(200).json(payments);
}, { statusCode: 500, message: "Couldn't retrieve payments" });
  

// Get Society Fee Table (all users × all payment types matrix)
const getSocietyFeeTable = errorWrapper(async (req, res) => {
  // Fetch only semester-wise society payment types (columns)
  const { rows: paymentTypes } = await pool.query(
    `SELECT payment_typeid, payment_type, year, subtype, amount
     FROM payment_types
     WHERE LOWER(payment_type) LIKE '%society%'
        OR LOWER(payment_type) LIKE '%semester%'
        OR subtype ~* '^[0-9]\/[0-9]'
        OR subtype ILIKE '%semester%'
        OR subtype ILIKE '%1/%' OR subtype ILIKE '%2/%' OR subtype ILIKE '%3/%' OR subtype ILIKE '%4/%'
     ORDER BY year ASC, subtype ASC`
  );

  // If no specific society fee types matched, fallback to all payment types
  let effectivePaymentTypes = paymentTypes;
  if (effectivePaymentTypes.length === 0) {
    const { rows: allPts } = await pool.query(
      `SELECT payment_typeid, payment_type, year, subtype, amount
       FROM payment_types
       ORDER BY year ASC, subtype ASC`
    );
    effectivePaymentTypes = allPts;
  }

  // Fetch all users with their payment records
  const { rows: users } = await pool.query(
    `SELECT
       u.userid,
       u.fullname,
       u.regno,
       u.session,
       LEFT(u.regno, 4) AS batch
     FROM Users u
     ORDER BY u.regno ASC`
  );

  // Fetch all payments
  const { rows: payments } = await pool.query(
    `SELECT p.paymentid, p.userid, p.payment_typeid, p.payment_status, p.created_at, p.amount
     FROM payment p`
  );

  // Build a lookup map: { userid_paymenttypeid -> payment record }
  const paymentMap = {};
  for (const p of payments) {
    const key = `${p.userid}_${p.payment_typeid}`;
    if (!paymentMap[key] || (p.payment_status && !paymentMap[key].payment_status)) {
      paymentMap[key] = p;
    }
  }

  // Build user payment rows
  const userPayments = users.map((u) => {
    const payments_map = {};
    for (const pt of effectivePaymentTypes) {
      const key = `${u.userid}_${pt.payment_typeid}`;
      payments_map[pt.payment_typeid] = paymentMap[key] || null;
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

  res.status(200).json({ paymentTypes: effectivePaymentTypes, userPayments });
}, { statusCode: 500, message: "Couldn't retrieve society fee table" });

// Batch Update Payments (Verify All / Accept All)
const updateBatchPayments = errorWrapper(async (req, res) => {
  const adminId = req.jwtPayload.userid;
  const { action, paymentIds } = req.body;

  const result = await updateBatchPaymentStatusService({
    adminId,
    action,
    paymentIds,
  });

  await logActivity({
    req,
    action: `payment.batch_${action}`,
    category: "payment",
    description: `Batch payment action '${action}' executed on ${paymentIds?.length || 0} payments`,
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

