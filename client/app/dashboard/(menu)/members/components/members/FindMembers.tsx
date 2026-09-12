import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ColumnVisibilityDropdown } from "./ColumnVisibilityDropdown";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { SearchBar } from "./SearchBar";
import { getTableColumns } from "./TableColumns";
import { UserTable } from "./UserTable";
import { RoleUpdateDialog } from "./RoleUpdateDialog";
import { UserDetailsDialog } from "./UserDetailsDialog";
import { EditUserModal } from "./EditUserModal";

import type { MemberDataType } from "@/data/types";

interface FindMemberProps {
  initialMembers?: MemberDataType[];
}

const FindMember: React.FC<FindMemberProps> = ({ initialMembers }) => {
  const {
    data,
    selectedUserIds,
    handleDelete,
    handleSelectUser,
    setSelectedUserIds,
    handleRoleUpdate,
  } = useUsers(initialMembers);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);

  const filteredData = useMemo(
    () =>
      data.filter(
        (user) =>
          user.fullname?.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.regno.includes(search) ||
          user.role.toLowerCase().includes(search.toLowerCase())
      ),
    [data, search]
  );

  const handleSelectAllVisible = (selectAll: boolean) => {
    const visibleRowIds = table
      .getRowModel()
      .rows.map((row) => row.original.userid);
    setSelectedUserIds((prev) =>
      selectAll
        ? Array.from(new Set([...prev, ...visibleRowIds]))
        : prev.filter((id) => !visibleRowIds.includes(id))
    );
  };

  const handleViewDetails = (userId: number) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const handleEditUser = (userId: number) => {
    setEditUserId(userId);
    setShowEditModal(true);
  };

  const columns = getTableColumns(
    selectedUserIds,
    handleSelectUser,
    handleSelectAllVisible,
    handleViewDetails,
    handleEditUser,
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full max-w-screen-xl p-4">
      <div className="flex items-center py-4">
        <SearchBar value={search} onChange={setSearch} />
        <ColumnVisibilityDropdown table={table} />
      </div>

      <UserTable
        table={table}
        selectedUserIds={selectedUserIds}
        onSelectUser={handleSelectUser}
        data={filteredData}
        onSelectAllVisible={handleSelectAllVisible}
      />

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => setShowRoleDialog(true)}
          disabled={!selectedUserIds.length}
        >
          Update Role
        </Button>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          disabled={!selectedUserIds.length}
        >
          Delete Selected
        </Button>
      </div>

      <DeleteConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleDelete}
      />

      <RoleUpdateDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        userIds={selectedUserIds}
        onRoleUpdate={handleRoleUpdate}
      />
      <UserDetailsDialog
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
        userId={selectedUserId}
      />
      <EditUserModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        userId={editUserId}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default FindMember;
