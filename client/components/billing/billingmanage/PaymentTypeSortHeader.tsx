import React from "react";
import { ArrowDownAZ, ArrowUpAZ, ArrowUpDown } from "lucide-react";
import { SortDirection, SortField } from "./paymentTypeTypes";

interface PaymentTypeSortHeaderProps {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export const PaymentTypeSortHeader: React.FC<PaymentTypeSortHeaderProps> = ({
  label,
  field,
  sortField,
  sortDirection,
  onSort,
}) => {
  const isActive = sortField === field;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium hover:text-white"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        sortDirection === "asc" ? (
          <ArrowDownAZ className="h-4 w-4" />
        ) : (
          <ArrowUpAZ className="h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 opacity-60" />
      )}
    </button>
  );
};
