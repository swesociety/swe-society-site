"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import {
  SocietyFeeSemesterKey,
  SocietyFeeStatus,
  DEFAULT_SEMESTER_FEES,
  UserSocietyFeeRow,
  SocietyFeeRecord,
} from "./types";

interface ManualSocietyFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserSocietyFeeRow[];
  initialValues?: {
    user?: UserSocietyFeeRow;
    semester_key?: SocietyFeeSemesterKey;
    record?: SocietyFeeRecord | null;
  } | null;
  onSuccess: () => void;
}

export const ManualSocietyFeeModal: React.FC<ManualSocietyFeeModalProps> = ({
  isOpen,
  onClose,
  users,
  initialValues,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedSemesterKey, setSelectedSemesterKey] = useState<string>(
    SocietyFeeSemesterKey.YEAR_1,
  );
  const [amount, setAmount] = useState<number>(1000);
  const [isTxVerified, setIsTxVerified] = useState<boolean>(false);
  const [status, setStatus] = useState<SocietyFeeStatus>(
    SocietyFeeStatus.PENDING,
  );
  const [transactionId, setTransactionId] = useState<string>("");

  useEffect(() => {
    if (initialValues?.user) {
      setSelectedUserId(String(initialValues.user.userid));
    } else if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(String(users[0].userid));
    }

    if (initialValues?.semester_key) {
      setSelectedSemesterKey(initialValues.semester_key);
      const defAmount =
        DEFAULT_SEMESTER_FEES[
          initialValues.semester_key as SocietyFeeSemesterKey
        ] || 300;
      setAmount(initialValues.record?.amount ?? defAmount);
    }

    if (initialValues?.record) {
      setIsTxVerified(Boolean(initialValues.record.transaction_verified));
      setStatus(initialValues.record.status || SocietyFeeStatus.PENDING);
      setTransactionId(initialValues.record.transaction_id || "");
    }
  }, [initialValues, users]);

  const handleSemesterChange = (key: string) => {
    setSelectedSemesterKey(key);
    const defAmount =
      DEFAULT_SEMESTER_FEES[key as SocietyFeeSemesterKey] || 300;
    setAmount(defAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({
        title: "User required",
        description: "Please select a student.",
        variant: "destructive",
      });
      return;
    }

    if (status === SocietyFeeStatus.VERIFIED && !isTxVerified) {
      toast({
        title: "Verification required",
        description:
          "Transaction must be verified before payment can be set to Verified.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        APIENDPOINTS.societyFee.manualSave,
        {
          userid: Number(selectedUserId),
          semester_key: selectedSemesterKey,
          amount: Number(amount),
          transaction_verified: isTxVerified,
          status,
          transaction_id: transactionId.trim() || null,
        },
        headerConfig(),
      );

      toast({
        title: "Record Saved",
        description: "Society fee record created/updated successfully.",
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save fee record.";
      toast({
        title: "Error Saving Record",
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
          <DialogTitle className="text-lg font-bold text-emerald-400 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Manually Add / Edit Society Fee
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Select Student */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Select Student</Label>
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={Boolean(initialValues?.user)}
            >
              <SelectTrigger className="h-9 text-xs bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Search student..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 bg-gray-900 border-gray-800 text-white">
                {users.map((u) => (
                  <SelectItem key={u.userid} value={String(u.userid)}>
                    {u.regno} — {u.fullname || "Unnamed Student"} (Batch{" "}
                    {u.batch})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Select Semester Key */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Semester</Label>
            <Select
              value={selectedSemesterKey}
              onValueChange={handleSemesterChange}
              disabled={Boolean(initialValues?.semester_key)}
            >
              <SelectTrigger className="h-9 text-xs bg-gray-900 border-gray-800 text-white">
                <SelectValue placeholder="Select semester..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800 text-white">
                {Object.values(SocietyFeeSemesterKey).map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem === SocietyFeeSemesterKey.YEAR_1
                      ? "1/1 & 1/2"
                      : `Semester ${sem}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">Fee Amount (৳)</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="h-9 text-xs bg-gray-900 border-gray-800 text-white focus:border-emerald-500 font-bold"
              required
            />
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">
              Transaction ID / Ref (Optional)
            </Label>
            <Input
              placeholder="e.g. TXN987654321"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="h-9 text-xs bg-gray-900 border-gray-800 text-white focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Verification & Payment Controls */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5 bg-gray-900 p-2.5 rounded-lg border border-gray-800">
              <Label className="text-[11px] font-semibold text-gray-300 block">
                Step 1: Tx Verified
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="txVerifiedCheckbox"
                  checked={isTxVerified}
                  onChange={(e) => setIsTxVerified(e.target.checked)}
                  className="rounded border-gray-700 bg-gray-950 text-emerald-500 focus:ring-emerald-500 h-4 w-4"
                />
                <label
                  htmlFor="txVerifiedCheckbox"
                  className="text-xs text-emerald-400 cursor-pointer"
                >
                  {isTxVerified ? "Verified ✓" : "Unverified"}
                </label>
              </div>
            </div>

            <div className="space-y-1.5 bg-gray-900 p-2.5 rounded-lg border border-gray-800">
              <Label className="text-[11px] font-semibold text-gray-300 block">
                Step 2: Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as SocietyFeeStatus)}
              >
                <SelectTrigger className="h-7 text-xs bg-gray-950 border-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                  <SelectItem value={SocietyFeeStatus.PENDING}>
                    Pending
                  </SelectItem>
                  <SelectItem value={SocietyFeeStatus.VERIFIED}>
                    Verified (Accepted)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
            >
              {loading ? "Saving…" : "Save Record"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
