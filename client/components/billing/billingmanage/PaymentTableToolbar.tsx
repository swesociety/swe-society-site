"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, FileCheck2, UserCheck, ShieldCheck } from "lucide-react";

interface PaymentTableToolbarProps {
  canVerifyTransaction: boolean;
  canAcceptTransaction: boolean;
  selectedCount: number;
  unverifiedCount: number;
  readyToAcceptCount: number;
  unverifiedInTargetCount: number;
  loading: boolean;
  batchLoading: boolean;
  onFetchData: () => void;
  onOpenBatchConfirm: (action: "verify_all" | "accept_all") => void;
}

export const PaymentTableToolbar: React.FC<PaymentTableToolbarProps> = ({
  canVerifyTransaction,
  canAcceptTransaction,
  selectedCount,
  unverifiedCount,
  readyToAcceptCount,
  unverifiedInTargetCount,
  loading,
  batchLoading,
  onFetchData,
  onOpenBatchConfirm,
}) => {
  const isAcceptDisabled =
    loading ||
    batchLoading ||
    (readyToAcceptCount === 0 && unverifiedInTargetCount === 0);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        All Payments Table
      </h2>
      <div className="flex items-center gap-2 flex-wrap">
        {canVerifyTransaction && (
          <Button
            size="sm"
            onClick={() => onOpenBatchConfirm("verify_all")}
            disabled={loading || batchLoading || unverifiedCount === 0}
            className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              unverifiedCount === 0
                ? "No unverified transactions to verify"
                : "Verify unverified transactions in bulk"
            }
          >
            <FileCheck2 className="w-3.5 h-3.5 mr-1 text-emerald-300" />
            {selectedCount > 0
              ? `Verify Selected (${unverifiedCount})`
              : `Verify All (${unverifiedCount})`}
          </Button>
        )}

        {canAcceptTransaction && (
          <Button
            size="sm"
            onClick={() => onOpenBatchConfirm("accept_all")}
            disabled={isAcceptDisabled}
            className="bg-indigo-800 hover:bg-indigo-700 text-white text-xs font-medium border border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              unverifiedInTargetCount > 0
                ? `${unverifiedInTargetCount} transaction(s) must be verified first before acceptance`
                : readyToAcceptCount === 0
                  ? "No verified pending payments to accept"
                  : "Accept verified payments in bulk"
            }
          >
            <UserCheck className="w-3.5 h-3.5 mr-1 text-indigo-300" />
            {selectedCount > 0
              ? `Accept Selected (${readyToAcceptCount})`
              : `Accept All (${readyToAcceptCount})`}
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onFetchData}
          disabled={loading || batchLoading}
          className="border-gray-800 text-xs text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 mr-1 ${
              loading || batchLoading ? "animate-spin" : ""
            }`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
};
