import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { useToast } from "@/components/ui/use-toast";
import { headerConfig } from "@/lib/header_config";

type RoleUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userIds: number[];
  onRoleUpdate: (userIds: number[], newRoleId: number) => Promise<boolean>; // Changed to Promise<boolean>
};

export const RoleUpdateDialog: React.FC<RoleUpdateDialogProps> = ({
  open,
  onOpenChange,
  userIds,
  onRoleUpdate,
}) => {
  const [roles, setRoles] = useState<
    { roleid: number; roletitle: string; isdefaultrole: boolean }[]
  >([]);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        APIENDPOINTS.role.getRoleInfo,
        headerConfig()
      );
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast({
        title: "Error fetching roles",
        description: "Please try again later.",
      });
    }
  };

  const handleRoleUpdate = async () => {
    if (!selectedRole) {
      toast({
        title: "No role selected",
        description: "Please select a role to assign.",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedRoleData = roles.find(
        (role) => role.roleid === selectedRole
      );
      if (!selectedRoleData) {
        throw new Error("Selected role not found");
      }

      const success = await onRoleUpdate(userIds, selectedRole);
      if (success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error updating role",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
            value={selectedRole || ""}
            onChange={(e) => setSelectedRole(Number(e.target.value))}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role.roleid} value={role.roleid}>
                {role.roletitle}
                {role.isdefaultrole && " (Default)"}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRoleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
