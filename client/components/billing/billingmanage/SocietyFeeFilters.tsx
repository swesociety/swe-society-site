"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, RefreshCw, Search, ShieldCheck, FileCheck2, UserCheck } from "lucide-react";
import { SocietyFeeSemesterKey, DEFAULT_SEMESTER_FEES } from "./types";

interface SocietyFeeFiltersProps {
  totalUsersCount: number;
  filteredUsersCount: number;
  allBatches: string[];
  activeBatch: string;
  setActiveBatch: (batch: string) => void;
  semesterFilter: string;
  setSemesterFilter: (sem: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allSemestersList: SocietyFeeSemesterKey[];
  onRefresh: () => void;
  loading: boolean;
  onOpenManualAdd?: () => void;
  canVerifyTransaction?: boolean;
  canAcceptTransaction?: boolean;
  unverifiedCount?: number;
  readyToAcceptCount?: number;
  unverifiedInTargetCount?: number;
  batchLoading?: boolean;
  onOpenBatchConfirm?: (action: "verify_all" | "accept_all") => void;
}

export const SocietyFeeFilters: React.FC<SocietyFeeFiltersProps> = ({
  totalUsersCount,
  filteredUsersCount,
  allBatches,
  activeBatch,
  setActiveBatch,
  semesterFilter,
  setSemesterFilter,
  searchQuery,
  setSearchQuery,
  allSemestersList,
  onRefresh,
  loading,
  onOpenManualAdd,
  canVerifyTransaction,
  canAcceptTransaction,
  unverifiedCount = 0,
  readyToAcceptCount = 0,
  unverifiedInTargetCount = 0,
  batchLoading = false,
  onOpenBatchConfirm,
}) => {
  const isAcceptDisabled =
    loading ||
    batchLoading ||
    (readyToAcceptCount === 0 && unverifiedInTargetCount === 0);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-xl border border-gray-800 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">
              Society Fee 2-Step Verification Table
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Step 1: Admin verifies transaction · Step 2: Admin accepts payment.
            Tracks admin auditors.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canVerifyTransaction && (
            <Button
              size="sm"
              onClick={() => onOpenBatchConfirm && onOpenBatchConfirm("verify_all")}
              disabled={loading || batchLoading || unverifiedCount === 0}
              className="gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-medium text-xs border border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                unverifiedCount === 0
                  ? "No unverified transactions to verify"
                  : "Verify unverified society fees in bulk"
              }
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
              Verify All ({unverifiedCount})
            </Button>
          )}

          {canAcceptTransaction && (
            <Button
              size="sm"
              onClick={() => onOpenBatchConfirm && onOpenBatchConfirm("accept_all")}
              disabled={isAcceptDisabled}
              className="gap-1.5 bg-indigo-800 hover:bg-indigo-700 text-white font-medium text-xs border border-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                unverifiedInTargetCount > 0
                  ? `${unverifiedInTargetCount} transaction(s) must be verified first before acceptance`
                  : readyToAcceptCount === 0
                    ? "No verified pending payments to accept"
                    : "Accept verified society fees in bulk"
              }
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-300" />
              Accept All ({readyToAcceptCount})
            </Button>
          )}

          {onOpenManualAdd && (
            <Button
              size="sm"
              onClick={onOpenManualAdd}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Fee Manually
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading || batchLoading}
            className="gap-2 border-gray-700 hover:bg-gray-800 text-gray-300 text-xs"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading || batchLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Batch Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-gray-800">
        <button
          onClick={() => setActiveBatch("all")}
          className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
            activeBatch === "all"
              ? "bg-gray-800 text-white border-gray-700 border-b-2 border-b-emerald-500"
              : "bg-gray-900/40 text-gray-400 border-transparent hover:bg-gray-800/60 hover:text-gray-200"
          }`}
        >
          All Batches ({totalUsersCount})
        </button>

        {allBatches.map((b) => {
          const label =
            b.length === 4
              ? `SWE 20${b.slice(0, 2)}-20${b.slice(2, 4)}`
              : `Batch ${b}`;
          return (
            <button
              key={b}
              onClick={() => setActiveBatch(b)}
              className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-all border-t border-x ${
                activeBatch === b
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/80 border-b-2 border-b-emerald-400"
                  : "bg-gray-900/40 text-gray-400 border-transparent hover:bg-gray-800/60 hover:text-gray-200"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search & Semester Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <Input
            placeholder="Search by Name or Reg No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs bg-gray-950 border-gray-800 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="h-9 text-xs bg-gray-950 border-gray-800">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 7 Semesters</SelectItem>
                {allSemestersList.map((semKey) => (
                  <SelectItem key={semKey} value={semKey}>
                    {semKey === SocietyFeeSemesterKey.YEAR_1
                      ? "1/1 & 1/2 (Paired - ৳1000)"
                      : `Semester ${semKey} (৳${DEFAULT_SEMESTER_FEES[semKey]})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="text-xs text-gray-400">
            Showing <strong className="text-white">{filteredUsersCount}</strong>{" "}
            students
          </span>
        </div>
      </div>
    </div>
  );
};
