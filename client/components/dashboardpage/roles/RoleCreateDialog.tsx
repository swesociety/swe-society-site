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
import { useState } from "react";

interface RoleCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (roleData: Omit<Role, "roleid">) => void;
}

const defaultRole: Omit<Role, "roleid"> = {
  roletitle: "",
  blogaccess: false,
  userblogaccess: false,
  achievementaccess: false,
  achievementmanageaccess: false,
  billingaccess: false,
  billingmanageaccess: false,
  bulkmailaccess: false,
  eventaccess: false,
  ecaccess: false,
  landingpageaccess: false,
  membersaccess: false,
  noticeaccess: false,
  rolesaccess: false,
  statisticsaccess: false,
  isdefaultrole: false,
};

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

const RoleCreateDialog: React.FC<RoleCreateDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [roleData, setRoleData] = useState<Omit<Role, "roleid">>(defaultRole);

  const handleChange = (field: keyof Omit<Role, "roleid">, value: any) => {
    setRoleData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(roleData);
    setRoleData(defaultRole);
  };

  const permissionGroups: Record<string, (keyof Omit<Role, "roleid">)[]> = {
    "Content Management": ["blogaccess", "noticeaccess", "landingpageaccess"],
    "User Features": ["achievementaccess", "bulkmailaccess", "eventaccess", "userblogaccess", "billingaccess"],
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
        <div className="flex-none">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold">
              Create Role
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fill in the role details and set permissions below.
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
                value={roleData.roletitle}
                onChange={(e) => handleChange("roletitle", e.target.value)}
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
                      {permissions.map((key) => (
                        <div
                          key={key}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Checkbox
                            id={key}
                            checked={roleData[key] as boolean}
                            onCheckedChange={(checked) =>
                              handleChange(key, checked)
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
                      ))}
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
            <Button onClick={handleSubmit}>Create Role</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleCreateDialog;
