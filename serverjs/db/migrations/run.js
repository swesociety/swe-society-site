const { addStandingsAccess } = require("./add_standingsaccess.js");
const { addPaymentAuditors } = require("./add_payment_auditors.js");
const { addExecutiveCommitteeMembership } = require("./add_executive_committee_membership.js");
const { addBillingACL } = require("./add_billing_acl.js");
const { addPaymentTypeMethodACL } = require("./add_payment_type_method_acl.js");
const { addPaymentSocietyFeeSync } = require("./add_payment_society_fee_sync.js");
const { addSocietyFeeTables } = require("./add_society_fee_tables.js");

async function runMigrations() {
  const migrations = [
    { name: "add_standingsaccess", fn: addStandingsAccess },
    { name: "add_payment_auditors", fn: addPaymentAuditors },
    { name: "add_executive_committee_membership", fn: addExecutiveCommitteeMembership },
    { name: "add_billing_acl", fn: addBillingACL },
    { name: "add_payment_type_method_acl", fn: addPaymentTypeMethodACL },
    { name: "add_payment_society_fee_sync", fn: addPaymentSocietyFeeSync },
    { name: "add_society_fee_tables", fn: addSocietyFeeTables },
  ];

  for (const migration of migrations) {
    try {
      await migration.fn();
    } catch (error) {
      console.error(`Migration ${migration.name} failed:`, error);
    }
  }
}

module.exports = {
  runMigrations,
  addStandingsAccess,
  addPaymentAuditors,
  addExecutiveCommitteeMembership,
  addBillingACL,
  addPaymentTypeMethodACL,
  addPaymentSocietyFeeSync,
  addSocietyFeeTables,
};
