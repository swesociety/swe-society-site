"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  FileCheck2,
  UserCheck,
  AlertTriangle,
  Edit3,
  Trash2,
} from "lucide-react";
import {
  SocietyFeeSemesterKey,
  SocietyFeeStatus,
  DEFAULT_SEMESTER_FEES,
  SocietyFeeRecord,
  UserSocietyFeeRow,
} from "./types";
import { AdminProfileInfo } from "./AdminProfileDialog";

interface TwoStepControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: {
    user: UserSocietyFeeRow;
    semester_key: SocietyFeeSemesterKey;
    record: SocietyFeeRecord | null;
  } | null;
  currentAdminId?: string;
  canVerifyTransaction: boolean;
  canAcceptTransaction: boolean;
  onSuccess: (updatedRecord: SocietyFeeRecord | null) => void;
  onSelectAdminProfile: (adminInfo: AdminProfileInfo) => void;
}

export const TwoStepControlModal: React.FC<TwoStepControlModalProps> = ({
  isOpen,
  onClose,
  target,
  currentAdminId,
  canVerifyTransaction,
  canAcceptTransaction,
  onSuccess,
  onSelectAdminProfile,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState<number>(300);
  const [editTxId, setEditTxId] = useState<string>("");

  useEffect(() => {
    if (target) {
      const defAmt =
        DEFAULT_SEMESTER_FEES[target.semester_key] || 300;
      setEditAmount(target.record?.amount ?? defAmt);
      setEditTxId(target.record?.transaction_id || "");
      setIsEditing(false);
    }
  }, [target]);

  if (!target || !isOpen) return null;

  const { user, semester_key, record } = target;
  const isTxVerified = Boolean(record?.transaction_verified);
  const isPaymentAccepted = record?.status === SocietyFeeStatus.VERIFIED;

  const handleUpdate = async (
    newTxVerified: boolean,
    newStatus: SocietyFeeStatus,
    customAmount?: number,
    customTxId?: string,
  ) => {
    const isVerificationUpdate = newTxVerified !== isTxVerified;
    const hasPermission = isVerificationUpdate
      ? canVerifyTransaction
      : canAcceptTransaction;

    if (!hasPermission && !isEditing) {
      toast({
        title: "Permission Denied",
        description: isVerificationUpdate
          ? "Your assigned role cannot verify transactions."
          : "Your assigned role cannot accept payments.",
        variant: "destructive",
      });
      return;
    }

    if (newStatus === SocietyFeeStatus.VERIFIED && !newTxVerified) {
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
      const res = await axios.post<SocietyFeeRecord>(
        APIENDPOINTS.societyFee.manualSave,
        {
          userid: user.userid,
          semester_key,
          transaction_verified: newTxVerified,
          status: newStatus,
          amount:
            customAmount !== undefined
              ? customAmount
              : record?.amount || DEFAULT_SEMESTER_FEES[semester_key],
          transaction_id:
            customTxId !== undefined ? customTxId : record?.transaction_id || null,
        },
        headerConfig(),
      );

      toast({
        title: "Fee Record Updated",
        description: `${user.fullname || user.regno} (${semester_key}) successfully updated.`,
      });

      setIsEditing(false);
      if (res.data) {
        onSuccess(res.data);
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        "Payment is not verified or server error occurred.";
      toast({
        title: "Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the fee record for ${
          user.fullname || user.regno
        } (${semester_key})?`,
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const url = record?.society_fee_id
        ? `${APIENDPOINTS.societyFee.deleteRecord}/${record.society_fee_id}`
        : `${APIENDPOINTS.societyFee.deleteRecord}?userid=${
            user.userid
          }&semester_key=${encodeURIComponent(semester_key)}`;

      await axios.delete(url, headerConfig());

      toast({
        title: "Fee Record Deleted",
        description: `Society fee record for ${semester_key} deleted successfully.`,
      });

      onSuccess(null);
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete fee record.";
      toast({
        title: "Delete Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-gray-950 border-gray-800 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-emerald-400 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Payment Verification & Fee Control
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 px-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800"
                title="Edit fee amount or details"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                {isEditing ? "View" : "Edit"}
              </Button>
              {record && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-8 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/50"
                  title="Delete society fee record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm mt-2">
          {/* Target Student & Fee Details */}
          <div className="rounded-lg bg-gray-900 p-3.5 space-y-2 border border-gray-800">
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Student Name:</span>
              <span className="font-semibold text-white">
                {user.fullname || "—"}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Registration No:</span>
              <span className="font-mono text-emerald-400">{user.regno}</span>
            </div>
            <div className="flex justify-between border-b border-gray-800 pb-2">
              <span className="text-gray-400">Semester:</span>
              <span className="font-medium text-indigo-300">
                {semester_key === SocietyFeeSemesterKey.YEAR_1
                  ? "1/1 & 1/2 (Paired 1st Year)"
                  : `Semester ${semester_key}`}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-2.5 pt-1 border-t border-gray-800">
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1">
                    Edit Amount (৳):
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="h-8 text-xs bg-gray-950 border-gray-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 font-medium block mb-1">
                    Edit Transaction ID:
                  </label>
                  <Input
                    type="text"
                    value={editTxId}
                    onChange={(e) => setEditTxId(e.target.value)}
                    placeholder="Enter transaction ref..."
                    className="h-8 text-xs bg-gray-950 border-gray-700 text-white font-mono"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="h-7 text-xs text-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleUpdate(
                        isTxVerified,
                        record?.status || SocietyFeeStatus.PENDING,
                        editAmount,
                        editTxId,
                      )
                    }
                    disabled={loading}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between border-b border-gray-800 pb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-white">
                    ৳{record?.amount || DEFAULT_SEMESTER_FEES[semester_key]}
                  </span>
                </div>
                {record?.transaction_id && (
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="font-mono text-gray-200">
                      {record.transaction_id}
                    </span>
                  </div>
                )}
                {record?.method_name && (
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Payment Method:</span>
                    <span className="text-gray-200">{record.method_name}</span>
                  </div>
                )}
                {record?.transaction_slip && (
                  <a
                    href={record.transaction_slip}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-emerald-400 underline underline-offset-2"
                  >
                    View transaction slip
                  </a>
                )}
              </>
            )}

            {/* Step 1 & Step 2 Badges with Clickable Auditor Profiles */}
            <div className="space-y-2 pt-1">
              <div className="flex w-full justify-between items-center text-xs">
                {isTxVerified ? (
                  <button
                    onClick={() => {
                      if (record?.verifier_name) {
                        onSelectAdminProfile({
                          fullname: record.verifier_name,
                          regno: record.verifier_regno || "N/A",
                          profile_picture: record.verifier_profile_picture,
                          role: record.verifier_role,
                          committee_memberships:
                            record.verifier_committee_memberships,
                          actionTitle: "Verified Transaction By",
                        });
                      }
                    }}
                    className="hover:opacity-80 w-full items-center transition-opacity cursor-pointer text-left"
                  >
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800">
                      <FileCheck2 className="w-3 h-3 mr-1 text-emerald-400 inline" />
                      Tx Verified by {record?.verifier_name || "Admin"}
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
                    onClick={() => {
                      if (record?.accepter_name) {
                        onSelectAdminProfile({
                          fullname: record.accepter_name,
                          regno: record.accepter_regno || "N/A",
                          profile_picture: record.accepter_profile_picture,
                          role: record.accepter_role,
                          committee_memberships:
                            record.accepter_committee_memberships,
                          actionTitle: "Accepted Payment By",
                        });
                      }
                    }}
                    className="hover:opacity-80 w-full items-center transition-opacity cursor-pointer text-left"
                  >
                    <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800">
                      <UserCheck className="w-3 h-3 mr-1 text-emerald-400 inline" />
                      Accepted by {record?.accepter_name || "Admin"}
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
                <strong>Required:</strong> Payment cannot be accepted until
                transaction is verified by Treasurer.
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
                  handleUpdate(
                    !isTxVerified,
                    !isTxVerified
                      ? record?.status || SocietyFeeStatus.PENDING
                      : SocietyFeeStatus.PENDING,
                  )
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
                  Mark society fee as fully cleared
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
                      handleUpdate(isTxVerified, SocietyFeeStatus.PENDING)
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
                onClick={() => handleUpdate(true, SocietyFeeStatus.VERIFIED)}
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

          <div className="flex justify-between items-center pt-1">
            {record ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
                className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Record
              </Button>
            ) : (
              <div />
            )}
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

