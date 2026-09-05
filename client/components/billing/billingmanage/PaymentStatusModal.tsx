"use client";

import React, { useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { useToast } from "@/components/ui/use-toast";
import { FileCheck2, ShieldCheck, UserCheck, AlertTriangle } from "lucide-react";
import type { CommitteeMembership } from "./types";
import type { AdminProfileInfo } from "./AdminProfileDialog";

export interface PaymentStatusData {
  paymentid: number;
  fullname: string;
  regno: string;
  session?: string;
  payment_type: string;
  subtype: string;
  amount: number;
  transaction_id: string;
  method_name?: string | null;
  transaction_slip?: string | null;
  transaction_verified: boolean;
  payment_status: boolean;
  verifier_name?: string | null;
  verifier_regno?: string | null;
  verifier_profile_picture?: string | null;
  verifier_role?: string | null;
  verifier_committee_memberships?: CommitteeMembership[];
  accepter_name?: string | null;
  accepter_regno?: string | null;
  accepter_profile_picture?: string | null;
  accepter_role?: string | null;
  accepter_committee_memberships?: CommitteeMembership[];
}

interface PaymentStatusModalProps {
  payment: PaymentStatusData | null;
  open: boolean;
  canVerifyTransaction: boolean;
  canAcceptTransaction: boolean;
  onClose: () => void;
  onUpdated: (updatedPayment: PaymentStatusData) => void;
  onSelectAdminProfile?: (info: AdminProfileInfo) => void;
}

export const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  payment,
  open,
  canVerifyTransaction,
  canAcceptTransaction,
  onClose,
  onUpdated,
  onSelectAdminProfile,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!payment) return null;

  const isTxVerified = Boolean(payment.transaction_verified);
  const isPaymentAccepted = Boolean(payment.payment_status);

  const handleUpdateStatus = async (changes: {
    transaction_verified?: boolean;
    payment_status?: boolean;
  }) => {
    const isVerificationUpdate =
      changes.transaction_verified !== undefined &&
      changes.transaction_verified !== isTxVerified;
    const isAcceptanceUpdate =
      changes.payment_status !== undefined &&
      changes.payment_status !== isPaymentAccepted;

    if (isVerificationUpdate && !canVerifyTransaction) {
      toast({
        title: "Permission Denied",
        description: "Your assigned role cannot verify transactions.",
        variant: "destructive",
      });
      return;
    }

    if (isAcceptanceUpdate && !canAcceptTransaction) {
      toast({
        title: "Permission Denied",
        description: "Your assigned role cannot accept payments.",
        variant: "destructive",
      });
      return;
    }

    // Client-side guard: Cannot accept payment if Tx is unverified
    if (changes.payment_status && !isTxVerified && !changes.transaction_verified) {
      toast({
        title: "Verification Required",
        description:
          "Transaction is not verified. Please verify the transaction before accepting payment.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put<PaymentStatusData>(
        `${APIENDPOINTS.billing.updatePayment}/${payment.paymentid}`,
        changes,
        headerConfig(),
      );

      onUpdated(response.data);
      toast({
        title: "Payment Status Updated",
        description: `${payment.fullname} (${payment.subtype}): Step 1 ${
          response.data.transaction_verified ? "Verified" : "Unverified"
        }, Step 2 ${response.data.payment_status ? "Accepted" : "Pending"}. Society fee synced.`,
      });
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        "Unable to update payment verification status.";
      toast({
        title: "Status Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Payment Verification & Acceptance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm mt-2">
          {/* Payment & Student Details */}
          <div className="rounded-lg bg-gray-900 p-3.5 space-y-2 border border-gray-800">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Student Name:</span>
              <span className="font-semibold text-white">{payment.fullname}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Registration No:</span>
              <span className="font-mono text-emerald-400">{payment.regno}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Payment Type:</span>
              <span className="font-medium text-indigo-300">
                {payment.payment_type} ({payment.subtype})
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Amount:</span>
              <span className="font-bold text-white">৳{payment.amount}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Transaction ID:</span>
              <span className="font-mono text-gray-200">{payment.transaction_id}</span>
            </div>
            {payment.transaction_slip && (
              <a
                href={payment.transaction_slip}
                target="_blank"
                rel="noreferrer"
                className="block text-emerald-400 underline underline-offset-2 text-xs"
              >
                View transaction slip
              </a>
            )}

            {/* Badges for Verifier & Accepter */}
            <div className="space-y-2 pt-1">
              <div className="flex w-full justify-between items-center text-xs">
                {isTxVerified ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (payment.verifier_name && onSelectAdminProfile) {
                        onSelectAdminProfile({
                          fullname: payment.verifier_name,
                          regno: payment.verifier_regno || "N/A",
                          profile_picture: payment.verifier_profile_picture,
                          role: payment.verifier_role,
                          committee_memberships: payment.verifier_committee_memberships,
                          actionTitle: "Verified Transaction By",
                        });
                      }
                    }}
                    className="hover:opacity-80 w-full text-left transition-opacity cursor-pointer"
                  >
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800">
                      <FileCheck2 className="w-3 h-3 mr-1 text-emerald-400" />
                      Tx Verified by {payment.verifier_name || "Admin"}
                    </Badge>
                  </button>
                ) : (
                  <>
                    <span className="text-gray-400">Verification Status</span>
                    <Badge className="bg-rose-950 text-rose-300 border-rose-900">
                      Unverified ❌
                    </Badge>
                  </>
                )}
              </div>

              <div className="flex justify-between items-center text-xs">
                {isPaymentAccepted ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (payment.accepter_name && onSelectAdminProfile) {
                        onSelectAdminProfile({
                          fullname: payment.accepter_name,
                          regno: payment.accepter_regno || "N/A",
                          profile_picture: payment.accepter_profile_picture,
                          role: payment.accepter_role,
                          committee_memberships: payment.accepter_committee_memberships,
                          actionTitle: "Accepted Payment By",
                        });
                      }
                    }}
                    className="hover:opacity-80 w-full text-left transition-opacity cursor-pointer"
                  >
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800">
                      <UserCheck className="w-3 h-3 mr-1 text-emerald-400" />
                      Accepted by {payment.accepter_name || "Admin"}
                    </Badge>
                  </button>
                ) : (
                  <>
                    <span className="text-gray-400">Payment Status</span>
                    <Badge className="bg-amber-950 text-amber-300 border-amber-800">
                      Pending ⏳
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Warning Banner if Unverified */}
          {!isTxVerified && (
            <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-lg border border-amber-800/80 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Required:</strong> Payment cannot be accepted until transaction is verified.
              </span>
            </div>
          )}
        </div>

        {/* Modal Controls */}
        <div className="flex flex-col w-full gap-3 mt-4 pt-3 border-t border-gray-800">
          {!isPaymentAccepted && canVerifyTransaction && (
            <div className="flex items-center justify-between gap-2 bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-200">
                  Step 1: Transaction Verification
                </span>
                <span className="text-[10px] text-gray-400">
                  Verify proof of transaction / mobile banking ID
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  handleUpdateStatus({
                    transaction_verified: !isTxVerified,
                  })
                }
                disabled={loading}
                className={
                  isTxVerified
                    ? "border-amber-800 text-amber-300 hover:bg-amber-950 text-xs"
                    : "border-emerald-700 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900 text-xs"
                }
              >
                {isTxVerified ? "Unverify Tx" : "Verify Tx"}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
            {!isPaymentAccepted && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-200">
                  Step 2: Payment Acceptance
                </span>
                <span className="text-[10px] text-gray-400">
                  Mark payment as accepted & sync fee tables
                </span>
              </div>
            )}

            {isPaymentAccepted ? (
              <div className="flex items-center w-full justify-between gap-2">
                <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-xs font-semibold py-1 px-2.5">
                  Payment Accepted ✓
                </Badge>
                {canAcceptTransaction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleUpdateStatus({ payment_status: false })
                    }
                    disabled={loading}
                    className="border-amber-800 flex justify-self-end text-amber-300 hover:bg-amber-950 text-xs"
                  >
                    Set Pending
                  </Button>
                )}
              </div>
            ) : canAcceptTransaction ? (
              <Button
                size="sm"
                onClick={() =>
                  handleUpdateStatus({
                    transaction_verified: true,
                    payment_status: true,
                  })
                }
                disabled={loading || !isTxVerified}
                title={
                  !isTxVerified
                    ? "Transaction must be verified (Step 1) before payment can be accepted"
                    : "Accept payment"
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept Payment
              </Button>
            ) : null}
          </div>

          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-white text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
