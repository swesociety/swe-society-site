"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RefreshCw,
  FileCheck2,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface PaymentBatchConfirmModalProps {
  confirmBatchAction: "verify_all" | "accept_all" | null;
  selectedCount: number;
  unverifiedCount: number;
  readyToAcceptCount: number;
  unverifiedInTargetCount: number;
  batchLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const PaymentBatchConfirmModal: React.FC<
  PaymentBatchConfirmModalProps
> = ({
  confirmBatchAction,
  selectedCount,
  unverifiedCount,
  readyToAcceptCount,
  unverifiedInTargetCount,
  batchLoading,
  onClose,
  onConfirm,
}) => {
  if (!confirmBatchAction) return null;

  const isVerify = confirmBatchAction === "verify_all";
  const cannotAccept = !isVerify && unverifiedInTargetCount > 0;
  const isNoWorkToPerform = isVerify
    ? unverifiedCount === 0
    : readyToAcceptCount === 0;

  return (
    <Dialog open={Boolean(confirmBatchAction)} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            {isVerify ? "Bulk Verify Transactions" : "Bulk Accept Payments"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-xs mt-2 bg-gray-900 p-4 rounded-lg border border-gray-800">
          {/* Action description text */}
          {isVerify ? (
            <p className="text-gray-300">
              Are you sure you want to{" "}
              <span className="font-bold text-white">Verify</span>{" "}
              {selectedCount > 0
                ? `the ${unverifiedCount} unverified transaction(s) among your selected records`
                : `all ${unverifiedCount} unverified transaction(s) in view`}
              ?
            </p>
          ) : cannotAccept ? (
            <p className="text-rose-300">
              Cannot accept payments at this time because some transactions have
              not been verified yet.
            </p>
          ) : (
            <p className="text-gray-300">
              Are you sure you want to{" "}
              <span className="font-bold text-white">Accept</span>{" "}
              {selectedCount > 0
                ? `the ${readyToAcceptCount} verified pending payment(s) among your selected records`
                : `all ${readyToAcceptCount} verified pending payment(s) in view`}
              ?
            </p>
          )}

          {/* Warning banner: unverified transactions prevent acceptance */}
          {cannotAccept && (
            <div className="text-[11px] text-rose-300 bg-rose-950/70 p-2.5 rounded border border-rose-800 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">
                  Verification Required:
                </strong>
                <span>
                  {unverifiedInTargetCount} transaction(s) are not verified yet.
                  A payment cannot be accepted until its transaction is verified
                  first. Please verify all transactions before accepting.
                </span>
              </div>
            </div>
          )}

          {/* Warning banner: no transactions to process */}
          {isNoWorkToPerform && !cannotAccept && (
            <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded border border-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {isVerify
                  ? "All transactions in the current scope are already verified."
                  : "All transactions in the current scope are already accepted or none are verified and pending."}
              </span>
            </div>
          )}

          {/* Preservation notice */}
          {!cannotAccept && !isNoWorkToPerform && (
            <p className="text-[11px] text-gray-400">
              Note: Transactions that are already{" "}
              {isVerify ? "verified" : "accepted"} will not be modified.
            </p>
          )}
        </div>

        <div className="flex justify-center gap-2 pt-2 border-t border-gray-800">
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={batchLoading || cannotAccept || isNoWorkToPerform}
            className={
              isVerify
                ? "bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {batchLoading ? (
              <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : isVerify ? (
              <FileCheck2 className="w-3.5 h-3.5 mr-1" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 mr-1" />
            )}
            Confirm & Execute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
