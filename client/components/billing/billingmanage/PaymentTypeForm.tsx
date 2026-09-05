import React from "react";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SemesterKey } from "./types";
import {
  getMethodLabel,
  MethodOption,
  PaymentType,
  PaymentTypeOption,
} from "./paymentTypeTypes";

interface PaymentTypeFormProps {
  payment: Partial<PaymentType>;
  methods: MethodOption[];
  isSubmitting: boolean;
  onChange: (payment: Partial<PaymentType>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onRemoveMethod: (method: string) => void;
  onAddMethod: (method: MethodOption) => void;
}

export const PaymentTypeForm: React.FC<PaymentTypeFormProps> = ({
  payment,
  methods,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
  onRemoveMethod,
  onAddMethod,
}) => (
  <div className="space-y-4 rounded border border-gray-700 bg-gray-900 p-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <select
        className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
        value={payment.payment_type || ""}
        onChange={(event) =>
          onChange({ ...payment, payment_type: event.target.value })
        }
      >
        <option value="" disabled>
          Select payment type
        </option>
        {Object.values(PaymentTypeOption).map((paymentType) => (
          <option key={paymentType} value={paymentType}>
            {paymentType}
          </option>
        ))}
      </select>
      <Input
        placeholder="Batch"
        value={payment.year || ""}
        onChange={(event) => onChange({ ...payment, year: event.target.value })}
        className="bg-gray-800 text-white"
      />
      <select
        className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
        value={payment.subtype || ""}
        onChange={(event) =>
          onChange({ ...payment, subtype: event.target.value })
        }
      >
        <option value="" disabled>
          Select semester
        </option>
        {Object.entries(SemesterKey).map(([semesterId, semester]) => (
          <option key={semesterId} value={semesterId}>
            {semester}
          </option>
        ))}
      </select>
      <Input
        type="number"
        placeholder="Amount"
        value={payment.amount ?? ""}
        onChange={(event) =>
          onChange({ ...payment, amount: Number(event.target.value) })
        }
        className="bg-gray-800 text-white"
      />
    </div>

    <div>
      <label className="mb-1 block font-medium">Select Methods:</label>
      <select
        className="w-full rounded border border-gray-700 bg-gray-800 p-2 text-white"
        value=""
        onChange={(event) => {
          const selectedMethod = methods.find(
            (method) => method.payment_methodid === Number(event.target.value),
          );
          if (selectedMethod) onAddMethod(selectedMethod);
        }}
      >
        <option value="" disabled>
          Select a method...
        </option>
        {methods.map((method) => (
          <option key={method.payment_methodid} value={method.payment_methodid}>
            {getMethodLabel(method)}
          </option>
        ))}
      </select>
      <div className="mt-2 flex flex-wrap gap-2">
        {payment.method?.map((method) => (
          <Badge
            key={method}
            variant="secondary"
            className="bg-blue-700 text-white"
          >
            {method}
            <X
              size={14}
              className="ml-1 cursor-pointer align-middle text-red-500"
              onClick={() => onRemoveMethod(method)}
            />
          </Badge>
        ))}
      </div>
    </div>

    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        className="bg-red-800 text-white"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          "Add"
        )}
      </Button>
    </div>
  </div>
);
