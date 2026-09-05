"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { APIENDPOINTS } from "@/data/urls";
import { headerConfig } from "@/lib/header_config";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, LockKeyhole } from "lucide-react";
import { PaymentStatusModal, PaymentStatusData } from "./PaymentStatusModal";
import { AdminProfileDialog, AdminProfileInfo } from "./AdminProfileDialog";
import { PaymentTableToolbar } from "./PaymentTableToolbar";
import { PaymentTableFilters } from "./PaymentTableFilters";
import { PaymentTableContent } from "./PaymentTableContent";
import { PaymentDetailsModal } from "./PaymentDetailsModal";
import { PaymentBatchConfirmModal } from "./PaymentBatchConfirmModal";

const ITEMS_PER_PAGE = 8;

const PaymentsTable = () => {
  const { toast } = useToast();
  const { roleAccess, loading: profileLoading } = useProfile();
  const canView = Boolean(roleAccess?.billingacl?.hasBillingAccess);
  const canVerifyTransaction = Boolean(
    roleAccess?.billingacl?.canVerifyTransaction,
  );
  const canAcceptTransaction = Boolean(
    roleAccess?.billingacl?.canAcceptTransaction,
  );

  const [payments, setPayments] = useState<PaymentStatusData[]>([]);
  const [filtered, setFiltered] = useState<PaymentStatusData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmBatchAction, setConfirmBatchAction] = useState<
    "verify_all" | "accept_all" | null
  >(null);
  const [batchLoading, setBatchLoading] = useState(false);

  const [modalDetailsData, setModalDetailsData] =
    useState<PaymentStatusData | null>(null);
  const [statusModalTarget, setStatusModalTarget] =
    useState<PaymentStatusData | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfileInfo | null>(
    null,
  );

  const [regno, setRegno] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [method, setMethod] = useState("");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<PaymentStatusData[]>(
        APIENDPOINTS.billing.getAllPayments,
        headerConfig(),
      );
      setPayments(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profileLoading) return;
    if (!canView) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [canView, fetchData, profileLoading]);

  useEffect(() => {
    let data = payments.filter(
      (p) =>
        (p.regno || "").toLowerCase().includes(regno.toLowerCase().trim()) &&
        (p.fullname || "").toLowerCase().includes(regno.toLowerCase().trim()) &&
        (p.session || "").toLowerCase().includes(year.toLowerCase().trim()) &&
        (p.subtype || "")
          .toLowerCase()
          .includes(semester.toLowerCase().trim()) &&
        (p.method_name || "")
          .toLowerCase()
          .includes(method.toLowerCase().trim()) &&
        (paymentTypeFilter === "all" ||
          (p.payment_type || "").toLowerCase() ===
            paymentTypeFilter.toLowerCase()) &&
        (status === "all"
          ? true
          : status === "accepted"
            ? p.payment_status
            : status === "pending"
              ? !p.payment_status
              : status === "verified"
                ? p.transaction_verified
                : status === "unverified"
                  ? !p.transaction_verified
                  : true),
    );
    setFiltered(data);
    setPage(1);
  }, [regno, year, semester, method, paymentTypeFilter, status, payments]);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const isAllPaginatedSelected =
    paginated.length > 0 &&
    paginated.every((p) => selectedIds.includes(p.paymentid));

  const toggleSelectAllPaginated = () => {
    if (isAllPaginatedSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginated.some((p) => p.paymentid === id)),
      );
    } else {
      setSelectedIds((prev) =>
        Array.from(new Set([...prev, ...paginated.map((p) => p.paymentid)])),
      );
    }
  };

  const toggleSelectRow = (paymentId: number) => {
    setSelectedIds((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId],
    );
  };

  // Target sets and counts
  const activeSet =
    selectedIds.length > 0
      ? filtered.filter((p) => selectedIds.includes(p.paymentid))
      : filtered;

  const unverifiedCount = activeSet.filter(
    (p) => !p.transaction_verified,
  ).length;

  const readyToAcceptCount = activeSet.filter(
    (p) => !p.payment_status && p.transaction_verified,
  ).length;

  const unverifiedInTargetCount = activeSet.filter(
    (p) => !p.transaction_verified,
  ).length;

  const handleExecuteBatchAction = async () => {
    if (!confirmBatchAction) return;

    if (confirmBatchAction === "accept_all") {
      if (unverifiedInTargetCount > 0) {
        toast({
          title: "Verification Required",
          description: `Cannot accept payments: ${unverifiedInTargetCount} transaction(s) are not verified yet. Please verify all transactions first.`,
          variant: "destructive",
        });
        setConfirmBatchAction(null);
        return;
      }
    }

    const targetPayments =
      confirmBatchAction === "verify_all"
        ? activeSet.filter((p) => !p.transaction_verified)
        : activeSet.filter((p) => !p.payment_status && p.transaction_verified);

    const targetPaymentIds = targetPayments.map((p) => p.paymentid);

    if (targetPaymentIds.length === 0) {
      toast({
        title: "No Payments Available",
        description:
          confirmBatchAction === "verify_all"
            ? "All transactions in the selected scope are already verified."
            : "No verified pending payments available to accept in the selected scope.",
        variant: "destructive",
      });
      setConfirmBatchAction(null);
      return;
    }

    setBatchLoading(true);
    try {
      const res = await axios.put<{
        updatedCount: number;
        payments: PaymentStatusData[];
      }>(
        APIENDPOINTS.billing.batchUpdatePayments,
        {
          action: confirmBatchAction,
          paymentIds: targetPaymentIds,
        },
        headerConfig(),
      );

      if (res.data?.payments) {
        setPayments(res.data.payments);
        setFiltered(res.data.payments);
      }
      setSelectedIds([]);
      toast({
        title: "Batch Operation Completed",
        description: `Successfully ${
          confirmBatchAction === "verify_all" ? "verified" : "accepted"
        } ${res.data.updatedCount} transaction(s).`,
      });
      fetchData();
    } catch (err: any) {
      console.error("Batch update error:", err);
      const errorMsg =
        err?.response?.data?.message ||
        "Failed to process batch payment action.";
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

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
        <span className="text-gray-400">Loading payments dataset…</span>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-400">
        <LockKeyhole className="h-6 w-6" />
        <span>You do not have permission to view payments data.</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header Toolbar */}
      <PaymentTableToolbar
        canVerifyTransaction={canVerifyTransaction}
        canAcceptTransaction={canAcceptTransaction}
        selectedCount={selectedIds.length}
        unverifiedCount={unverifiedCount}
        readyToAcceptCount={readyToAcceptCount}
        unverifiedInTargetCount={unverifiedInTargetCount}
        loading={loading}
        batchLoading={batchLoading}
        onFetchData={fetchData}
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

      {/* Filter Inputs */}
      <PaymentTableFilters
        regno={regno}
        setRegno={setRegno}
        year={year}
        setYear={setYear}
        semester={semester}
        setSemester={setSemester}
        method={method}
        setMethod={setMethod}
        paymentTypeFilter={paymentTypeFilter}
        setPaymentTypeFilter={setPaymentTypeFilter}
        status={status}
        setStatus={setStatus}
      />

      {/* Main Payment Table & Pagination */}
      <PaymentTableContent
        paginated={paginated}
        filteredCount={filtered.length}
        startIndex={startIndex}
        page={page}
        ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        selectedIds={selectedIds}
        isAllPaginatedSelected={isAllPaginatedSelected}
        onToggleSelectAllPaginated={toggleSelectAllPaginated}
        onToggleSelectRow={toggleSelectRow}
        onSetPage={setPage}
        onSelectDetails={(p) => setModalDetailsData(p)}
        onSelectStatusModal={(p) => setStatusModalTarget(p)}
        onSelectAdminProfile={(info) => setSelectedAdmin(info)}
      />

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        modalDetailsData={modalDetailsData}
        onClose={() => setModalDetailsData(null)}
      />

      {/* 2-Step Status Verification Modal */}
      <PaymentStatusModal
        payment={statusModalTarget}
        open={Boolean(statusModalTarget)}
        canVerifyTransaction={canVerifyTransaction}
        canAcceptTransaction={canAcceptTransaction}
        onClose={() => setStatusModalTarget(null)}
        onUpdated={(updatedPayment) => {
          setPayments((prev) =>
            prev.map((p) =>
              p.paymentid === updatedPayment.paymentid ? updatedPayment : p,
            ),
          );
          setStatusModalTarget(null);
          fetchData();
        }}
        onSelectAdminProfile={(info) => setSelectedAdmin(info)}
      />

      {/* Admin Auditor Profile Dialog */}
      <AdminProfileDialog
        open={Boolean(selectedAdmin)}
        onOpenChange={(open) => !open && setSelectedAdmin(null)}
        adminInfo={selectedAdmin}
      />

      {/* Bulk Action Confirmation Modal */}
      <PaymentBatchConfirmModal
        confirmBatchAction={confirmBatchAction}
        selectedCount={selectedIds.length}
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

export default PaymentsTable;
