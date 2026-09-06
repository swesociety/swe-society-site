import { BillingACL, Role } from "@/data/types";
import { RolePermissionField } from "./PermissionGroup";

// ─── Label formatter ──────────────────────────────────────────────────────────

/**
 * Converts a camelCase field key into a human-readable label.
 * e.g. "blogaccess" → "Blog Access", "isdefaultrole" → "Default Role"
 */
export const formatLabel = (key: string): string => {
  let formatted = key.replace(/(access|^is)/, "");
  formatted = formatted
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  if (key.includes("access")) {
    formatted += " Access";
  }

  return formatted;
};

// ─── Billing ACL ─────────────────────────────────────────────────────────────

/** Human-readable labels for each BillingACL flag. */
export const BILLING_ACL_LABELS: Record<
  keyof Omit<BillingACL, "billingaclid">,
  string
> = {
  hasBillingAccess:     "Has Billing Access (Manage)",
  canVerifyTransaction: "Can Verify Transaction",
  canAcceptTransaction: "Can Accept Transaction",
  canAddTransaction:    "Can Add Transaction",
  canDeleteTransaction: "Can Delete Transaction",
  canViewPaymentMethod: "Can View Payment Methods",
  canEditPaymentMethod: "Can Edit Payment Methods",
  canDeletePaymentMethod: "Can Delete Payment Methods",
  canViewPaymentType: "Can View Payment Types",
  canEditPaymentType: "Can Edit Payment Types",
  canDeletePaymentType: "Can Delete Payment Types",
};

/** All BillingACL fields in display order. */
export const BILLING_ACL_FIELDS = Object.keys(
  BILLING_ACL_LABELS
) as (keyof Omit<BillingACL, "billingaclid">)[];

/** Default (all-false) BillingACL value. */
export const DEFAULT_BILLING_ACL: Omit<BillingACL, "billingaclid"> = {
  hasBillingAccess:     false,
  canVerifyTransaction: false,
  canAcceptTransaction: false,
  canAddTransaction:    false,
  canDeleteTransaction: false,
  canViewPaymentMethod: false,
  canEditPaymentMethod: false,
  canDeletePaymentMethod: false,
  canViewPaymentType: false,
  canEditPaymentType: false,
  canDeletePaymentType: false,
};

// ─── Permission groups ────────────────────────────────────────────────────────

/**
 * Ordered groups of boolean Role fields shown as checkboxes.
 * `billingacl` is excluded here — it is rendered separately by BillingACLSection.
 */
export const PERMISSION_GROUPS: Record<string, RolePermissionField[]> = {
  "Content Management": ["blogaccess", "noticeaccess", "landingpageaccess"],
  "User Features": [
    "achievementaccess",
    "userblogaccess",
    "bulkmailaccess",
    "eventaccess",
    "billingaccess",
  ],
  "System Access": [
    "ecaccess",
    "membersaccess",
    "rolesaccess",
    "statisticsaccess",
    "achievementmanageaccess",
    "standingsaccess",
    "activitylogaccess",
  ],
  "Role Settings": ["isdefaultrole"],
};

// ─── Default role form values ─────────────────────────────────────────────────

export const DEFAULT_ROLE: Omit<Role, "roleid"> = {
  roletitle:              "",
  blogaccess:             false,
  userblogaccess:         false,
  achievementaccess:      false,
  achievementmanageaccess: false,
  billingaccess:          false,
  billingacl:             { ...DEFAULT_BILLING_ACL },
  bulkmailaccess:         false,
  eventaccess:            false,
  ecaccess:               false,
  landingpageaccess:      false,
  membersaccess:          false,
  noticeaccess:           false,
  rolesaccess:            false,
  statisticsaccess:       false,
  standingsaccess:        false,
  activitylogaccess:      false,
  isdefaultrole:          false,
};
