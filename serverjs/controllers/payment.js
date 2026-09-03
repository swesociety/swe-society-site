const errorWrapper = require("../middlewares/errorWrapper.js");
const CustomError = require("../services/CustomError.js");
const pool = require("../db/dbconnect.js").pool;

// Create Payment Type
const createPaymentType = errorWrapper(async (req, res) => {
  const { payment_type, year, subtype, amount, method } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO payment_types (payment_type, year, subtype, amount, method)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [payment_type, year, subtype, amount, method]
  );
  res.status(201).json(rows[0]);
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
    const { userId, payment_typeid, methodid, amount, transaction_id, transaction_slip, payment_status = false } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO payment (userId, payment_typeid, methodid, amount, transaction_id, transaction_slip)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, payment_typeid, methodid, amount, transaction_id, transaction_slip]
    );
    res.status(201).json(rows[0]);
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

// Update Payment
  // Update Payment (Now allows updating payment_status)
  const updatePayment = errorWrapper(async (req, res) => {
    const { paymentid } = req.params;
    const { rows } = await dynamicUpdate("payment", "paymentid", paymentid, req.body);
    res.status(200).json(rows[0]);
  }, { statusCode: 500, message: "Couldn't update payment" });
  


// Get All Payment Types
const getAllPaymentTypes = errorWrapper(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM payment_types`);
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
    const { rows } = await pool.query(
      `SELECT 
          p.paymentid, p.amount, p.transaction_id, p.transaction_slip, p.created_at, p.payment_status,
          u.fullname, u.session, u.regno,
          m.method_name,
          pt.payment_type, pt.year, pt.subtype
       FROM payment p
       JOIN Users u ON p.userId = u.userId
       JOIN method_types m ON p.methodid = m.payment_methodid
       JOIN payment_types pt ON p.payment_typeid = pt.payment_typeid`
    );
  
    res.status(200).json(rows);
  }, { statusCode: 500, message: "Couldn't retrieve payments" });
  

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
  getAllPaymentTypes,
  getAllMethodTypes,
  getPaymentsByType,
  getMethodTypesbyPaymentid,
  getAllPayments,
  getPaymentTypesByYear,
  getPaymentTypesByUserId
};
