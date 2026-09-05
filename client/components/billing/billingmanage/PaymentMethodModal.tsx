"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { headerConfig } from "@/lib/header_config";
import { APIENDPOINTS } from "@/data/urls";

type PaymentMethod = {
  payment_methodid: number;
  method_name: string;
  transaction_account: string;
  account_holder: string;
  created_at: string;
};

type Props = {
  onClose: () => void;
  canEdit: boolean;
  canDelete: boolean;
};

const PaymentMethodModal: React.FC<Props> = ({
  onClose,
  canEdit,
  canDelete,
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [newMethod, setNewMethod] = useState<Partial<PaymentMethod> | null>(
    null,
  );
  const [editData, setEditData] = useState<Partial<PaymentMethod>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await axios.get(
          `${APIENDPOINTS.billing.getAllMethodTypes}`,
          headerConfig(),
        );
        setMethods(res.data);
      } catch (error) {
        console.error("Error fetching methods:", error);
      }
    };

    fetchMethods();
  }, []);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditData(methods[index]);
  };

  const handleDelete = async (index: number) => {
    const method = methods[index];
    if (!method) return;
    try {
      await axios.delete(
        `${APIENDPOINTS.billing.deleteMethodType}/${method.payment_methodid}`,
        headerConfig(),
      );
      setMethods((prev) => prev.filter((_, i) => i !== index));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting method:", error);
    }
  };

  const handleEditChange = (field: keyof PaymentMethod, value: string) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (id: number) => {
    try {
      await axios.put(
        `${APIENDPOINTS.billing.updateMethodType}/${id}`,
        editData,
        headerConfig(),
      );
      setMethods((prev) =>
        prev.map((method) =>
          method.payment_methodid === id ? { ...method, ...editData } : method,
        ),
      );
      setEditIndex(null);
    } catch (error) {
      console.error("Error updating method:", error);
    }
  };

  const handleAddNewMethod = async () => {
    if (
      !newMethod?.method_name ||
      !newMethod.transaction_account ||
      !newMethod.account_holder
    ) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await axios.post(
        `${APIENDPOINTS.billing.createMethodType}`,
        newMethod,
        headerConfig(),
      );
      setMethods((prev) => [...prev, res.data]);
      setNewMethod(null);
    } catch (error) {
      console.error("Error adding method:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black text-white p-6 rounded-lg w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 p-1 text-gray-700 w-6 h-6 flex justify-center items-center rounded-full"
          >
            X
          </button>
        </div>

        <div className="overflow-y-scroll max-h-[65vh]">
          <table className="w-full text-left border-collapse border text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-2">Method</th>
                <th className="p-2">Account</th>
                <th className="p-2">Holder</th>
                <th className="p-2">Created</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method, index) => (
                <tr
                  key={method.payment_methodid}
                  className="border-b border-gray-700"
                >
                  {editIndex === index ? (
                    <>
                      <td className="p-2">
                        <Input
                          value={editData.method_name || ""}
                          onChange={(e) =>
                            handleEditChange("method_name", e.target.value)
                          }
                          className="bg-gray-800 text-white"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={editData.transaction_account || ""}
                          onChange={(e) =>
                            handleEditChange(
                              "transaction_account",
                              e.target.value,
                            )
                          }
                          className="bg-gray-800 text-white"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          value={editData.account_holder || ""}
                          onChange={(e) =>
                            handleEditChange("account_holder", e.target.value)
                          }
                          className="bg-gray-800 text-white"
                        />
                      </td>
                      <td className="p-2">
                        {new Date(method.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2 flex gap-2 justify-end">
                        {canEdit && (
                          <Check
                            className="text-green-500 cursor-pointer"
                            onClick={() =>
                              handleEditSubmit(method.payment_methodid)
                            }
                          />
                        )}
                        <X
                          className="text-red-500 cursor-pointer"
                          onClick={() => setEditIndex(null)}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{method.method_name}</td>
                      <td className="p-2">{method.transaction_account}</td>
                      <td className="p-2">{method.account_holder}</td>
                      <td className="p-2">
                        {new Date(method.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2 flex gap-2 justify-end">
                        {canEdit && (
                          <Pencil
                            className="cursor-pointer text-gray-300"
                            onClick={() => handleEdit(index)}
                          />
                        )}
                        {canDelete && (
                          <Trash2
                            className="cursor-pointer text-red-500"
                            onClick={() => setConfirmDeleteId(index)}
                          />
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {newMethod && (
            <div className="mt-4 space-y-2 border-t border-gray-700 pt-4">
              <div className="flex gap-2 p-2">
                <Input
                  placeholder="Method Name"
                  value={newMethod.method_name || ""}
                  onChange={(e) =>
                    setNewMethod({ ...newMethod, method_name: e.target.value })
                  }
                  className="bg-gray-800 text-white"
                />
                <Input
                  placeholder="Account Number"
                  value={newMethod.transaction_account || ""}
                  onChange={(e) =>
                    setNewMethod({
                      ...newMethod,
                      transaction_account: e.target.value,
                    })
                  }
                  className="bg-gray-800 text-white"
                />
                <Input
                  placeholder="Account Holder"
                  value={newMethod.account_holder || ""}
                  onChange={(e) =>
                    setNewMethod({
                      ...newMethod,
                      account_holder: e.target.value,
                    })
                  }
                  className="bg-gray-800 text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="bg-gray-700 text-white border border-gray-500"
                  onClick={() => setNewMethod(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gray-600 text-white"
                  onClick={handleAddNewMethod}
                >
                  Add
                </Button>
              </div>
            </div>
          )}

          {!newMethod && canEdit && (
            <div className="mt-6 flex justify-end">
              <Button
                className="bg-red-900 text-white"
                onClick={() => setNewMethod({})}
              >
                Add New Method
              </Button>
            </div>
          )}
        </div>
      </div>
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-[350px]">
            <h3 className="text-lg font-bold text-red-600 mb-3">
              Confirm Deletion
            </h3>
            <p className="text-sm mb-4">
              Are you sure you want to delete this payment? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(confirmDeleteId)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodModal;
