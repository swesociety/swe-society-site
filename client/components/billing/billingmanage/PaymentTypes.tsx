"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { useToast } from "@/components/ui/use-toast";
type PaymentType = {
  payment_typeid: number;
  payment_type: string;
  year: string;
  subtype: string;
  amount: number;
  method: string[];
};

type MethodOption = {
  payment_methodid: number;
  method_name: string;
  transaction_account: string;
  account_holder: string;
};



const PaymentTypeManager: React.FC = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<PaymentType>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [methodsList, setMethodsList] = useState<MethodOption[]>([]);
  const [newPayment, setNewPayment] = useState<Partial<PaymentType>>({
    method: [],
  });
   const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const { toast } = useToast();
  // Fetch payment types
  const fetchPaymentTypes = async () => {
    try {
      const res = await axios.get(`${APIENDPOINTS.billing.getAllPaymentTypes}`, headerConfig());
      const cleanData = res.data.map((item: any) => ({
        payment_typeid: item.payment_typeid,
        payment_type: item.payment_type,
        year: item.year,
        subtype: item.subtype,
        amount: item.amount,
        method: item.method,
      }));
      setPaymentTypes(cleanData);
    } catch (err) {
      console.error("Fetch payment types failed", err);
    }
  };

  const fetchMethods = async () => {
    try {
      const res = await axios.get(`${APIENDPOINTS.billing.getAllMethodTypes}`, headerConfig());
      setMethodsList(res.data);
    } catch (err) {
      console.error("Fetching method list failed", err);
    }
  };

  useEffect(() => {
    fetchPaymentTypes();
    fetchMethods();
  }, []);

  const handleEditChange = (field: keyof PaymentType, value: string | number) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (id: number) => {
    try {
      await axios.put(`${APIENDPOINTS.billing.updatePaymentType}/${id}`, editData, headerConfig());

      setPaymentTypes((prev) =>
        prev.map((item) =>
          item.payment_typeid === id ? { ...item, ...editData } : item
        )
      );

      setEditIndex(null);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${APIENDPOINTS.billing.deletePaymentType}/${id}`, headerConfig());

      setPaymentTypes((prev) => prev.filter((item) => item.payment_typeid !== id));
    } catch (err) {
      toast({ title: "Error", description: "Deleting error.", variant: "destructive" });
      console.error("Delete failed", err);
    }
  };

  const handleAddNew = async () => {
    if (
      !newPayment.payment_type ||
      !newPayment.year ||
      !newPayment.subtype ||
      !newPayment.amount ||
      newPayment.method?.length === 0
    ) {
      alert("All fields are required.");
      return;
    }

    try {
      const res = await axios.post(`${APIENDPOINTS.billing.createPaymentType}`, newPayment, headerConfig());

      setPaymentTypes((prev) => [...prev, res.data]);
      setNewPayment({ method: [] });
      setIsAdding(false);
    } catch (err) {
      console.error("Add new payment failed", err);
    }
  };

  const addMethodToNewPayment = (m: MethodOption) => {
    const methodString = `${m.method_name}- ${m.transaction_account} - ${m.account_holder}`;
    if (!newPayment.method?.includes(methodString)) {
      setNewPayment((prev) => ({
        ...prev,
        method: [...(prev.method || []), methodString],
      }));
    }
  };

    const removeMethodFromNewPayment = (methodString: string) => {
        setNewPayment((prev) => ({
            ...prev,
            method: (prev.method || []).filter((m) => m !== methodString),
        }));
    };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Payment Types</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="bg-gray-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> Add New Method
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-900 p-4 rounded space-y-4 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Payment Type"
              value={newPayment.payment_type || ""}
              onChange={(e) =>
                setNewPayment({ ...newPayment, payment_type: e.target.value })
              }
              className="bg-gray-800 text-white"
            />
            <Input
              placeholder="Batch"
              value={newPayment.year || ""}
              onChange={(e) => setNewPayment({ ...newPayment, year: e.target.value })}
              className="bg-gray-800 text-white"
            />
            <Input
              placeholder="Semester"
              value={newPayment.subtype || ""}
              onChange={(e) => setNewPayment({ ...newPayment, subtype: e.target.value })}
              className="bg-gray-800 text-white"
            />
            <Input
              placeholder="Amount"
              value={newPayment.amount || ""}
              onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
              className="bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Select Methods:</label>
            <select
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
              onChange={(e) => {
                const selectedId = Number(e.target.value);
                const selectedMethod = methodsList.find(
                  (m) => m.payment_methodid === selectedId
                );
                if (selectedMethod) addMethodToNewPayment(selectedMethod);
              }}
              value=""
            >
              <option value="" disabled>
                Select a method...
              </option>
              {methodsList.map((m) => {
                const label = `${m.method_name}- ${m.transaction_account} - ${m.account_holder}`;
                return (
                  <option key={m.payment_methodid} value={m.payment_methodid}>
                    {label} 
                  </option>
                );
              })}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {newPayment.method?.map((m, i) => (
                <Badge key={i} variant="secondary" className="bg-blue-700 text-white">
                    {m}
                    <X
                        size={14}
                        className="text-red-500 cursor-pointer ml-1 align-middle"
                        onClick={() => removeMethodFromNewPayment(m)}
                    />
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button className="bg-red-800 text-white" onClick={handleAddNew}>
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2">Type</th>
              <th className="p-2">Batch</th>
              <th className="p-2">Semester</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Methods</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentTypes.map((item, index) => (
              <tr key={item.payment_typeid} className="border-b border-gray-700">
                {editIndex === index ? (
                  <>
                    <td className="p-2">
                      <Input
                        value={editData.payment_type || ""}
                        onChange={(e) => handleEditChange("payment_type", e.target.value)}
                        className="bg-gray-800 text-white"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={editData.year || ""}
                        onChange={(e) => handleEditChange("year", e.target.value)}
                        className="bg-gray-800 text-white"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={editData.subtype || ""}
                        onChange={(e) => handleEditChange("subtype", e.target.value)}
                        className="bg-gray-800 text-white"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        value={editData.amount || ""}
                        onChange={(e) => handleEditChange("amount", Number(e.target.value))}
                        className="bg-gray-800 text-white"
                      />
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(editData.method as string[] | undefined)?.map((m, i) => (
                          <Badge key={i} className="bg-blue-700 text-white">
                            {m}
                            <X
                              size={14}
                              className="text-red-400 cursor-pointer ml-1 align-middle"
                              onClick={() =>
                                setEditData((prev) => ({
                                  ...prev,
                                  method: (prev.method as string[]).filter((x) => x !== m),
                                }))
                              }
                            />
                          </Badge>
                        ))}
                      </div>
                      <select
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2"
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          const selectedMethod = methodsList.find(
                            (m) => m.payment_methodid === selectedId
                          );
                          if (selectedMethod) {
                            const methodString = `${selectedMethod.method_name}- ${selectedMethod.transaction_account} - ${selectedMethod.account_holder}`;
                            if (
                              !((editData.method as string[] | undefined) || []).includes(methodString)
                            ) {
                              setEditData((prev) => ({
                                ...prev,
                                method: [...((prev.method as string[]) || []), methodString],
                              }));
                            }
                          }
                        }}
                        value=""
                      >
                        <option value="" disabled>
                          Add method...
                        </option>
                        {methodsList.map((m) => {
                          const label = `${m.method_name}- ${m.transaction_account} - ${m.account_holder}`;
                          return (
                            <option key={m.payment_methodid} value={m.payment_methodid}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </td>
                    <td className="p-2 flex gap-2 justify-end">
                      <Check
                        className="text-green-500 cursor-pointer"
                        onClick={() => handleEditSubmit(item.payment_typeid)}
                      />
                      <X
                        className="text-red-500 cursor-pointer"
                        onClick={() => setEditIndex(null)}
                      />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{item.payment_type}</td>
                    <td className="p-2">{item.year}</td>
                    <td className="p-2">{item.subtype}</td>
                    <td className="p-2">{item.amount}</td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {item.method.map((m, i) => (
                          <Badge key={i} className="bg-gray-700 text-white">
                            {m}  
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-2 flex gap-2 justify-end">
                      <Pencil
                        className="cursor-pointer text-gray-400"
                        onClick={() => {
                          setEditIndex(index);
                          setEditData(item);
                        }}
                      />
                      <Trash2
                        className="cursor-pointer text-red-500"
                        onClick={() => setConfirmDeleteId(item.payment_typeid)}
                      />
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
            {confirmDeleteId !== null && (
              <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-lg w-[350px]">
                  <h3 className="text-lg font-bold text-red-600 mb-3">Confirm Deletion</h3>
                  <p className="text-sm mb-4">
                    Are you sure you want to delete this payment? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
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

export default PaymentTypeManager;
