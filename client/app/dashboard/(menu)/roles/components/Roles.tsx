'use client';
import RoleCreateDialog from '@/components/dashboardpage/roles/RoleCreateDialog';
import RoleEditDialog from '@/components/dashboardpage/roles/RoleEditDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Role } from '@/data/types';
import { getJWT } from '@/data/cookies/getCookies';
import {
  BadgeCheck,
  Ellipsis,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import React, { useTransition, useState } from 'react';
import type { RoleData } from '../types';
import {
  fetchRoles,
  getRoleById,
  createRole,
  updateRole,
  updateDefaultRole,
  deleteRole,
} from '../actions';

type Props = {
  initialRoles: RoleData[];
};

const Roles: React.FC<Props> = ({ initialRoles }) => {
  const { toast } = useToast();
  const [roleList, setRoleList] = useState<RoleData[]>(initialRoles);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editRoleData, setEditRoleData] = useState<Role | null>(null);

  const [loadingFetch, startFetchTransition] = useTransition();
  const [loadingDelete, startDeleteTransition] = useTransition();
  const [loadingDefault, startDefaultTransition] = useTransition();
  const [loadingGetById, startGetByIdTransition] = useTransition();
  const [loadingCreate, startCreateTransition] = useTransition();
  const [loadingEdit, startEditTransition] = useTransition();

  const handleFetchRoles = () => {
    startFetchTransition(async () => {
      setError('');
      setFetching(true);
      const response = await fetchRoles(getJWT() || '');
      setFetching(false);
      if (response?.status === 200 || response?.status === 201) {
        setRoleList(response.data as RoleData[]);
      } else {
        setError("Can't fetch roles. Please try again.");
      }
    });
  };

  const handleDeleteRole = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    startDeleteTransition(async () => {
      const response = await deleteRole(id, getJWT() || '');
      if (response?.status === 204 || response?.status === 200) {
        toast({ title: 'Role deleted successfully.' });
        handleFetchRoles();
      } else {
        const msg =
          (response?.data as { message?: string })?.message ||
          'Failed to delete role.';
        toast({ title: msg, variant: 'destructive', duration: 3000 });
      }
    });
  };

  const handleUpdateDefaultRole = (id: number) => {
    startDefaultTransition(async () => {
      const response = await updateDefaultRole(id, getJWT() || '');
      if (response?.status === 200 || response?.status === 201) {
        toast({ title: 'Default role updated successfully.' });
        handleFetchRoles();
      } else {
        const msg =
          (response?.data as { message?: string })?.message ||
          'Failed to update default role.';
        toast({ title: msg, variant: 'destructive', duration: 3000 });
      }
    });
  };

  const handleGetRoleById = (id: number) => {
    startGetByIdTransition(async () => {
      const response = await getRoleById(id, getJWT() || '');
      if (response?.status === 200) {
        setEditRoleData(response.data as Role);
        setEditModalOpen(true);
      } else {
        toast({
          title: 'Failed to fetch role details.',
          variant: 'destructive',
        });
      }
    });
  };

  const handleCreateRole = (roleData: Omit<Role, 'roleid'>) => {
    startCreateTransition(async () => {
      const response = await createRole(roleData, getJWT() || '');
      if (response?.status === 201 || response?.status === 200) {
        toast({ title: 'Role created successfully.' });
        handleFetchRoles();
        setCreateModalOpen(false);
      } else {
        const msg =
          (response?.data as { message?: string })?.message ||
          'Failed to create role.';
        toast({ title: msg, variant: 'destructive', duration: 3000 });
      }
    });
  };

  const handleEditRoleChange = (field: keyof Role, value: Role[keyof Role]) => {
    if (editRoleData) {
      setEditRoleData({ ...editRoleData, [field]: value });
    }
  };

  const handleEditRoleSubmit = () => {
    if (!editRoleData) return;
    startEditTransition(async () => {
      const response = await updateRole(editRoleData, getJWT() || '');
      if (response?.status === 200 || response?.status === 201) {
        toast({ title: 'Role updated successfully.' });
        handleFetchRoles();
        setEditModalOpen(false);
      } else {
        const msg =
          (response?.data as { message?: string })?.message ||
          'Failed to update role.';
        toast({ title: msg, variant: 'destructive', duration: 3000 });
      }
    });
  };

  const isBusy =
    loadingFetch ||
    loadingDelete ||
    loadingDefault ||
    loadingGetById ||
    loadingCreate ||
    loadingEdit;

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
              disabled={isBusy}
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
                          disabled={isBusy}
                        >
                          <Ellipsis className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleGetRoleById(roleRow.roleid)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        {roleRow.roleid !== 1 && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateDefaultRole(roleRow.roleid)
                              }
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
        loading={loadingEdit}
      />

      <RoleCreateDialog
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateRole}
        loading={loadingCreate}
      />
    </div>
  );
};

export default Roles;
