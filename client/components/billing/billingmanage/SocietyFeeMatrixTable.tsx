"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  SocietyFeeSemesterKey,
  SocietyFeeStatus,
  DEFAULT_SEMESTER_FEES,
  SocietyFeeRecord,
  UserSocietyFeeRow,
} from "./types";
import { AdminProfileInfo } from "./AdminProfileDialog";

interface SocietyFeeMatrixTableProps {
  sortedBatchKeys: string[];
  usersByBatch: Record<string, UserSocietyFeeRow[]>;
  activeSemesters: SocietyFeeSemesterKey[];
  activeBatch: string;
  onSelectCell: (target: {
    user: UserSocietyFeeRow;
    semester_key: SocietyFeeSemesterKey;
    record: SocietyFeeRecord | null;
  }) => void;
  onSelectAdminProfile: (adminInfo: AdminProfileInfo) => void;
}

export const SocietyFeeMatrixTable: React.FC<SocietyFeeMatrixTableProps> = ({
  sortedBatchKeys,
  usersByBatch,
  activeSemesters,
  activeBatch,
  onSelectCell,
  onSelectAdminProfile,
}) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-xl bg-gray-950">
      <table className="text-xs border-collapse min-w-full font-mono">
        <thead>
          <tr className="bg-gray-900 border-b border-gray-800">
            <th className="sticky left-0 z-30 bg-gray-900 px-2 py-2.5 text-center border-r border-gray-800 text-gray-400 font-semibold w-10">
              #
            </th>
            <th className="sticky left-10 z-30 bg-gray-900 px-3 py-2.5 text-left border-r border-gray-800 text-gray-300 font-bold min-w-[170px]">
              Name of Student
            </th>
            <th className="sticky left-[210px] z-30 bg-gray-900 px-3 py-2.5 text-left border-r border-gray-800 text-gray-300 font-bold min-w-[120px]">
              Registration No
            </th>
            <th className="sticky left-[330px] z-30 bg-gray-900 px-3 py-2.5 text-center border-r border-gray-800 text-gray-300 font-bold min-w-[90px]">
              Session
            </th>

            {/* 7 Semester Columns */}
            {activeSemesters.map((semKey) => (
              <th
                key={semKey}
                className="px-3 py-2 text-center border-r border-gray-800 bg-gray-800/90 text-emerald-300 font-bold text-xs min-w-[130px]"
              >
                <div className="text-[12px]">
                  {semKey === SocietyFeeSemesterKey.YEAR_1
                    ? "1/1 & 1/2"
                    : semKey}
                </div>
                <div className="text-[10px] text-gray-400 font-normal">
                  ৳{DEFAULT_SEMESTER_FEES[semKey]}
                </div>
              </th>
            ))}

            <th className="px-3 py-2.5 text-center border-l border-gray-800 bg-gray-900 text-gray-300 font-bold min-w-[120px]">
              Remarks
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedBatchKeys.map((batch) => {
            const batchUsers = usersByBatch[batch];
            return (
              <React.Fragment key={batch}>
                {/* Batch Banner Row */}
                {activeBatch === "all" && (
                  <tr className="bg-gray-900/90 border-t border-b border-gray-800">
                    <td
                      colSpan={5 + activeSemesters.length}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-950/80 via-gray-900 to-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                          Batch {batch} (
                          {batch.length === 4
                            ? `SWE 20${batch.slice(0, 2)}-20${batch.slice(2, 4)}`
                            : batch}
                          )
                        </span>
                        <span className="text-[11px] text-gray-400">
                          • {batchUsers.length} student
                          {batchUsers.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Student Rows */}
                {batchUsers.map((user, idx) => {
                  let clearedCount = 0;
                  let rowTotalPaid = 0;
                  let rowTotalLifetimeFee = 0;
                  const totalSemesters = activeSemesters.length;

                  for (const semKey of activeSemesters) {
                    const rec = user.payments[semKey];
                    const feeAmount =
                      rec?.amount !== undefined && rec?.amount !== null
                        ? Number(rec.amount)
                        : DEFAULT_SEMESTER_FEES[semKey];
                    rowTotalLifetimeFee += feeAmount;

                    const isFullyCleared =
                      Boolean(rec?.transaction_verified) &&
                      rec?.status === SocietyFeeStatus.VERIFIED;

                    if (isFullyCleared) {
                      clearedCount++;
                      rowTotalPaid += feeAmount;
                    }
                  }

                  const rowDueAmount = Math.max(
                    0,
                    rowTotalLifetimeFee - rowTotalPaid,
                  );
                  const allCleared = rowDueAmount === 0;
                  const rowBgClass = allCleared
                    ? "bg-emerald-950/20 hover:bg-emerald-900/30 text-gray-200"
                    : clearedCount === 0
                      ? "bg-rose-950/20 hover:bg-rose-900/30 text-gray-200"
                      : "bg-amber-950/15 hover:bg-amber-900/25 text-gray-200";

                  return (
                    <tr
                      key={user.userid}
                      className={`border-b border-gray-800/60 transition-colors ${rowBgClass}`}
                    >
                      {/* Index */}
                      <td className="sticky left-0 z-10 bg-gray-950 px-2 py-2 border-r border-gray-800 text-center text-gray-500 font-sans text-xs">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="sticky left-10 z-10 bg-gray-950 px-3 py-2 border-r border-gray-800 text-white font-sans font-medium min-w-[170px] max-w-[210px] truncate">
                        {user.fullname || "—"}
                      </td>

                      {/* Reg No */}
                      <td className="sticky left-[210px] z-10 bg-gray-950 px-3 py-2 border-r border-gray-800 font-mono text-emerald-400 font-medium whitespace-nowrap min-w-[120px]">
                        {user.regno}
                      </td>

                      {/* Session */}
                      <td className="sticky left-[330px] z-10 bg-gray-950 px-3 py-2 border-r border-gray-800 text-center text-gray-400 font-sans text-xs whitespace-nowrap min-w-[90px]">
                        {user.session || "—"}
                      </td>

                      {/* 7 Payment Cells with 2-Step Badges */}
                      {activeSemesters.map((semKey) => {
                        const rec = user.payments[semKey];
                        const isTxVerified = Boolean(rec?.transaction_verified);
                        const isAccepted =
                          rec?.status === SocietyFeeStatus.VERIFIED;
                        const isFullyCleared = isTxVerified && isAccepted;

                        const verifierName = rec?.verifier_name;
                        const accepterName = rec?.accepter_name;
                        const sameAdmin =
                          verifierName &&
                          accepterName &&
                          verifierName === accepterName;

                        return (
                          <td
                            key={semKey}
                            onClick={() =>
                              onSelectCell({
                                user,
                                semester_key: semKey,
                                record: rec,
                              })
                            }
                            className={`px-2 py-1.5 text-center border-r border-gray-800/70 whitespace-nowrap cursor-pointer transition-colors ${
                              isFullyCleared
                                ? "bg-emerald-950/40 text-emerald-300 font-medium hover:bg-emerald-800/40"
                                : isTxVerified
                                  ? "bg-amber-950/40 text-amber-300 hover:bg-amber-800/40"
                                  : "text-rose-400/60 hover:bg-rose-950/50"
                            }`}
                            title="Click to perform 2-Step Verification"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              {/* Step 1 Badge */}
                              {isTxVerified ? (
                                <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                                  Tx Verified ✓
                                </span>
                              ) : // <span className="text-[9px] text-rose-400/70 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-900/60">
                              //   Tx Unverified
                              // </span>
                              null}

                              {/* Step 2 Badge */}
                              {isAccepted ? (
                                <span className="text-[10px] font-bold text-emerald-300">
                                  Accepted ৳
                                  {rec?.amount || DEFAULT_SEMESTER_FEES[semKey]}
                                </span>
                              ) : rec && isTxVerified ? (
                                <span className="text-[10px] text-amber-400">
                                  Pending ৳
                                  {rec?.amount || DEFAULT_SEMESTER_FEES[semKey]}
                                </span>
                              ) : (
                                <span className="text-[10px] text-rose-400/60">
                                  Unpaid ৳{DEFAULT_SEMESTER_FEES[semKey]}
                                </span>
                              )}

                              {/* {sameAdmin ? (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSelectAdminProfile({
                                      fullname: rec!.verifier_name || null,
                                      regno: rec!.verifier_regno || "N/A",
                                      profile_picture: rec!.verifier_profile_picture,
                                      role: rec!.verifier_role,
                                      actionTitle: "Verified & Accepted By",
                                    });
                                  }}
                                  className="text-[9px] text-indigo-300 hover:text-white underline cursor-pointer truncate max-w-[110px]"
                                  title="Click to view verifier & accepter profile"
                                >
                                  by {rec!.verifier_name}
                                </span>
                              ) : (
                                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                                  {verifierName && (
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectAdminProfile({
                                          fullname: rec!.verifier_name || null,
                                          regno: rec!.verifier_regno || "N/A",
                                          profile_picture: rec!.verifier_profile_picture,
                                          role: rec!.verifier_role,
                                          actionTitle: "Verified Transaction By",
                                        });
                                      }}
                                      className="text-[9px] text-emerald-400 hover:underline cursor-pointer truncate max-w-[110px]"
                                      title="Click to view verifier profile"
                                    >
                                      Verified by {verifierName}
                                    </span>
                                  )}
                                  {accepterName && (
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectAdminProfile({
                                          fullname: rec!.accepter_name || null,
                                          regno: rec!.accepter_regno || "N/A",
                                          profile_picture: rec!.accepter_profile_picture,
                                          role: rec!.accepter_role,
                                          actionTitle: "Accepted Payment By",
                                        });
                                      }}
                                      className="text-[9px] text-indigo-300 hover:underline cursor-pointer truncate max-w-[110px]"
                                      title="Click to view accepter profile"
                                    >
                                      Accepted by {accepterName}
                                    </span>
                                  )}
                                </div>
                              )} */}
                            </div>
                          </td>
                        );
                      })}

                      {/* Remarks */}
                      <td className="px-3 py-2 text-center border-l border-gray-800 font-sans text-xs">
                        {allCleared ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Cleared
                          </span>
                        ) : clearedCount === 0 ? (
                          <span className="inline-flex items-center gap-1 text-rose-400 font-medium px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900">
                            <XCircle className="w-3 h-3" /> ৳
                            {rowDueAmount.toLocaleString()} Due
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-950/60 border border-amber-900">
                            <AlertCircle className="w-3 h-3" /> ৳
                            {rowDueAmount.toLocaleString()} Due
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}

          {sortedBatchKeys.length === 0 && (
            <tr>
              <td
                colSpan={5 + activeSemesters.length}
                className="py-12 text-center text-gray-500 font-sans"
              >
                No matching students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
