import React from "react";
import { Button } from "@/components/ui/button";

interface PaymentTypeDeleteDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PaymentTypeDeleteDialog: React.FC<
  PaymentTypeDeleteDialogProps
> = ({ open, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[350px] rounded-lg bg-white p-6 dark:bg-gray-900">
        <h3 className="mb-3 text-lg font-bold text-red-600">
          Confirm Deletion
        </h3>
        <p className="mb-4 text-sm">
          Are you sure you want to delete this payment? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
