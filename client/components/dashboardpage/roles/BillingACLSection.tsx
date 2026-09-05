import { BillingACL } from "@/data/types";
import {
  BILLING_ACL_FIELDS,
  BILLING_ACL_LABELS,
  DEFAULT_BILLING_ACL,
} from "./roleConstants";
import PermissionCheckbox from "./PermissionCheckbox";

interface BillingACLSectionProps {
  /** Current BillingACL values. Safely falls back to all-false if undefined. */
  value: BillingACL | undefined;
  /** Called with the full updated BillingACL object on any toggle. */
  onChange: (updated: BillingACL) => void;
  /** Prefix for checkbox element IDs — must be unique per form instance. */
  idPrefix: string;
}

/**
 * A self-contained section that renders all five BillingACL permission toggles
 * inside a bordered, lightly-shaded card.
 *
 * Kept separate from the generic PermissionGroup because:
 * - BillingACL is a nested object, not a flat boolean field on Role
 * - It has its own header copy and visual treatment
 * - It can be dropped into any form that needs billing ACL management
 */
/** Safely extracts ACL boolean values whether keys are camelCase or lowercase. */
const normalizeBillingACL = (raw: any): Omit<BillingACL, "billingaclid"> => {
  if (!raw) return DEFAULT_BILLING_ACL;
  return {
    hasBillingAccess: Boolean(
      raw.hasBillingAccess ?? raw.hasbillingaccess ?? false,
    ),
    canVerifyTransaction: Boolean(
      raw.canVerifyTransaction ?? raw.canverifytransaction ?? false,
    ),
    canAcceptTransaction: Boolean(
      raw.canAcceptTransaction ?? raw.canaccepttransaction ?? false,
    ),
    canAddTransaction: Boolean(
      raw.canAddTransaction ?? raw.canaddtransaction ?? false,
    ),
    canDeleteTransaction: Boolean(
      raw.canDeleteTransaction ?? raw.candeletetransaction ?? false,
    ),
    canViewPaymentMethod: Boolean(
      raw.canViewPaymentMethod ?? raw.canviewpaymentmethod ?? false,
    ),
    canEditPaymentMethod: Boolean(
      raw.canEditPaymentMethod ?? raw.caneditpaymentmethod ?? false,
    ),
    canDeletePaymentMethod: Boolean(
      raw.canDeletePaymentMethod ?? raw.candeletepaymentmethod ?? false,
    ),
    canViewPaymentType: Boolean(
      raw.canViewPaymentType ?? raw.canviewpaymenttype ?? false,
    ),
    canEditPaymentType: Boolean(
      raw.canEditPaymentType ?? raw.caneditpaymenttype ?? false,
    ),
    canDeletePaymentType: Boolean(
      raw.canDeletePaymentType ?? raw.candeletepaymenttype ?? false,
    ),
  };
};

const BillingACLSection: React.FC<BillingACLSectionProps> = ({
  value,
  onChange,
  idPrefix,
}) => {
  const acl = normalizeBillingACL(value);

  const handleToggle = (
    field: keyof Omit<BillingACL, "billingaclid">,
    checked: boolean,
  ) => {
    onChange({
      ...(value?.billingaclid ? { billingaclid: value.billingaclid } : {}),
      ...acl,
      [field]: checked,
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-primary">Billing ACL</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fine-grained billing transaction permissions for this role.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border rounded-lg p-4 bg-muted/30">
        {BILLING_ACL_FIELDS.map((field) => (
          <PermissionCheckbox
            key={field}
            id={`${idPrefix}-acl-${field}`}
            fieldKey={field}
            label={BILLING_ACL_LABELS[field]}
            checked={acl[field]}
            onCheckedChange={(checked) => handleToggle(field, checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default BillingACLSection;
