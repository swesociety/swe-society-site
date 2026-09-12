import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BillingACL, Role } from '@/data/types';
import BillingACLSection from '../../../../../components/dashboardpage/roles/BillingACLSection';
import PermissionGroup from '../../../../../components/dashboardpage/roles/PermissionGroup';
import { RolePermissionField } from '../../../../../components/dashboardpage/roles/PermissionGroup';
import { PERMISSION_GROUPS } from '../../../../../components/dashboardpage/roles/roleConstants';

interface RoleFormProps {
  data: Omit<Role, 'roleid'>;
  onChange: (field: keyof Omit<Role, 'roleid'>, value: any) => void;
  onBillingACLChange: (updated: BillingACL) => void;
  idPrefix: string;
  disabledFields?: RolePermissionField[];
  loading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({
  data,
  onChange,
  onBillingACLChange,
  idPrefix,
  disabledFields,
  loading,
}) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor={`${idPrefix}-roletitle`} className="text-sm font-medium">
        Role Title
      </Label>
      <Input
        id={`${idPrefix}-roletitle`}
        placeholder="Enter role title"
        value={data.roletitle}
        onChange={(e) => onChange('roletitle', e.target.value)}
        className="w-full"
        disabled={loading}
      />
    </div>

    <div className="space-y-6">
      {Object.entries(PERMISSION_GROUPS).map(([groupTitle, fields]) => (
        <PermissionGroup
          key={groupTitle}
          title={groupTitle}
          fields={fields}
          roleData={data}
          onChange={(field, value) => onChange(field, value)}
          idPrefix={idPrefix}
          disabledFields={disabledFields}
          disabled={loading}
        />
      ))}
    </div>

    <BillingACLSection
      value={data.billingacl}
      onChange={onBillingACLChange}
      idPrefix={idPrefix}
    />
  </div>
);

export default RoleForm;
