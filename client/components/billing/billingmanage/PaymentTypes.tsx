"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { SemesterKey } from "./types";
import {
  createPaymentType,
  deletePaymentType,
  getPaymentMethods,
  getPaymentTypes,
  updatePaymentType,
} from "./actions";
import { PaymentTypeDeleteDialog } from "./PaymentTypeDeleteDialog";
import { PaymentTypeForm } from "./PaymentTypeForm";
import { PaymentTypeLoadingState } from "./PaymentTypeLoadingState";
import { PaymentTypeTable } from "./PaymentTypeTable";
import {
  getMethodLabel,
  MethodOption,
  PaymentType,
  SortDirection,
  SortField,
} from "./paymentTypeTypes";

interface PaymentTypeManagerProps {
  canEdit: boolean;
  canDelete: boolean;
}

const PaymentTypeManager: React.FC<PaymentTypeManagerProps> = ({
  canEdit,
  canDelete,
}) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [methodsList, setMethodsList] = useState<MethodOption[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<PaymentType>>({});
  const [newPayment, setNewPayment] = useState<Partial<PaymentType>>({
    method: [],
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBatch, setActiveBatch] = useState("all");
  const { toast } = useToast();

  const fetchPaymentTypes = useCallback(async () => {
    setLoading(true);
    try {
      setPaymentTypes(await getPaymentTypes());
    } catch (error) {
      console.error("Fetch payment types failed", error);
      toast({
        title: "Could not load payment types",
        description: "Please check the backend connection and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchMethods = useCallback(async () => {
    try {
      setMethodsList(await getPaymentMethods());
    } catch (error) {
      console.error("Fetching method list failed", error);
    }
  }, []);

  useEffect(() => {
    fetchPaymentTypes();
    fetchMethods();
  }, [fetchMethods, fetchPaymentTypes]);

  const allBatches = useMemo(
    () =>
      Array.from(new Set(paymentTypes.map((payment) => String(payment.year))))
        .filter(Boolean)
        .sort((first, second) =>
          first.localeCompare(second, undefined, { numeric: true }),
        ),
    [paymentTypes],
  );

  const filteredPaymentTypes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return paymentTypes.filter((payment) => {
      const matchesBatch =
        activeBatch === "all" || String(payment.year) === activeBatch;
      const matchesSearch =
        !query ||
        String(payment.payment_type ?? "")
          .toLowerCase()
          .includes(query);

      return matchesBatch && matchesSearch;
    });
  }, [activeBatch, paymentTypes, searchQuery]);

  const sortedPaymentTypes = useMemo(
    () =>
      [...filteredPaymentTypes].sort((first, second) => {
        if (sortField === "created_at") {
          const firstTime = first.created_at
            ? new Date(first.created_at).getTime()
            : 0;
          const secondTime = second.created_at
            ? new Date(second.created_at).getTime()
            : 0;
          const comparison = firstTime - secondTime;
          return sortDirection === "asc" ? comparison : -comparison;
        }

        const comparison = String(first[sortField] ?? "").localeCompare(
          String(second[sortField] ?? ""),
          undefined,
          { numeric: true, sensitivity: "base" },
        );
        return sortDirection === "asc" ? comparison : -comparison;
      }),
    [filteredPaymentTypes, sortDirection, sortField],
  );

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const handleEdit = (payment: PaymentType) => {
    setEditingId(payment.payment_typeid);
    setEditData(payment);
  };

  const handleEditSubmit = async () => {
    if (editingId === null) return;
    try {
      await updatePaymentType(editingId, editData);
      setPaymentTypes((previous) =>
        previous.map((payment) =>
          payment.payment_typeid === editingId
            ? { ...payment, ...editData }
            : payment,
        ),
      );
      setEditingId(null);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePaymentType(id);
      setPaymentTypes((previous) =>
        previous.filter((payment) => payment.payment_typeid !== id),
      );
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Delete failed", error);
      toast({
        title: "Error",
        description: "Deleting error.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = async () => {
    if (
      !newPayment.payment_type ||
      !newPayment.year ||
      !newPayment.subtype ||
      newPayment.amount === undefined ||
      newPayment.method?.length === 0
    ) {
      alert("All fields are required.");
      return;
    }
    if (!(newPayment.subtype in SemesterKey)) {
      toast({
        title: "Invalid semester",
        description: "Please select a valid semester.",
        variant: "destructive",
      });
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payment = await createPaymentType(newPayment);
      setPaymentTypes((previous) => [...previous, payment]);
      setNewPayment({ method: [] });
      setIsAdding(false);
    } catch (error: any) {
      console.error("Add new payment failed", error);
      toast({
        title: "Could not add payment type",
        description:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMethod = (method: MethodOption) => {
    const label = getMethodLabel(method);
    if (!newPayment.method?.includes(label)) {
      setNewPayment((previous) => ({
        ...previous,
        method: [...(previous.method || []), label],
      }));
    }
  };

  const addEditMethod = (method: MethodOption) => {
    const label = getMethodLabel(method);
    if (!(editData.method || []).includes(label)) {
      setEditData((previous) => ({
        ...previous,
        method: [...(previous.method || []), label],
      }));
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Payment Types</h2>
        {!isAdding && canEdit && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gray-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Method
          </Button>
        )}
      </div>
      {isAdding && (
        <PaymentTypeForm
          payment={newPayment}
          methods={methodsList}
          isSubmitting={isSubmitting}
          onChange={setNewPayment}
          onSubmit={handleAddNew}
          onCancel={() => setIsAdding(false)}
          onRemoveMethod={(method) =>
            setNewPayment((previous) => ({
              ...previous,
              method: (previous.method || []).filter((item) => item !== method),
            }))
          }
          onAddMethod={addMethod}
        />
      )}
      {loading ? (
        <PaymentTypeLoadingState />
      ) : (
        <PaymentTypeTable
          paymentTypes={sortedPaymentTypes}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          allBatches={allBatches}
          activeBatch={activeBatch}
          onBatchChange={setActiveBatch}
          methods={methodsList}
          editingId={editingId}
          editData={editData}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEdit={handleEdit}
          onEditChange={(field, value) =>
            setEditData((previous) => ({ ...previous, [field]: value }))
          }
          onAddEditMethod={addEditMethod}
          onRemoveEditMethod={(method) =>
            setEditData((previous) => ({
              ...previous,
              method: (previous.method || []).filter((item) => item !== method),
            }))
          }
          onSave={handleEditSubmit}
          onCancelEdit={() => setEditingId(null)}
          onDelete={setConfirmDeleteId}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
      <PaymentTypeDeleteDialog
        open={confirmDeleteId !== null}
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId !== null) handleDelete(confirmDeleteId);
        }}
      />
    </div>
  );
};

export default PaymentTypeManager;
