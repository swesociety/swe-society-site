import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MemberDataType } from "@/data/types";
import { ColumnDef } from "@tanstack/react-table";
import { Info } from "lucide-react";

export const getTableColumns = (
  selectedUserIds: number[],
  handleSelectUser: (userId: number, selected: boolean) => void,
  handleSelectAllVisible: (selectAll: boolean) => void,
  onViewDetails: (userId: number) => void
): ColumnDef<MemberDataType>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table
          .getRowModel()
          .rows.every((row) => selectedUserIds.includes(row.original.userid))}
        onCheckedChange={(value: boolean) => handleSelectAllVisible(value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedUserIds.includes(row.original.userid)}
        onCheckedChange={(value: boolean) =>
          handleSelectUser(row.original.userid, value)
        }
      />
    ),
  },
  { accessorKey: "regno", header: "Reg No" },
  { accessorKey: "fullname", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "session", header: "Session" },
  { accessorKey: "role", header: "Role" },
  {
    id: "viewDetails",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onViewDetails(row.original.userid)}
      >
        <Info className="h-4 w-4" />
      </Button>
    ),
  },
];
