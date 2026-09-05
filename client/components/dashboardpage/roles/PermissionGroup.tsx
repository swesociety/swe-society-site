import { Role } from "@/data/types";
import PermissionCheckbox from "./PermissionCheckbox";

export type RolePermissionField = {
  [K in keyof Role]: Role[K] extends boolean ? K : never;
}[keyof Role];

interface PermissionGroupProps {
  /** Section heading shown above the checkbox grid. */
  title: string;
  /** List of Role field keys to render as checkboxes. */
  fields: RolePermissionField[];
  /** Current role data — used to read checked state. */
  roleData: Partial<Omit<Role, "roleid">>;
  /** Called when any checkbox in the group changes. */
  onChange: (field: RolePermissionField, value: boolean) => void;
  /**
   * Prefix for each checkbox element id — must be unique per form instance
   * to avoid id collisions when multiple dialogs are mounted simultaneously.
   */
  idPrefix: string;
}

/**
 * A labelled group of permission checkboxes laid out in a responsive 2-column grid.
 * Only renders fields that exist as keys on `roleData` (guards against stale field lists).
 */
const PermissionGroup: React.FC<PermissionGroupProps> = ({
  title,
  fields,
  roleData,
  onChange,
  idPrefix,
}) => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-primary">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2">
      {fields.map((key) => {
        // Skip fields that don't exist on the current role data (type safety guard)
        if (!(key in roleData)) return null;

        return (
          <PermissionCheckbox
            key={key}
            id={`${idPrefix}-${key}`}
            fieldKey={key}
            checked={roleData[key] ?? false}
            onCheckedChange={(checked) => onChange(key, checked)}
          />
        );
      })}
    </div>
  </div>
);

export default PermissionGroup;
