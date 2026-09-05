"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCheck } from "lucide-react";
import { PaymentStatusData } from "./PaymentStatusModal";

interface PaymentDetailsModalProps {
  modalDetailsData: PaymentStatusData | null;
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  modalDetailsData,
  onClose,
}) => {
  if (!modalDetailsData) return null;

  return (
    <Dialog open={Boolean(modalDetailsData)} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Payment Record Details
          </DialogTitle>
        </DialogHeader>
        <div className="text-xs space-y-2 mt-2 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Registration No:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {modalDetailsData.regno}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Student Name:</span>
            <span className="font-semibold text-white">
              {modalDetailsData.fullname}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Session:</span>
            <span className="text-gray-300">
              {modalDetailsData.session || "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Payment Type:</span>
            <span className="text-indigo-300 font-medium">
              {modalDetailsData.payment_type}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Semester:</span>
            <span className="text-gray-200">{modalDetailsData.subtype}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Amount:</span>
            <span className="font-bold text-white">
              ৳{modalDetailsData.amount}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Method:</span>
            <span className="text-gray-300">
              {modalDetailsData.method_name}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-1.5">
            <span className="text-gray-400">Transaction ID:</span>
            <span className="font-mono text-gray-200">
              {modalDetailsData.transaction_id}
            </span>
          </div>

          {modalDetailsData.transaction_slip && (
            <div className="pt-2">
              <span className="text-gray-400 block mb-1">
                Transaction Slip:
              </span>
              <Image
                src={modalDetailsData.transaction_slip}
                width={400}
                height={400}
                className="rounded-lg border border-gray-800 shadow-lg"
                alt="Slip preview"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
