const pool = require("../db/dbconnect.js").pool;

const BILLING_ACL_COLUMNS = `
  hasBillingAccess,
  canVerifyTransaction,
  canAcceptTransaction,
  canAddTransaction,
  canDeleteTransaction,
  canViewPaymentMethod,
  canEditPaymentMethod,
  canDeletePaymentMethod,
  canViewPaymentType,
  canEditPaymentType,
  canDeletePaymentType
`;

function formatBillingACL(raw) {
  if (!raw) return null;
  return {
    billingaclid: raw.billingaclid,
    hasBillingAccess: Boolean(raw.hasbillingaccess ?? raw.hasBillingAccess ?? false),
    canVerifyTransaction: Boolean(raw.canverifytransaction ?? raw.canVerifyTransaction ?? false),
    canAcceptTransaction: Boolean(raw.canaccepttransaction ?? raw.canAcceptTransaction ?? false),
    canAddTransaction: Boolean(raw.canaddtransaction ?? raw.canAddTransaction ?? false),
    canDeleteTransaction: Boolean(raw.candeletetransaction ?? raw.canDeleteTransaction ?? false),
    canViewPaymentMethod: Boolean(raw.canviewpaymentmethod ?? raw.canViewPaymentMethod ?? false),
    canEditPaymentMethod: Boolean(raw.caneditpaymentmethod ?? raw.canEditPaymentMethod ?? false),
    canDeletePaymentMethod: Boolean(raw.candeletepaymentmethod ?? raw.canDeletePaymentMethod ?? false),
    canViewPaymentType: Boolean(raw.canviewpaymenttype ?? raw.canViewPaymentType ?? false),
    canEditPaymentType: Boolean(raw.caneditpaymenttype ?? raw.canEditPaymentType ?? false),
    canDeletePaymentType: Boolean(raw.candeletepaymenttype ?? raw.canDeletePaymentType ?? false),
  };
}

function parseBillingACL(input) {
  return {
    hasBillingAccess: Boolean(input?.hasBillingAccess ?? input?.hasbillingaccess ?? false),
    canVerifyTransaction: Boolean(input?.canVerifyTransaction ?? input?.canverifytransaction ?? false),
    canAcceptTransaction: Boolean(input?.canAcceptTransaction ?? input?.canaccepttransaction ?? false),
    canAddTransaction: Boolean(input?.canAddTransaction ?? input?.canaddtransaction ?? false),
    canDeleteTransaction: Boolean(input?.canDeleteTransaction ?? input?.candeletetransaction ?? false),
    canViewPaymentMethod: Boolean(input?.canViewPaymentMethod ?? input?.canviewpaymentmethod ?? false),
    canEditPaymentMethod: Boolean(input?.canEditPaymentMethod ?? input?.caneditpaymentmethod ?? false),
    canDeletePaymentMethod: Boolean(input?.canDeletePaymentMethod ?? input?.candeletepaymentmethod ?? false),
    canViewPaymentType: Boolean(input?.canViewPaymentType ?? input?.canviewpaymenttype ?? false),
    canEditPaymentType: Boolean(input?.canEditPaymentType ?? input?.caneditpaymenttype ?? false),
    canDeletePaymentType: Boolean(input?.canDeletePaymentType ?? input?.candeletepaymenttype ?? false),
  };
}

async function createBillingACL(input) {
  const acl = parseBillingACL(input);
  const values = Object.values(acl);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
  const { rows } = await pool.query(
    `INSERT INTO BillingACL (${BILLING_ACL_COLUMNS}) VALUES (${placeholders}) RETURNING billingaclid`,
    values,
  );
  return { ...acl, billingaclid: rows[0].billingaclid };
}

async function updateBillingACL(billingaclid, input) {
  const acl = parseBillingACL(input);
  const values = Object.values(acl);
  const assignments = Object.keys(acl)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  await pool.query(
    `UPDATE BillingACL SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE billingaclid = $${values.length + 1}`,
    [...values, billingaclid],
  );
  return { ...acl, billingaclid };
}

module.exports = {
  createBillingACL,
  updateBillingACL,
  formatBillingACL,
  parseBillingACL,
};