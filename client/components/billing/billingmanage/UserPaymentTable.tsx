"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getUserID } from "@/data/cookies/getCookies";
import { headerConfig } from "@/lib/header_config";
import { APIENDPOINTS } from "@/data/urls";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
type Payment = {
  paymentid: number;
  userid: number;
  payment_typeid: number;
  methodid: number;
  amount: number;
  transaction_id: string;
  transaction_slip: string | null;
  payment_status: boolean;
  created_at: string;
};

const UserPaymentsTable: React.FC = () => {
  const userId = getUserID();
const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [modalSlipUrl, setModalSlipUrl] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `${APIENDPOINTS.billing.getIndiUserPayments}/${userId}`,
        headerConfig()
      );
      setPayments(res.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [userId]);

  const handleDelete = async (paymentId: number) => {
    try {
      await axios.delete(`${APIENDPOINTS.billing.deletePayment}/${paymentId}`, headerConfig());
      setPayments((prev) => prev.filter((p) => p.paymentid !== paymentId));
      setConfirmDeleteId(null);
    } catch (error) {
        toast({ title: "Error", description: "Deleting error.", variant: "destructive" });
      console.error("Error deleting payment:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Your Payments</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-600 text-sm text-left">
          <thead className="bg-gray-900 text-white">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Transaction ID</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Submitted</th>
              <th className="p-2 border">Slip</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No payments found.
                </td>
              </tr>
            ) : (
              payments.map((payment, idx) => (
                <tr key={payment.paymentid} className="border-t">
                  <td className="p-2 border">{idx + 1}</td>
                  <td className="p-2 border">৳ {payment.amount}</td>
                  <td className="p-2 border">{payment.transaction_id}</td>
                  <td className="p-2 border">
                    {payment.payment_status ? (
                      <span className="text-green-500">Accepted</span>
                    ) : (
                      <span className="text-yellow-500">Pending</span>
                    )}
                  </td>
                  <td className="p-2 border">
                    {format(new Date(payment.created_at), "dd/MM/yyyy")}
                  </td>
                  <td className="p-2 border">
                    {payment.transaction_slip ? (
                      <Button
                        variant="outline"
                        className="text-blue-500"
                        onClick={() => setModalSlipUrl(payment.transaction_slip!)}
                      >
                        View
                      </Button>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="p-2 border">
                    {!payment.payment_status && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDeleteId(payment.paymentid)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing slip */}
      {modalSlipUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg max-w-md w-full relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Transaction Slip</h3>
              <button onClick={() => setModalSlipUrl(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={modalSlipUrl}
              alt="Transaction Slip"
              className="rounded border max-h-[500px] mx-auto"
            />
            <div className="mt-4 text-right">
              <Button variant="outline" onClick={() => setModalSlipUrl(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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

export default UserPaymentsTable;
