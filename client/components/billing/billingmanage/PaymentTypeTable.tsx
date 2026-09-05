import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaymentTypeSortHeader } from "./PaymentTypeSortHeader";
import { PaymentTypeRow } from "./PaymentTypeRow";
import {
  MethodOption,
  PaymentType,
  SortDirection,
  SortField,
} from "./paymentTypeTypes";

interface PaymentTypeTableProps {
  paymentTypes: PaymentType[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allBatches: string[];
  activeBatch: string;
  onBatchChange: (batch: string) => void;
  methods: MethodOption[];
  editingId: number | null;
  editData: Partial<PaymentType>;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (payment: PaymentType) => void;
  onEditChange: (field: keyof PaymentType, value: string | number) => void;
  onAddEditMethod: (method: MethodOption) => void;
  onRemoveEditMethod: (method: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  onDelete: (id: number) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const PaymentTypeTable: React.FC<PaymentTypeTableProps> = ({
  paymentTypes,
  searchQuery,
  onSearchChange,
  allBatches,
  activeBatch,
  onBatchChange,
  methods,
  editingId,
  editData,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onEditChange,
  onAddEditMethod,
  onRemoveEditMethod,
  onSave,
  onCancelEdit,
  onDelete,
  canEdit,
  canDelete,
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-800 pb-1">
      <button
        type="button"
        onClick={() => onBatchChange("all")}
        className={`whitespace-nowrap rounded-t-lg border-x border-t px-3 py-1.5 text-xs font-semibold transition-all ${
          activeBatch === "all"
            ? "border-gray-700 border-b-2 border-b-emerald-500 bg-gray-800 text-white"
            : "border-transparent bg-gray-900/40 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
        }`}
      >
        All Batches
      </button>
      {allBatches.map((batch) => (
        <button
          type="button"
          key={batch}
          onClick={() => onBatchChange(batch)}
          className={`whitespace-nowrap rounded-t-lg border-x border-t px-3 py-1.5 text-xs font-semibold transition-all ${
            activeBatch === batch
              ? "border-emerald-700/80 border-b-2 border-b-emerald-400 bg-emerald-950/80 text-emerald-300"
              : "border-transparent bg-gray-900/40 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
          }`}
        >
          Batch {batch}
        </button>
      ))}
    </div>
    <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search payment types..."
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-9 border-gray-800 bg-gray-950 pl-9 text-xs focus:border-emerald-500"
        />
      </div>
      <span className="text-xs text-gray-400">
        Showing <strong className="text-white">{paymentTypes.length}</strong>{" "}
        payment types
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2">
              <PaymentTypeSortHeader
                label="Type"
                field="payment_type"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </th>
            <th className="p-2">
              <PaymentTypeSortHeader
                label="Batch"
                field="year"
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={onSort}
              />
            </th>
            <th className="p-2">Semester</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Methods</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paymentTypes.map((payment) => (
            <PaymentTypeRow
              key={payment.payment_typeid}
              payment={payment}
              methods={methods}
              isEditing={editingId === payment.payment_typeid}
              editData={editData}
              onEdit={onEdit}
              onEditChange={onEditChange}
              onAddEditMethod={onAddEditMethod}
              onRemoveEditMethod={onRemoveEditMethod}
              onSave={onSave}
              onCancel={onCancelEdit}
              onDelete={() => onDelete(payment.payment_typeid)}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
