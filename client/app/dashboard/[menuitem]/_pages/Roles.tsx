import RoleCreateDialog from "@/components/dashboardpage/roles/RoleCreateDialog";
import RoleEditDialog from "@/components/dashboardpage/roles/RoleEditDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Role } from "@/data/types";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import axios from "axios";
import {
  BadgeCheck,
  Ellipsis,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface RoleData {
  roleid: number;
  roletitle: string;
  isdefaultrole: boolean;
  user_count: string;
}

const Roles: React.FC = () => {
  const { toast } = useToast();
  const [roleList, setRoleList] = useState<RoleData[]>([]);
  const [fetching, setFetching] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editRoleData, setEditRoleData] = useState<Role | null>(null);

  const fetchRole = async () => {
    setFetching(true);
    setError("");
    try {
      const response = await axios.get<RoleData[]>(
        APIENDPOINTS.role.getRoleInfo,
        headerConfig()
      );
      setRoleList(response.data);
    } catch (error) {
      setError("Can't fetch roles. Please try again.");
      console.error("Error fetching roles:", error);
    } finally {
      setFetching(false);
    }
  };

  const deleteRole = async (id: number) => {
    try {
      const response = await axios.delete(
        `${APIENDPOINTS.role.deleteRole}/${id}`,
        headerConfig()
      );
      if (response.status === 204) {
        toast({ title: "Role deleted successfully." });
        fetchRole();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to delete role.";
      toast({ title: errorMsg, variant: "destructive", duration: 3000 });
      console.error("Error deleting role:", error);
    }
  };

  const updateDefaultRole = async (id: number) => {
    try {
      const response = await axios.put(
        `${APIENDPOINTS.role.updateDefaultRole}/${id}`,
        {},
        headerConfig()
      );
      if (response.status === 200) {
        toast({ title: "Default role updated successfully." });
        fetchRole();
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to update default role.";
      toast({ title: errorMsg, variant: "destructive", duration: 3000 });
      console.error("Error updating default role:", error);
    }
  };

  const getRoleById = async (id: number) => {
    try {
      const response = await axios.get<Role>(
        `${APIENDPOINTS.role.getRole}/${id}`,
        headerConfig()
      );
      if (response.status === 200) {
        setEditRoleData(response.data);
        setEditModalOpen(true);
      }
    } catch (error) {
      toast({
        title: "Failed to fetch role details.",
        variant: "destructive",
      });
      console.error("Error fetching role details:", error);
    }
  };

  const handleCreateRole = async (roleData: Omit<Role, "roleid">) => {
    try {
      const response = await axios.post(
        APIENDPOINTS.role.createRole,
        roleData,
        headerConfig()
      );
      if (response.status === 201) {
        toast({ title: "Role created successfully." });
        fetchRole();
        setCreateModalOpen(false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to create role.";
      toast({ title: errorMsg, variant: "destructive", duration: 3000 });
      console.error("Error creating role:", error);
    }
  };

  const handleEditRoleChange = (field: keyof Role, value: any) => {
    if (editRoleData) {
      setEditRoleData({ ...editRoleData, [field]: value });
    }
  };

  const handleEditRoleSubmit = async () => {
    if (!editRoleData) return;
    try {
      const response = await axios.put(
        `${APIENDPOINTS.role.updateRole}/${editRoleData.roleid}`,
        editRoleData,
        headerConfig()
      );
      if (response.status === 200) {
        toast({ title: "Role updated successfully." });
        fetchRole();
        setEditModalOpen(false);
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to update role.";
      toast({
        title: errorMsg,
        variant: "destructive",
        duration: 3000,
      });
      console.error("Error updating role:", error);
    }
  };

  useEffect(() => {
    fetchRole().catch((error) =>
      console.error("Error during role fetch:", error)
    );
  }, []);

  const handleDeleteRole = async (id: number) => {
    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this role?")) {
      await deleteRole(id);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 pt-8 h-screen">
      {fetching ? (
        <div className="flex flex-col items-center space-y-2 pt-16">
          <Loader2 className="animate-spin" size={40} />
          <p>Fetching information....</p>
        </div>
      ) : (
        <>
          <div className="sticky top-0 w-full py-8 px-6 border-b shadow-sm flex justify-between items-center bg-background z-10">
            <h2 className="text-xl font-bold">Roles</h2>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" /> Create Role
            </Button>
          </div>

          {error && (
            <div className="w-full px-6">
              <p className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>
            </div>
          )}

          <div className="w-full px-6 py-4 space-y-4">
            {roleList.length === 0 && !error ? (
              <div className="text-center py-8 text-muted-foreground">
                No roles found. Create a new role to get started.
              </div>
            ) : (
              roleList.map((roleRow) => (
                <div
                  key={roleRow.roleid}
                  className="flex justify-between items-center p-4 border rounded-lg shadow-sm hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-medium">{roleRow.roletitle}</p>
                    {roleRow.roleid === 1 && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                        Super Role
                      </span>
                    )}
                    {roleRow.isdefaultrole && (
                      <span className="px-2 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center text-muted-foreground">
                      <User className="mr-1 h-4 w-4" /> {roleRow.user_count}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          aria-label="Open menu"
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => getRoleById(roleRow.roleid)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        {roleRow.roleid !== 1 && (
                          <>
                            <DropdownMenuItem
                              onClick={() => updateDefaultRole(roleRow.roleid)}
                              className="cursor-pointer"
                            >
                              <BadgeCheck className="mr-2 h-4 w-4" />
                              Set As Default Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteRole(roleRow.roleid)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <RoleEditDialog
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        editRoleData={editRoleData}
        onEditRoleChange={handleEditRoleChange}
        onSubmit={handleEditRoleSubmit}
      />

      <RoleCreateDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateRole}
      />
    </div>
  );
};

export default Roles;
