"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { UserSocietyFeeResponse } from "./UserSocietyFeeTypes";

interface UserSocietyFeeSummaryProps {
  data: UserSocietyFeeResponse;
}

export const UserSocietyFeeSummary = ({ data }: UserSocietyFeeSummaryProps) => (
  <>
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3">
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Society Fee 2-Step Verification Status
          </h3>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          Step 1: Transaction Verification · Step 2: Payment Acceptance (1/1 &
          1/2 paired = ৳1000, rest = ৳300).
        </p>
      </div>
      {data.totalDue > 0 ? (
        <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-800 text-amber-300 px-3.5 py-1.5 rounded-lg shadow-sm">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-amber-400/80 tracking-wider">
              Total Due Amount
            </div>
            <div className="text-sm font-extrabold text-amber-200">
              ৳ {data.totalDue.toLocaleString()} Due
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-3.5 py-1.5 rounded-lg shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase font-semibold text-emerald-400/80 tracking-wider">
              Society Fee Status
            </div>
            <div className="text-sm font-extrabold text-emerald-200">
              All 2-Step Verifications Complete (৳0 Due)
            </div>
          </div>
        </div>
      )}
    </div>
    {data.totalDue > 0 && (
      <div className="text-[11px] bg-amber-950/40 border border-amber-900/60 text-amber-300/90 px-3 py-1.5 rounded-md flex items-center gap-2">
        <span>ℹ️</span>
        <span>
          <strong>2-Step Verification Rule:</strong> A semester fee remains{" "}
          <strong>DUE</strong> until <em>both</em> Step 1 (Transaction Verified)
          and Step 2 (Payment Accepted) are completed by Admin.
        </span>
      </div>
    )}
  </>
);
