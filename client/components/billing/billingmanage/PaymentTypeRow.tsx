import React from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SemesterKey } from "./types";
import {
  getMethodLabel,
  MethodOption,
  PaymentType,
  PaymentTypeOption,
} from "./paymentTypeTypes";

interface PaymentTypeRowProps {
  payment: PaymentType;
  methods: MethodOption[];
  isEditing: boolean;
  editData: Partial<PaymentType>;
  onEdit: (payment: PaymentType) => void;
  onEditChange: (field: keyof PaymentType, value: string | number) => void;
  onAddEditMethod: (method: MethodOption) => void;
  onRemoveEditMethod: (method: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export const PaymentTypeRow: React.FC<PaymentTypeRowProps> = ({
  payment,
  methods,
  isEditing,
  editData,
  onEdit,
  onEditChange,
  onAddEditMethod,
  onRemoveEditMethod,
  onSave,
  onCancel,
  onDelete,
  canEdit,
  canDelete,
}) => {
  if (!isEditing) {
    return (
      <tr className="border-b border-gray-700">
        <td className="p-2">{payment.payment_type}</td>
        <td className="p-2">{payment.year}</td>
        <td className="p-2">
          {SemesterKey[payment.subtype as keyof typeof SemesterKey] || payment.subtype || "-"}
        </td>
        <td className="p-2">{payment.amount}</td>
        <td className="p-2">
          <div className="flex flex-wrap gap-1">
            {payment.method.map((method) => (
              <Badge key={method} className="bg-gray-700 text-white">
                {method}
              </Badge>
            ))}
          </div>
        </td>
        <td className="flex justify-end gap-2 p-2">
          {canEdit && (
            <Pencil
              className="cursor-pointer text-gray-400"
              onClick={() => onEdit(payment)}
            />
          )}
          {canDelete && (
            <Trash2
              className="cursor-pointer text-red-500"
              onClick={onDelete}
            />
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-700">
      <td className="p-2">
        <select
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
          value={editData.payment_type || ""}
          onChange={(event) => onEditChange("payment_type", event.target.value)}
        >
          {Object.values(PaymentTypeOption).map((paymentType) => (
            <option key={paymentType} value={paymentType}>
              {paymentType}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <Input
          value={editData.year || ""}
          onChange={(event) => onEditChange("year", event.target.value)}
          className="bg-gray-800 text-white"
        />
      </td>
      <td className="p-2">
        <select
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
          value={editData.subtype || ""}
          onChange={(event) => onEditChange("subtype", event.target.value)}
        >
          {Object.entries(SemesterKey).map(([semesterId, semester]) => (
            <option key={semesterId} value={semesterId}>
              {semester}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <Input
          type="number"
          value={editData.amount ?? ""}
          onChange={(event) =>
            onEditChange("amount", Number(event.target.value))
          }
          className="bg-gray-800 text-white"
        />
      </td>
      <td className="p-2">
        <div className="mb-2 flex flex-wrap gap-1">
          {(editData.method || []).map((method) => (
            <Badge key={method} className="bg-blue-700 text-white">
              {method}
              <X
                size={14}
                className="ml-1 cursor-pointer align-middle text-red-400"
                onClick={() => onRemoveEditMethod(method)}
              />
            </Badge>
          ))}
        </div>
        <select
          className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
          value=""
          onChange={(event) => {
            const selectedMethod = methods.find(
              (method) =>
                method.payment_methodid === Number(event.target.value),
            );
            if (selectedMethod) onAddEditMethod(selectedMethod);
          }}
        >
          <option value="" disabled>
            Add method...
          </option>
          {methods.map((method) => (
            <option
              key={method.payment_methodid}
              value={method.payment_methodid}
            >
              {getMethodLabel(method)}
            </option>
          ))}
        </select>
      </td>
      <td className="flex justify-end gap-2 p-2">
        {canEdit && (
          <Check className="cursor-pointer text-green-500" onClick={onSave} />
        )}
        <X className="cursor-pointer text-red-500" onClick={onCancel} />
      </td>
    </tr>
  );
};
