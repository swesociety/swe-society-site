"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { getUserID } from "@/data/cookies/getCookies";
import { useToast } from "@/components/ui/use-toast";
import { LockKeyhole, RefreshCw } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

import {
  SocietyFeeSemesterKey,
  SocietyFeeStatus,
  SocietyFeeRecord,
  UserSocietyFeeRow,
  SocietyFeeApiResponse,
} from "./types";
import { SocietyFeeFilters } from "./SocietyFeeFilters";
import { SocietyFeeStats } from "./SocietyFeeStats";
import { SocietyFeeMatrixTable } from "./SocietyFeeMatrixTable";
import { TwoStepControlModal } from "./TwoStepControlModal";
import { AdminProfileDialog, AdminProfileInfo } from "./AdminProfileDialog";
import { ManualSocietyFeeModal } from "./ManualSocietyFeeModal";
import { PaymentBatchConfirmModal } from "./PaymentBatchConfirmModal";

export { SocietyFeeStatus, SemesterKey, DEFAULT_SEMESTER_FEES } from "./types";
export type {
  SocietyFeeRecord,
  UserSocietyFeeRow,
  SocietyFeeApiResponse,
} from "./types";

const SocietyFeeTable: React.FC = () => {
  const { toast } = useToast();
  const { roleAccess, loading: profileLoading } = useProfile();
  const currentAdminId = getUserID();
  const canView = Boolean(roleAccess?.billingacl?.hasBillingAccess);
  const canVerifyTransaction = Boolean(
    roleAccess?.billingacl?.canVerifyTransaction,
  );
  const canAcceptTransaction = Boolean(
    roleAccess?.billingacl?.canAcceptTransaction,
  );

  const [data, setData] = useState<SocietyFeeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeBatch, setActiveBatch] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfileInfo | null>(
    null,
  );
  const [toggleTarget, setToggleTarget] = useState<{
    user: UserSocietyFeeRow;
    semester_key: SocietyFeeSemesterKey;
    record: SocietyFeeRecord | null;
  } | null>(null);

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // ── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<SocietyFeeApiResponse>(
        APIENDPOINTS.societyFee.getData,
        headerConfig(),
      );
      setData(res.data);
    } catch (err) {
      toast({
        title: "Failed to load society fee data",
        description: "Please check backend connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (profileLoading) return;
    if (!canView) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [canView, fetchData, profileLoading]);

  // ── Derived State & Filtering ──────────────────────────────────────────────
  const allSemestersList = useMemo(
    () => Object.values(SocietyFeeSemesterKey),
    [],
  );

  const allBatches = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.users.map((u) => u.batch))).sort();
  }, [data]);

  const activeSemesters = useMemo(() => {
    if (semesterFilter === "all") return allSemestersList;
    return allSemestersList.filter(
      (s) => s === (semesterFilter as SocietyFeeSemesterKey),
    );
  }, [allSemestersList, semesterFilter]);

  const filteredUsers = useMemo(() => {
    if (!data) return [];
    let users = data.users;

    if (activeBatch !== "all") {
      users = users.filter((u) => u.batch === activeBatch);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      users = users.filter(
        (u) =>
          u.regno.toLowerCase().includes(q) ||
          (u.fullname && u.fullname.toLowerCase().includes(q)) ||
          (u.session && u.session.toLowerCase().includes(q)),
      );
    }

    return users;
  }, [data, activeBatch, searchQuery]);

  const usersByBatch = useMemo(() => {
    const grouped: Record<string, UserSocietyFeeRow[]> = {};
    for (const u of filteredUsers) {
      if (!grouped[u.batch]) grouped[u.batch] = [];
      grouped[u.batch].push(u);
    }
    return grouped;
  }, [filteredUsers]);

  const stats = useMemo(() => {
    if (!data) return { verified: 0, pending: 0, unpaid: 0 };
    let verified = 0,
      pending = 0,
      unpaid = 0;

    for (const u of filteredUsers) {
      for (const semKey of activeSemesters) {
        const rec = u.payments[semKey];
        if (!rec) unpaid++;
        else if (
          rec.transaction_verified &&
          rec.status === SocietyFeeStatus.VERIFIED
        )
          verified++;
        else if (
          rec.transaction_verified ||
          rec.status === SocietyFeeStatus.PENDING
        )
          pending++;
        else unpaid++;
      }
    }
    return { verified, pending, unpaid };
  }, [data, filteredUsers, activeSemesters]);

  const sortedBatchKeys = useMemo(
    () => Object.keys(usersByBatch).sort(),
    [usersByBatch],
  );

  // ── Batch Verify All & Accept All ─────────────────────────────────────────
  const [confirmBatchAction, setConfirmBatchAction] = useState<
    "verify_all" | "accept_all" | null
  >(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const targetRecords = useMemo(() => {
    const list: SocietyFeeRecord[] = [];
    for (const u of filteredUsers) {
      for (const semKey of activeSemesters) {
        const rec = u.payments[semKey];
        if (rec) {
          list.push(rec);
        }
      }
    }
    return list;
  }, [filteredUsers, activeSemesters]);

  const unverifiedRecords = useMemo(() => {
    return targetRecords.filter((r) => !r.transaction_verified);
  }, [targetRecords]);

  const readyToAcceptRecords = useMemo(() => {
    return targetRecords.filter(
      (r) => r.transaction_verified && r.status !== SocietyFeeStatus.VERIFIED,
    );
  }, [targetRecords]);

  const unverifiedCount = unverifiedRecords.length;
  const readyToAcceptCount = readyToAcceptRecords.length;
  const unverifiedInTargetCount = targetRecords.filter(
    (r) => !r.transaction_verified && r.status !== SocietyFeeStatus.VERIFIED,
  ).length;

  const handleExecuteBatchAction = async () => {
    if (!confirmBatchAction) return;

    if (confirmBatchAction === "accept_all") {
      if (unverifiedInTargetCount > 0) {
        toast({
          title: "Verification Required",
          description: `Cannot accept payments: ${unverifiedInTargetCount} society fee transaction(s) are not verified yet. Please verify all transactions first.`,
          variant: "destructive",
        });
        setConfirmBatchAction(null);
        return;
      }
    }

    const targetFeeRecords =
      confirmBatchAction === "verify_all"
        ? unverifiedRecords
        : readyToAcceptRecords;

    const societyFeeIds = targetFeeRecords
      .map((r) => r.society_fee_id)
      .filter((id): id is number => typeof id === "number");

    if (societyFeeIds.length === 0) {
      toast({
        title: "No Records Available",
        description:
          confirmBatchAction === "verify_all"
            ? "All society fees in the selected scope are already verified."
            : "No verified pending society fees available to accept in the selected scope.",
        variant: "destructive",
      });
      setConfirmBatchAction(null);
      return;
    }

    setBatchLoading(true);
    try {
      const res = await axios.put<{ updatedCount: number }>(
        APIENDPOINTS.societyFee.batchUpdateStatus,
        {
          action: confirmBatchAction,
          societyFeeIds,
        },
        headerConfig(),
      );

      toast({
        title: "Batch Operation Completed",
        description: `Successfully ${
          confirmBatchAction === "verify_all" ? "verified" : "accepted"
        } ${res.data.updatedCount} society fee transaction(s).`,
      });
      fetchData();
    } catch (err: any) {
      console.error("Batch society fee update error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        "Failed to process batch society fee action.";
      toast({
        title: "Batch Action Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setBatchLoading(false);
      setConfirmBatchAction(null);
    }
  };

  // ── Render Loading & Error States ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-400">Loading 2-step society fee table…</span>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
        <LockKeyhole className="h-6 w-6" />
        <span>You do not have permission to view society fee data.</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No society fee data available.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Filters Bar & Batch Tabs */}
      <SocietyFeeFilters
        totalUsersCount={data.users.length}
        filteredUsersCount={filteredUsers.length}
        allBatches={allBatches}
        activeBatch={activeBatch}
        setActiveBatch={setActiveBatch}
        semesterFilter={semesterFilter}
        setSemesterFilter={setSemesterFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        allSemestersList={allSemestersList}
        onRefresh={fetchData}
        loading={loading}
        onOpenManualAdd={() => setIsManualModalOpen(true)}
        canVerifyTransaction={canVerifyTransaction}
        canAcceptTransaction={canAcceptTransaction}
        unverifiedCount={unverifiedCount}
        readyToAcceptCount={readyToAcceptCount}
        unverifiedInTargetCount={unverifiedInTargetCount}
        batchLoading={batchLoading}
        onOpenBatchConfirm={(action) => {
          if (action === "accept_all" && unverifiedInTargetCount > 0) {
            toast({
              title: "Verification Required",
              description: `Cannot accept payments: ${unverifiedInTargetCount} transaction(s) are not verified yet. Please verify all transactions first.`,
              variant: "destructive",
            });
          }
          setConfirmBatchAction(action);
        }}
      />

      {/* Stats Badges */}
      <SocietyFeeStats stats={stats} />

      {/* Matrix Table */}
      <SocietyFeeMatrixTable
        sortedBatchKeys={sortedBatchKeys}
        usersByBatch={usersByBatch}
        activeSemesters={activeSemesters}
        activeBatch={activeBatch}
        onSelectCell={(t) => setToggleTarget(t)}
        onSelectAdminProfile={(info) => setSelectedAdmin(info)}
      />

      {/* 2-Step Verification Modal */}
      <TwoStepControlModal
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        target={toggleTarget}
        currentAdminId={currentAdminId}
        canVerifyTransaction={canVerifyTransaction}
        canAcceptTransaction={canAcceptTransaction}
        onSuccess={(updatedRecord) => {
          setToggleTarget((prev) =>
            prev ? { ...prev, record: updatedRecord } : null,
          );
          fetchData();
        }}
        onSelectAdminProfile={(info) => setSelectedAdmin(info)}
      />

      {/* Manual Add / Edit Modal */}
      <ManualSocietyFeeModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        users={data.users}
        onSuccess={fetchData}
      />

      {/* Admin Auditor Profile Popup */}
      <AdminProfileDialog
        open={Boolean(selectedAdmin)}
        onOpenChange={(open) => !open && setSelectedAdmin(null)}
        adminInfo={selectedAdmin}
      />

      {/* Bulk Action Confirmation Modal */}
      <PaymentBatchConfirmModal
        confirmBatchAction={confirmBatchAction}
        selectedCount={0}
        unverifiedCount={unverifiedCount}
        readyToAcceptCount={readyToAcceptCount}
        unverifiedInTargetCount={unverifiedInTargetCount}
        batchLoading={batchLoading}
        onClose={() => setConfirmBatchAction(null)}
        onConfirm={handleExecuteBatchAction}
      />
    </div>
  );
};

export default SocietyFeeTable;
