import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { headerConfig } from '@/lib/header_config';
import { getRoles } from '../../actions';

type Role = {
  roleid: number;
  roletitle: string;
  isdefaultrole: boolean;
};

type RoleUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: number[];
  onRoleUpdate: (userIds: number[], newRoleId: number) => Promise<boolean>;
};

export const RoleUpdateDialog: React.FC<RoleUpdateDialogProps> = ({
  open,
  onOpenChange,
  userIds,
  onRoleUpdate,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, startTransition] = useTransition();
  const { toast } = useToast();
  const isLoading = loading || isTransitioning;

  const fetchRoles = () => {
    startTransition(async () => {
      const response = await getRoles(headerConfig());
      if (response.status === 200) {
        setRoles(response.data as Role[]);
      } else {
        toast({
          title: 'Error fetching roles',
          description: 'Please try again later.',
        });
      }
    });
  };

  const handleRoleUpdate = () => {
    if (!selectedRole) {
      toast({
        title: 'No role selected',
        description: 'Please select a role to assign.',
      });
      return;
    }

    startTransition(async () => {
      setLoading(true);
      try {
        if (!roles.some((role) => role.roleid === selectedRole)) {
          throw new Error('Selected role not found');
        }

        const success = await onRoleUpdate(userIds, selectedRole);
        if (success) onOpenChange(false);
      } catch (error) {
        console.error('Error updating role:', error);
        toast({
          title: 'Error updating role',
          description: 'Something went wrong. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    if (open) {
      fetchRoles();
      setSelectedRole(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Update Role</DialogTitle>
        <div className="space-y-4">
          <label htmlFor="role-select" className="block text-sm font-medium">
            Select Role
          </label>
          <select
            id="role-select"
            className="w-full border rounded-md p-2"
            value={selectedRole || ''}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.roleid} value={role.roleid}>
                {role.roletitle}
                {role.isdefaultrole && ' (Default)'}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleRoleUpdate} disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
