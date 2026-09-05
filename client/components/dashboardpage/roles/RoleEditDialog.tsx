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
import RoleForm from "./RoleForm";

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRoleData: Role | null;
  onEditRoleChange: (field: keyof Role, value: any) => void;
  onSubmit: () => void;
}

/**
 * Dialog shell for editing an existing role.
 * Delegates all form rendering to RoleForm — this component only
 * owns the dialog chrome (title, scroll area, footer buttons).
 */
const RoleEditDialog: React.FC<RoleEditDialogProps> = ({
  open,
  onOpenChange,
  editRoleData,
  onEditRoleChange,
  onSubmit,
}) => {
  if (!editRoleData) return null;

  const handleBillingACLChange = (updated: BillingACL) => {
    onEditRoleChange("billingacl", updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        <div className="flex-none">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Edit Role</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update the role details and permissions below.
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6">
            <RoleForm
              data={editRoleData}
              onChange={onEditRoleChange}
              onBillingACLChange={handleBillingACLChange}
              idPrefix="edit"
            />
          </div>
        </ScrollArea>

        <div className="flex-none mt-auto border-t bg-background p-6">
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSubmit}>Save Changes</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditDialog;
