import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BillingACL, Role } from "@/data/types";
import BillingACLSection from "./BillingACLSection";
import PermissionGroup from "./PermissionGroup";
import { PERMISSION_GROUPS } from "./roleConstants";

interface RoleFormProps {
  /** Current form values — billingacl is handled separately from boolean fields. */
  data: Omit<Role, "roleid">;
  /**
   * Called for all flat (boolean/string) field changes.
   * For the nested `billingacl` object, use `onBillingACLChange` instead.
   */
  onChange: (field: keyof Omit<Role, "roleid">, value: any) => void;
  /**
   * Called when any BillingACL flag changes.
   * Receives the full updated BillingACL object.
   */
  onBillingACLChange: (updated: BillingACL) => void;
  /**
   * Unique prefix applied to every checkbox element id in this form.
   * Required to avoid id collisions when both Create and Edit dialogs
   * are mounted in the same React tree.
   */
  idPrefix: string;
}

/**
 * The shared role form body — role title input, all permission groups,
 * and the BillingACL section.
 *
 * Intentionally contains NO dialog chrome (no Dialog, ScrollArea, or buttons).
 * Both RoleCreateDialog and RoleEditDialog compose this into their own shells,
 * keeping dialog structure separate from form logic.
 */
const RoleForm: React.FC<RoleFormProps> = ({
  data,
  onChange,
  onBillingACLChange,
  idPrefix,
}) => (
  <div className="space-y-6">
    {/* ── Role title ──────────────────────────────────────────────── */}
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-roletitle`} className="text-sm font-medium">
        Role Title
      </Label>
      <Input
        id={`${idPrefix}-roletitle`}
        placeholder="Enter role title"
        value={data.roletitle}
        onChange={(e) => onChange("roletitle", e.target.value)}
        className="w-full"
      />
    </div>

    {/* ── Standard boolean permission groups ──────────────────────── */}
    <div className="space-y-6">
      {Object.entries(PERMISSION_GROUPS).map(([groupTitle, fields]) => (
        <PermissionGroup
          key={groupTitle}
          title={groupTitle}
          fields={fields}
          roleData={data}
          onChange={(field, value) => onChange(field, value)}
          idPrefix={idPrefix}
        />
      ))}
    </div>

    {/* ── Billing ACL (nested object — handled separately) ─────────── */}
    <BillingACLSection
      value={data.billingacl}
      onChange={onBillingACLChange}
      idPrefix={idPrefix}
    />
  </div>
);

export default RoleForm;
