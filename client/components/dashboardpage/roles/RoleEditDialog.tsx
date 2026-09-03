import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Role } from "@/data/types";

const formatLabel = (key: string): string => {
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

interface RoleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editRoleData: Role | null;
  onEditRoleChange: (field: keyof Role, value: any) => void;
  onSubmit: () => void;
}

const RoleEditDialog: React.FC<RoleEditDialogProps> = ({
  open,
  onOpenChange,
  editRoleData,
  onEditRoleChange,
  onSubmit,
}) => {
  const permissionGroups: Record<string, (keyof Role)[]> = {
    "Content Management": ["blogaccess", "noticeaccess", "landingpageaccess"],
    "User Features": ["achievementaccess",  "userblogaccess", "bulkmailaccess", "eventaccess", "billingaccess"],
    "System Access": [
      "ecaccess",
      "membersaccess",
      "rolesaccess",
      "statisticsaccess",
      "achievementmanageaccess",
      "billingmanageaccess"
    ],
    "Role Settings": ["isdefaultrole"],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 gap-0 flex flex-col">
        {editRoleData && (
          <>
            <div className="flex-none">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-2xl font-bold">
                  Edit Role
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Update the role details and permissions below.
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="roleTitle" className="text-sm font-medium">
                    Role Title
                  </Label>
                  <Input
                    id="roleTitle"
                    placeholder="Enter role title"
                    value={editRoleData.roletitle}
                    onChange={(e) =>
                      onEditRoleChange("roletitle", e.target.value)
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-6">
                  {Object.entries(permissionGroups).map(
                    ([groupName, permissions]) => (
                      <div key={groupName} className="space-y-3">
                        <h3 className="text-lg font-semibold text-primary">
                          {groupName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2">
                          {permissions.map(
                            (key) =>
                              key in editRoleData && (
                                <div
                                  key={key}
                                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                                >
                                  <Checkbox
                                    id={key}
                                    checked={editRoleData[key] as boolean}
                                    onCheckedChange={(checked) =>
                                      onEditRoleChange(key, checked)
                                    }
                                    className="h-5 w-5"
                                  />
                                  <Label
                                    htmlFor={key}
                                    className="text-sm cursor-pointer"
                                  >
                                    
                                     {formatLabel(key)} 
                                  </Label>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoleEditDialog;
