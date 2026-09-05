import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BillingACL, Role } from "@/data/types";
import { useState } from "react";
import RoleForm from "./RoleForm";
import { DEFAULT_ROLE } from "./roleConstants";

interface RoleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (roleData: Omit<Role, "roleid">) => void;
}

/**
 * Dialog shell for creating a new role.
 * Owns local form state and resets it after submission.
 * Delegates all form rendering to RoleForm.
 */
const RoleCreateDialog: React.FC<RoleCreateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [roleData, setRoleData] = useState<Omit<Role, "roleid">>(DEFAULT_ROLE);

  const handleChange = (field: keyof Omit<Role, "roleid">, value: any) => {
    setRoleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBillingACLChange = (updated: BillingACL) => {
    setRoleData((prev) => ({ ...prev, billingacl: updated }));
  };

  const handleSubmit = () => {
    onSubmit(roleData);
    setRoleData(DEFAULT_ROLE); // reset for next use
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <div className="flex-none">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Create Role</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the role details and set permissions below.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            <RoleForm
              data={roleData}
              onChange={handleChange}
              onBillingACLChange={handleBillingACLChange}
              idPrefix="create"
            />
          </div>
        </ScrollArea>

        <div className="flex-none mt-auto border-t bg-background p-6">
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Role</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleCreateDialog;
