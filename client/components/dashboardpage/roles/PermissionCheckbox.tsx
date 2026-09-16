import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatLabel } from "./roleConstants";

interface PermissionCheckboxProps {
  /** Unique id used for the checkbox input and its label. */
  id: string;
  /** Field key — used for auto-generating a label when `label` is not provided. */
  fieldKey: string;
  /** Explicit label text. Falls back to `formatLabel(fieldKey)` if omitted. */
  label?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * A single permission row: checkbox + label, with hover highlight.
 * Used inside PermissionGroup and BillingACLSection.
 */
const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  id,
  fieldKey,
  label,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(val) => onCheckedChange(val as boolean)}
      className="h-5 w-5"
      disabled={disabled}
    />
    <Label htmlFor={id} className="text-sm cursor-pointer">
      {label ?? formatLabel(fieldKey)}
    </Label>
  </div>
);

export default PermissionCheckbox;
