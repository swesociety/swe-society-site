const pool = require("../db/dbconnect.js").pool;

const PAYMENT_QUERY = `
  SELECT
    sf.society_fee_id,
    sf.userid,
    sf.semester_key,
    sf.amount,
    sf.status,
    sf.transaction_verified,
    sf.transaction_id,
    sf.paymentid,
    p.paymentid AS linked_paymentid,
    p.amount AS payment_amount,
    p.payment_status,
    p.transaction_verified AS payment_transaction_verified,
    p.transaction_slip,
    p.created_at AS payment_created_at,
    mt.method_name,
    sf.verified_by,
    sf.accepted_by,
    sf.created_at,
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
  FROM society_fees sf
  LEFT JOIN payment p ON p.paymentid = sf.paymentid
  LEFT JOIN method_types mt ON mt.payment_methodid = p.methodid
  LEFT JOIN Users uv ON sf.verified_by = uv.userId
  LEFT JOIN Roles rv ON uv.roleid = rv.roleid
  LEFT JOIN Users ua ON sf.accepted_by = ua.userId
  LEFT JOIN Roles ra ON ua.roleid = ra.roleid
`;

async function getBillingPermissions(userid) {
  const { rows } = await pool.query(
    `SELECT
       COALESCE(b.hasBillingAccess, FALSE) AS "hasBillingAccess",
       COALESCE(b.canVerifyTransaction, FALSE) AS "canVerifyTransaction",
       COALESCE(b.canAcceptTransaction, FALSE) AS "canAcceptTransaction"
     FROM Users u
     LEFT JOIN Roles r ON r.roleid = u.roleid
     LEFT JOIN BillingACL b ON b.billingaclid = r.billingaclid
     WHERE u.userid = $1`,
    [userid],
  );
  return rows[0] || null;
}

async function getSocietyFeeUsers() {
  const { rows } = await pool.query(`
    SELECT u.userid, u.fullname, u.regno, u.session, LEFT(u.regno, 4) AS batch
    FROM Users u
    ORDER BY u.regno ASC
  `);
  return rows;
}

async function getSocietyFeePayments(userId) {
  const query = userId ? `${PAYMENT_QUERY} WHERE sf.userid = $1` : PAYMENT_QUERY;
  const { rows } = await pool.query(query, userId ? [userId] : []);
  return rows;
}

async function getFeeStatus(userid, semesterKey) {
  const { rows } = await pool.query(
    `SELECT transaction_verified, status FROM society_fees WHERE userid = $1 AND semester_key = $2`,
    [userid, semesterKey],
  );
  return rows[0] || {};
}

async function getFeeAdminIds(userid, semesterKey) {
  const { rows } = await pool.query(
    `SELECT verified_by, accepted_by FROM society_fees WHERE userid = $1 AND semester_key = $2`,
    [userid, semesterKey],
  );
  return rows[0] || {};
}

async function saveSocietyFeeStatus({
  userid,
  semester_key,
  amount,
  status,
  transaction_verified,
  transaction_id,
  verified_by,
  accepted_by,
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: paymentRows } = await client.query(
      `SELECT p.paymentid, p.amount, p.transaction_id
       FROM payment p
       JOIN payment_types pt ON pt.payment_typeid = p.payment_typeid
       WHERE p.userid = $1
         AND pt.subtype = $2
         AND LOWER(TRIM(pt.payment_type)) = 'society fee'
       ORDER BY p.created_at DESC, p.paymentid DESC
       LIMIT 1
       FOR UPDATE`,
      [userid, semester_key],
    );
    const linkedPayment = paymentRows[0] || null;
    const acceptedAmount = linkedPayment?.amount || amount;

    if (linkedPayment) {
      await client.query(
        `UPDATE payment
         SET transaction_verified = $2,
             payment_status = $3
         WHERE paymentid = $1`,
        [
          linkedPayment.paymentid,
          transaction_verified,
          status === "Verified",
        ],
      );
    }

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
        userid,
        semester_key,
        acceptedAmount,
        status,
        transaction_verified,
        linkedPayment?.transaction_id || transaction_id,
        verified_by,
        accepted_by,
        linkedPayment?.paymentid || null,
      ],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const rows = await getSocietyFeePayments(userid);
  return rows.find((row) => row.semester_key === semester_key) || null;
}

async function manualSaveSocietyFeeRecord({
  userid,
  semester_key,
  amount,
  status = "Pending",
  transaction_verified = false,
  transaction_id = null,
  verified_by = null,
  accepted_by = null,
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO society_fees (
         userid, semester_key, amount, status, transaction_verified,
         transaction_id, verified_by, accepted_by
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (userid, semester_key)
       DO UPDATE SET
         amount = EXCLUDED.amount,
         status = EXCLUDED.status,
         transaction_verified = EXCLUDED.transaction_verified,
         transaction_id = COALESCE(EXCLUDED.transaction_id, society_fees.transaction_id),
         verified_by = COALESCE(EXCLUDED.verified_by, society_fees.verified_by),
         accepted_by = COALESCE(EXCLUDED.accepted_by, society_fees.accepted_by),
         created_at = CURRENT_TIMESTAMP`,
      [
        userid,
        semester_key,
        amount,
        status,
        transaction_verified,
        transaction_id,
        verified_by,
        accepted_by,
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const rows = await getSocietyFeePayments(userid);
  return rows.find((row) => row.semester_key === semester_key) || null;
}

async function deleteSocietyFeeRecord({ society_fee_id, userid, semester_key }) {
  if (society_fee_id) {
    const { rowCount } = await pool.query(
      `DELETE FROM society_fees WHERE society_fee_id = $1`,
      [society_fee_id]
    );
    return rowCount > 0;
  } else if (userid && semester_key) {
    const { rowCount } = await pool.query(
      `DELETE FROM society_fees WHERE userid = $1 AND semester_key = $2`,
      [userid, semester_key]
    );
    return rowCount > 0;
  }
  return false;
}

async function updateBatchSocietyFeeStatusService({
  adminId,
  action,
  societyFeeIds,
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
      let unverifiedQuery = `SELECT society_fee_id FROM society_fees WHERE transaction_verified = FALSE`;
      const unverifiedParams = [];

      if (Array.isArray(societyFeeIds) && societyFeeIds.length > 0) {
        unverifiedQuery += ` AND society_fee_id = ANY($1::int[])`;
        unverifiedParams.push(societyFeeIds);
      } else {
        unverifiedQuery += ` AND status != 'Verified'`;
      }

      const { rows: unverifiedRows } = await client.query(unverifiedQuery, unverifiedParams);
      if (unverifiedRows.length > 0) {
        throw new CustomError(
          `Cannot accept payments: ${unverifiedRows.length} society fee transaction(s) are not verified yet. Please verify all transactions before accepting.`,
          400,
        );
      }
    }

    let queryText = `SELECT * FROM society_fees`;
    const queryParams = [];

    if (Array.isArray(societyFeeIds) && societyFeeIds.length > 0) {
      if (action === "verify_all") {
        queryText += ` WHERE society_fee_id = ANY($1::int[]) AND transaction_verified = FALSE`;
      } else {
        queryText += ` WHERE society_fee_id = ANY($1::int[]) AND status != 'Verified' AND transaction_verified = TRUE`;
      }
      queryParams.push(societyFeeIds);
    } else {
      if (action === "verify_all") {
        queryText += ` WHERE transaction_verified = FALSE`;
      } else {
        queryText += ` WHERE status != 'Verified' AND transaction_verified = TRUE`;
      }
    }

    queryText += ` FOR UPDATE`;

    const { rows: targetFees } = await client.query(queryText, queryParams);

    let updatedCount = 0;

    for (const sf of targetFees) {
      if (action === "verify_all") {
        if (!sf.transaction_verified) {
          const verifiedBy = sf.verified_by || adminId;
          await client.query(
            `UPDATE society_fees
             SET transaction_verified = TRUE,
                 verified_by = $2
             WHERE society_fee_id = $1 AND transaction_verified = FALSE`,
            [sf.society_fee_id, verifiedBy],
          );

          if (sf.paymentid) {
            await client.query(
              `UPDATE payment
               SET transaction_verified = TRUE,
                   verified_by = COALESCE(verified_by, $2)
               WHERE paymentid = $1 AND transaction_verified = FALSE`,
              [sf.paymentid, verifiedBy],
            );
          }
          updatedCount++;
        }
      } else if (action === "accept_all") {
        if (sf.status !== "Verified" && sf.transaction_verified) {
          const acceptedBy = adminId;
          await client.query(
            `UPDATE society_fees
             SET status = 'Verified',
                 accepted_by = $2
             WHERE society_fee_id = $1 AND status != 'Verified'`,
            [sf.society_fee_id, acceptedBy],
          );

          if (sf.paymentid) {
            await client.query(
              `UPDATE payment
               SET payment_status = TRUE,
                   accepted_by = COALESCE(accepted_by, $2)
               WHERE paymentid = $1 AND payment_status = FALSE`,
              [sf.paymentid, acceptedBy],
            );
          }
          updatedCount++;
        }
      }
    }

    await client.query("COMMIT");

    return { updatedCount };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  getBillingPermissions,
  getSocietyFeeUsers,
  getSocietyFeePayments,
  getFeeStatus,
  getFeeAdminIds,
  saveSocietyFeeStatus,
  manualSaveSocietyFeeRecord,
  deleteSocietyFeeRecord,
  updateBatchSocietyFeeStatusService,
};

