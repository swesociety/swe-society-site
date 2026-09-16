import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MemberDataType } from '@/data/types';
import { ColumnDef } from '@tanstack/react-table';
import { Info, Pencil } from 'lucide-react';

export const getTableColumns = (
  selectedUserIds: number[],
  handleSelectUser: (userId: number, selected: boolean) => void,
  handleSelectAllVisible: (selectAll: boolean) => void,
  onViewDetails: (userId: number) => void,
  onEditUser: (userId: number) => void,
): ColumnDef<MemberDataType>[] => [
  {
    id: 'select',
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
  { accessorKey: 'regno', header: 'Reg No' },
  { accessorKey: 'fullname', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'session', header: 'Session' },
  { accessorKey: 'role', header: 'Role' },
  {
    id: 'viewDetails',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          title="Edit user"
          onClick={() => onEditUser(row.original.userid)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="View details"
          onClick={() => onViewDetails(row.original.userid)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];
