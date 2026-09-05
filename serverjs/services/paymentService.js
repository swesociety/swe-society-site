const pool = require("../db/dbconnect.js").pool;
const CustomError = require("./CustomError.js");
const { getBillingPermissions } = require("./societyFeeService.js");

const PAYMENT_AUDITOR_QUERY = `
  SELECT 
    p.paymentid, p.userid, p.amount, p.transaction_id, p.transaction_slip, p.created_at,
    p.transaction_verified, p.payment_status, p.verified_by, p.accepted_by,
    u.fullname, u.session, u.regno,
    m.method_name,
    pt.payment_type, pt.year, pt.subtype,
    uv.fullname AS verifier_name,
    uv.regno AS verifier_regno,
    uv.profile_picture AS verifier_profile_picture,
    rv.roletitle AS verifier_role,
    COALESCE((
      SELECT json_agg(json_build_object(
        'post_name', cp.post_name,
        'committee_name', ec.committee_name,
        'committee_year', ec.year
      ) ORDER BY ec.year DESC, ec.committeeid DESC, cp.post_name)
      FROM Committee c
      JOIN Committeeposts cp ON c.postid = cp.committeepostid
      JOIN ExecutiveCommittees ec ON c.executive_committeeid = ec.committeeid
      WHERE c.userid = uv.userid
    ), '[]'::json) AS verifier_committee_memberships,
    ua.fullname AS accepter_name,
    ua.regno AS accepter_regno,
    ua.profile_picture AS accepter_profile_picture,
    ra.roletitle AS accepter_role,
    COALESCE((
      SELECT json_agg(json_build_object(
        'post_name', cp.post_name,
        'committee_name', ec.committee_name,
        'committee_year', ec.year
      ) ORDER BY ec.year DESC, ec.committeeid DESC, cp.post_name)
      FROM Committee c
      JOIN Committeeposts cp ON c.postid = cp.committeepostid
      JOIN ExecutiveCommittees ec ON c.executive_committeeid = ec.committeeid
      WHERE c.userid = ua.userid
    ), '[]'::json) AS accepter_committee_memberships
  FROM payment p
  JOIN Users u ON p.userId = u.userId
  JOIN method_types m ON p.methodid = m.payment_methodid
  JOIN payment_types pt ON p.payment_typeid = pt.payment_typeid
  LEFT JOIN Users uv ON p.verified_by = uv.userId
  LEFT JOIN Roles rv ON uv.roleid = rv.roleid
  LEFT JOIN Users ua ON p.accepted_by = ua.userId
  LEFT JOIN Roles ra ON ua.roleid = ra.roleid
`;

function normalizeSemesterKey(subtype) {
  if (!subtype) return "1/1 & 1/2";
  const s = String(subtype).trim();
  if (
    s === "1/1" ||
    s === "1/2" ||
    s === "SEM_1_1" ||
    s === "SEM_1_2" ||
    s === "YEAR_1" ||
    s === "1/1 & 1/2" ||
    s.toLowerCase().includes("1st")
  ) {
    return "1/1 & 1/2";
  }
  if (s.includes("2/1") || s.includes("2_1")) return "2/1";
  if (s.includes("2/2") || s.includes("2_2")) return "2/2";
  if (s.includes("3/1") || s.includes("3_1")) return "3/1";
  if (s.includes("3/2") || s.includes("3_2")) return "3/2";
  if (s.includes("4/1") || s.includes("4_1")) return "4/1";
  if (s.includes("4/2") || s.includes("4_2")) return "4/2";
  return s;
}

const SemesterKey = Object.freeze({
  YEAR_1: "1/1 & 1/2",
  SEM_1_1: "1/1",
  SEM_1_2: "1/2",
  SEM_2_1: "2/1",
  SEM_2_2: "2/2",
  SEM_3_1: "3/1",
  SEM_3_2: "3/2",
  SEM_4_1: "4/1",
  SEM_4_2: "4/2",
});

function normalizeSemesterKey(subtype) {
  if (!subtype) return SemesterKey.YEAR_1;
  const s = String(subtype).trim();
  if (
    s === SemesterKey.SEM_1_1 ||
    s === SemesterKey.SEM_1_2 ||
    s === "SEM_1_1" ||
    s === "SEM_1_2" ||
    s === "YEAR_1" ||
    s === SemesterKey.YEAR_1 ||
    s.toLowerCase().includes("1st")
  ) {
    return SemesterKey.YEAR_1;
  }
  if (s.includes("2/1") || s.includes("2_1") || s === SemesterKey.SEM_2_1) return SemesterKey.SEM_2_1;
  if (s.includes("2/2") || s.includes("2_2") || s === SemesterKey.SEM_2_2) return SemesterKey.SEM_2_2;
  if (s.includes("3/1") || s.includes("3_1") || s === SemesterKey.SEM_3_1) return SemesterKey.SEM_3_1;
  if (s.includes("3/2") || s.includes("3_2") || s === SemesterKey.SEM_3_2) return SemesterKey.SEM_3_2;
  if (s.includes("4/1") || s.includes("4_1") || s === SemesterKey.SEM_4_1) return SemesterKey.SEM_4_1;
  if (s.includes("4/2") || s.includes("4_2") || s === SemesterKey.SEM_4_2) return SemesterKey.SEM_4_2;

  if (Object.values(SemesterKey).includes(s)) {
    return s;
  }
  return s;
}

async function getAllPaymentsWithAuditors() {
  const { rows } = await pool.query(
    `${PAYMENT_AUDITOR_QUERY} ORDER BY p.created_at DESC, p.paymentid DESC`
  );
  return rows;
}

async function getSinglePaymentWithAuditors(paymentId) {
  const { rows } = await pool.query(
    `${PAYMENT_AUDITOR_QUERY} WHERE p.paymentid = $1`,
    [paymentId]
  );
  return rows[0] || null;
}

async function createPaymentType({ payment_type, year, subtype, amount, method }) {
  const { rows } = await pool.query(
    `INSERT INTO payment_types (payment_type, year, subtype, amount, method)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [payment_type, year, subtype, amount, method],
  );
  return rows[0];
}

async function getPaymentTypeSubtype(paymentTypeId) {
  const { rows } = await pool.query(
    `SELECT subtype FROM payment_types WHERE payment_typeid = $1`,
    [paymentTypeId],
  );
  return rows[0]?.subtype || null;
}

async function createPayment({
  userId,
  payment_typeid,
  semester_key,
  methodid,
  amount,
  transaction_id,
  transaction_slip,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: paymentTypeRows } = await client.query(
      `SELECT payment_type, year, subtype, amount
       FROM payment_types
       WHERE payment_typeid = $1
       FOR SHARE`,
      [payment_typeid],
    );
    const paymentType = paymentTypeRows[0];
    const isSocietyFee =
      paymentType &&
      (paymentType.payment_type.trim().toLowerCase().includes("society") ||
        paymentType.payment_type.trim().toLowerCase().includes("semester") ||
        paymentType.payment_type.trim().toLowerCase().includes("fee"));

    if (isSocietyFee) {
      const normalizedKey = normalizeSemesterKey(semester_key || paymentType?.subtype);
      const { rows: duplicateRows } = await client.query(
        `SELECT p.paymentid
         FROM payment p
         JOIN payment_types pt ON pt.payment_typeid = p.payment_typeid
         WHERE p.userid = $1
           AND (pt.subtype = $2 OR pt.subtype = $3)
           AND (
             LOWER(TRIM(pt.payment_type)) LIKE '%society%'
             OR LOWER(TRIM(pt.payment_type)) LIKE '%semester%'
             OR LOWER(TRIM(pt.payment_type)) LIKE '%fee%'
           )
         LIMIT 1`,
        [userId, semester_key, normalizedKey],
      );

      if (duplicateRows.length > 0) {
        throw new CustomError(
          "A Society Fee payment already exists for this batch and semester.",
          409,
        );
      }
    }

    const { rows } = await client.query(
      `INSERT INTO payment (
         userId, payment_typeid, methodid, amount, transaction_id, transaction_slip
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, payment_typeid, methodid, amount, transaction_id, transaction_slip],
    );
    const payment = rows[0];

    if (isSocietyFee) {
      const targetSemesterKey = normalizeSemesterKey(semester_key || paymentType?.subtype);
      await client.query(
        `INSERT INTO society_fees (
           userid, semester_key, amount, status, transaction_verified,
           transaction_id, paymentid
         )
         VALUES ($1, $2, $3, 'Pending', FALSE, $4, $5)
         ON CONFLICT (userid, semester_key)
         DO UPDATE SET
           amount = EXCLUDED.amount,
           transaction_id = EXCLUDED.transaction_id,
           paymentid = EXCLUDED.paymentid`,
        [userId, targetSemesterKey, amount, transaction_id, payment.paymentid],
      );
    }

    await client.query("COMMIT");
    return payment;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updatePaymentStatusService({
  paymentid,
  adminId,
  transaction_verified,
  payment_status,
  amount,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: existingRows } = await client.query(
      `SELECT p.*, pt.payment_type, pt.subtype, pt.year
       FROM payment p
       JOIN payment_types pt ON pt.payment_typeid = p.payment_typeid
       WHERE p.paymentid = $1
       FOR UPDATE`,
      [paymentid],
    );

    if (existingRows.length === 0) {
      throw new CustomError("Payment record not found", 404);
    }
    const existing = existingRows[0];

    const permissions = (await getBillingPermissions(adminId)) || {};
    const newTxVerified =
      transaction_verified !== undefined
        ? Boolean(transaction_verified)
        : Boolean(existing.transaction_verified);
    const newPaymentStatus =
      payment_status !== undefined
        ? Boolean(payment_status)
        : Boolean(existing.payment_status);
    const newAmount = amount !== undefined ? Number(amount) : existing.amount;

    const changesVerification =
      newTxVerified !== Boolean(existing.transaction_verified);
    const changesAcceptance =
      newPaymentStatus !== Boolean(existing.payment_status);

    if (changesVerification && !permissions.canVerifyTransaction) {
      throw new CustomError("You do not have permission to verify transactions.", 403);
    }
    if (changesAcceptance && !permissions.canAcceptTransaction) {
      throw new CustomError("You do not have permission to accept payments.", 403);
    }

    // Constraint: Cannot accept payment if transaction is unverified
    if (newPaymentStatus && !newTxVerified) {
      throw new CustomError(
        "Transaction is not verified. Please verify the transaction before accepting payment.",
        400,
      );
    }

    let verified_by = existing.verified_by;
    if (newTxVerified) {
      if (!verified_by) verified_by = adminId;
    } else {
      verified_by = null;
    }

    let accepted_by = existing.accepted_by;
    if (newPaymentStatus) {
      if (!accepted_by) accepted_by = adminId;
    } else {
      accepted_by = null;
    }

    await client.query(
      `UPDATE payment
       SET transaction_verified = $2,
           payment_status = $3,
           verified_by = $4,
           accepted_by = $5,
           amount = $6
       WHERE paymentid = $1`,
      [
        paymentid,
        newTxVerified,
        newPaymentStatus,
        verified_by,
        accepted_by,
        newAmount,
      ],
    );

    // Sync with society_fees table if this is a Society Fee payment
    const targetUserId = existing.userid || existing.userId || existing.user_id;
    const isSocietyFee =
      existing.payment_type &&
      (existing.payment_type.trim().toLowerCase().includes("society") ||
        existing.payment_type.trim().toLowerCase().includes("semester") ||
        existing.payment_type.trim().toLowerCase().includes("fee") ||
        Boolean(normalizeSemesterKey(existing.subtype)));

    if (isSocietyFee && targetUserId && existing.subtype) {
      const targetSemesterKey = normalizeSemesterKey(existing.subtype);
      const societyStatus = newPaymentStatus ? "Verified" : "Pending";

      const updateRes = await client.query(
        `UPDATE society_fees
         SET semester_key = $2,
             amount = $3,
             status = $4,
             transaction_verified = $5,
             transaction_id = COALESCE($6, transaction_id),
             verified_by = $7,
             accepted_by = $8,
             paymentid = $9
         WHERE paymentid = $9 OR (userid = $1 AND semester_key = $2)`,
        [
          targetUserId,
          targetSemesterKey,
          newAmount,
          societyStatus,
          newTxVerified,
          existing.transaction_id,
          verified_by,
          accepted_by,
          paymentid,
        ],
      );

      if (updateRes.rowCount === 0) {
        await client.query(
          `INSERT INTO society_fees (
             userid, semester_key, amount, status, transaction_verified,
             transaction_id, verified_by, accepted_by, paymentid
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (userid, semester_key)
           DO UPDATE SET
             status = EXCLUDED.status,
             transaction_verified = EXCLUDED.transaction_verified,
             amount = EXCLUDED.amount,
             transaction_id = COALESCE(EXCLUDED.transaction_id, society_fees.transaction_id),
             verified_by = EXCLUDED.verified_by,
             accepted_by = EXCLUDED.accepted_by,
             paymentid = COALESCE(EXCLUDED.paymentid, society_fees.paymentid),
             created_at = CURRENT_TIMESTAMP`,
          [
            targetUserId,
            targetSemesterKey,
            newAmount,
            societyStatus,
            newTxVerified,
            existing.transaction_id,
            verified_by,
            accepted_by,
            paymentid,
          ],
        );
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return getSinglePaymentWithAuditors(paymentid);
}

async function updateBatchPaymentStatusService({
  adminId,
  action,
  paymentIds,
}) {
  const permissions = (await getBillingPermissions(adminId)) || {};

  if (action === "verify_all") {
    if (!permissions.canVerifyTransaction) {
      throw new CustomError("You do not have permission to verify transactions.", 403);
    }
  } else if (action === "accept_all") {
    if (!permissions.canAcceptTransaction) {
      throw new CustomError("You do not have permission to accept payments.", 403);
    }
  } else {
    throw new CustomError("Invalid batch action specified.", 400);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (action === "accept_all") {
      let unverifiedCheckQuery = `SELECT paymentid FROM payment WHERE transaction_verified = FALSE`;
      const checkParams = [];
      if (Array.isArray(paymentIds) && paymentIds.length > 0) {
        unverifiedCheckQuery += ` AND paymentid = ANY($1::int[])`;
        checkParams.push(paymentIds);
      } else {
        unverifiedCheckQuery += ` AND payment_status = FALSE`;
      }

      const { rows: unverifiedRows } = await client.query(unverifiedCheckQuery, checkParams);
      if (unverifiedRows.length > 0) {
        throw new CustomError(
          `Cannot accept payments: ${unverifiedRows.length} transaction(s) are not verified yet. Please verify all transactions before accepting.`,
          400,
        );
      }
    }

    let queryText = `
      SELECT p.*, pt.payment_type, pt.subtype, pt.year
      FROM payment p
      JOIN payment_types pt ON pt.payment_typeid = p.payment_typeid
    `;
    const queryParams = [];

    if (Array.isArray(paymentIds) && paymentIds.length > 0) {
      if (action === "verify_all") {
        queryText += ` WHERE p.paymentid = ANY($1::int[]) AND p.transaction_verified = FALSE`;
      } else {
        queryText += ` WHERE p.paymentid = ANY($1::int[]) AND p.payment_status = FALSE AND p.transaction_verified = TRUE`;
      }
      queryParams.push(paymentIds);
    } else {
      if (action === "verify_all") {
        queryText += ` WHERE p.transaction_verified = FALSE`;
      } else {
        queryText += ` WHERE p.payment_status = FALSE AND p.transaction_verified = TRUE`;
      }
    }

    queryText += ` FOR UPDATE`;

    const { rows: targetPayments } = await client.query(queryText, queryParams);

    let updatedCount = 0;

    for (const p of targetPayments) {
      const targetUserId = p.userid || p.userId || p.user_id;
      const isSocietyFee =
        p.payment_type &&
        (p.payment_type.trim().toLowerCase().includes("society") ||
          p.payment_type.trim().toLowerCase().includes("semester") ||
          p.payment_type.trim().toLowerCase().includes("fee") ||
          Boolean(normalizeSemesterKey(p.subtype)));

      if (action === "verify_all") {
        if (!p.transaction_verified) {
          const verifiedBy = p.verified_by || adminId;
          await client.query(
            `UPDATE payment
             SET transaction_verified = TRUE,
                 verified_by = $2
             WHERE paymentid = $1 AND transaction_verified = FALSE`,
            [p.paymentid, verifiedBy],
          );

          if (isSocietyFee && targetUserId && p.subtype) {
            const targetSemesterKey = normalizeSemesterKey(p.subtype);
            await client.query(
              `UPDATE society_fees
               SET transaction_verified = TRUE,
                   verified_by = COALESCE(verified_by, $3)
               WHERE paymentid = $1 OR (userid = $2 AND semester_key = $4)`,
              [p.paymentid, targetUserId, verifiedBy, targetSemesterKey],
            );
          }
          updatedCount++;
        }
      } else if (action === "accept_all") {
        if (!p.payment_status && p.transaction_verified) {
          const acceptedBy = adminId;
          await client.query(
            `UPDATE payment
             SET payment_status = TRUE,
                 accepted_by = $2
             WHERE paymentid = $1 AND payment_status = FALSE`,
            [p.paymentid, acceptedBy],
          );

          if (isSocietyFee && targetUserId && p.subtype) {
            const targetSemesterKey = normalizeSemesterKey(p.subtype);
            const societyStatus = "Verified";

            const updateRes = await client.query(
              `UPDATE society_fees
               SET semester_key = $2,
                   amount = $3,
                   status = $4,
                   transaction_verified = TRUE,
                   transaction_id = COALESCE($5, transaction_id),
                   accepted_by = $6,
                   paymentid = $7
               WHERE paymentid = $7 OR (userid = $1 AND semester_key = $2)`,
              [
                targetUserId,
                targetSemesterKey,
                p.amount,
                societyStatus,
                p.transaction_id,
                acceptedBy,
                p.paymentid,
              ],
            );

            if (updateRes.rowCount === 0) {
              await client.query(
                `INSERT INTO society_fees (
                   userid, semester_key, amount, status, transaction_verified,
                   transaction_id, verified_by, accepted_by, paymentid
                 )
                 VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7, $8)
                 ON CONFLICT (userid, semester_key)
                 DO UPDATE SET
                   status = EXCLUDED.status,
                   transaction_verified = EXCLUDED.transaction_verified,
                   amount = EXCLUDED.amount,
                   transaction_id = COALESCE(EXCLUDED.transaction_id, society_fees.transaction_id),
                   verified_by = COALESCE(society_fees.verified_by, EXCLUDED.verified_by),
                   accepted_by = EXCLUDED.accepted_by,
                   paymentid = COALESCE(EXCLUDED.paymentid, society_fees.paymentid),
                   created_at = CURRENT_TIMESTAMP`,
                [
                  targetUserId,
                  targetSemesterKey,
                  p.amount,
                  societyStatus,
                  p.transaction_id,
                  p.verified_by || adminId,
                  acceptedBy,
                  p.paymentid,
                ],
              );
            }
          }
          updatedCount++;
        }
      }
    }

    await client.query("COMMIT");

    const allPayments = await getAllPaymentsWithAuditors();
    return { updatedCount, payments: allPayments };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  SemesterKey,
  normalizeSemesterKey,
  createPaymentType,
  getPaymentTypeSubtype,
  createPayment,
  getAllPaymentsWithAuditors,
  getSinglePaymentWithAuditors,
  updatePaymentStatusService,
  updateBatchPaymentStatusService,
};

