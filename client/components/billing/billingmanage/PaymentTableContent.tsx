"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { FileCheck2, UserCheck } from "lucide-react";
import { PaymentStatusData } from "./PaymentStatusModal";
import { AdminProfileInfo } from "./AdminProfileDialog";
import { SemesterKey } from "./types";

interface PaymentTableContentProps {
  paginated: PaymentStatusData[];
  filteredCount: number;
  startIndex: number;
  page: number;
  ITEMS_PER_PAGE: number;
  selectedIds: number[];
  isAllPaginatedSelected: boolean;
  onToggleSelectAllPaginated: () => void;
  onToggleSelectRow: (id: number) => void;
  onSetPage: (page: number) => void;
  onSelectDetails: (p: PaymentStatusData) => void;
  onSelectStatusModal: (p: PaymentStatusData) => void;
  onSelectAdminProfile: (info: AdminProfileInfo) => void;
}

export const PaymentTableContent: React.FC<PaymentTableContentProps> = ({
  paginated,
  filteredCount,
  startIndex,
  page,
  ITEMS_PER_PAGE,
  selectedIds,
  isAllPaginatedSelected,
  onToggleSelectAllPaginated,
  onToggleSelectRow,
  onSetPage,
  onSelectDetails,
  onSelectStatusModal,
  onSelectAdminProfile,
}) => {
  return (
    <>
      {/* Main Payment Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-xl bg-gray-950">
        <table className="w-full text-xs border-collapse font-mono">
          <thead className="bg-gray-900 border-b border-gray-800">
            <tr>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-400 w-10">
                <Checkbox
                  checked={isAllPaginatedSelected}
                  onCheckedChange={onToggleSelectAllPaginated}
                  aria-label="Select page rows"
                />
              </th>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-400 w-10">
                #
              </th>
              <th className="p-2.5 border-r border-gray-800 text-left text-gray-300">
                Student Info
              </th>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-300">
                Session
              </th>
              <th className="p-2.5 border-r border-gray-800 text-left text-gray-300">
                Payment Type
              </th>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-300">
                Semester
              </th>
              <th className="p-2.5 border-r border-gray-800 text-right text-gray-300">
                Amount
              </th>
              <th className="p-2.5 border-r border-gray-800 text-left text-gray-300">
                Method
              </th>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-300 min-w-[140px]">
                Step 1: Verification
              </th>
              <th className="p-2.5 border-r border-gray-800 text-center text-gray-300 min-w-[140px]">
                Step 2: Status
              </th>
              <th className="p-2.5 text-center text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => (
              <tr
                key={p.paymentid}
                className="border-b border-gray-800/70 hover:bg-gray-900/60 transition-colors"
              >
                <td className="p-2 border-r border-gray-800 text-center">
                  <Checkbox
                    checked={selectedIds.includes(p.paymentid)}
                    onCheckedChange={() => onToggleSelectRow(p.paymentid)}
                    aria-label={`Select payment ${p.paymentid}`}
                  />
                </td>
                <td className="p-2 border-r border-gray-800 text-center text-gray-500 font-sans">
                  {startIndex + i + 1}
                </td>
                <td className="p-2 border-r border-gray-800 text-white font-sans font-medium">
                  <div className="font-mono text-emerald-400 font-bold">
                    {p.regno}
                  </div>
                  <div className="text-gray-300 text-xs truncate max-w-[160px]">
                    {p.fullname || "—"}
                  </div>
                </td>
                <td className="p-2 border-r border-gray-800 text-center text-gray-400 font-sans">
                  {p.session || "—"}
                </td>
                <td className="p-2 border-r border-gray-800 text-gray-200 font-sans font-medium">
                  {p.payment_type}
                </td>
                <td className="p-2 border-r border-gray-800 text-center text-indigo-300 font-medium">
                  {SemesterKey[p.subtype as keyof typeof SemesterKey] ||
                    p.subtype ||
                    "-"}
                </td>
                <td className="p-2 border-r border-gray-800 text-right font-bold text-white">
                  ৳{p.amount}
                </td>
                <td className="p-2 border-r border-gray-800 text-gray-300 font-sans">
                  {p.method_name}
                </td>

                {/* Step 1: Verification Cell */}
                <td
                  onClick={() => onSelectStatusModal(p)}
                  className="p-2 border-r border-gray-800 text-center cursor-pointer hover:bg-emerald-950/40 transition-colors"
                  title="Click to perform 2-Step Verification"
                >
                  <div className="flex flex-col items-center gap-1">
                    {p.transaction_verified ? (
                      <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]">
                        <FileCheck2 className="w-3 h-3 mr-1 text-emerald-400" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-950 text-rose-300 border-rose-900 text-[10px]">
                        Unverified ❌
                      </Badge>
                    )}

                    {p.transaction_verified && p.verifier_name && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAdminProfile({
                            fullname: p.verifier_name || null,
                            regno: p.verifier_regno || "N/A",
                            profile_picture: p.verifier_profile_picture,
                            role: p.verifier_role,
                            committee_memberships:
                              p.verifier_committee_memberships,
                            actionTitle: "Verified Transaction By",
                          });
                        }}
                        className="text-[9.5px] text-emerald-400 hover:underline cursor-pointer truncate max-w-[120px]"
                        title="Click to view verifier profile"
                      >
                        by {p.verifier_name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Step 2: Acceptance Status Cell */}
                <td
                  onClick={() => onSelectStatusModal(p)}
                  className="p-2 border-r border-gray-800 text-center cursor-pointer hover:bg-emerald-950/40 transition-colors"
                  title="Click to perform 2-Step Verification"
                >
                  <div className="flex flex-col items-center gap-1">
                    {p.payment_status ? (
                      <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[10px]">
                        <UserCheck className="w-3 h-3 mr-1 text-emerald-400" />
                        Accepted
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-950 text-amber-300 border-amber-800 text-[10px]">
                        Pending ⏳
                      </Badge>
                    )}

                    {p.payment_status && p.accepter_name && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAdminProfile({
                            fullname: p.accepter_name || null,
                            regno: p.accepter_regno || "N/A",
                            profile_picture: p.accepter_profile_picture,
                            role: p.accepter_role,
                            committee_memberships:
                              p.accepter_committee_memberships,
                            actionTitle: "Accepted Payment By",
                          });
                        }}
                        className="text-[9.5px] text-indigo-300 hover:underline cursor-pointer truncate max-w-[120px]"
                        title="Click to view accepter profile"
                      >
                        by {p.accepter_name}
                      </span>
                    )}
                  </div>
                </td>

                {/* Action Buttons */}
                <td className="p-2 text-center space-x-1.5 font-sans">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectDetails(p)}
                    className="border-gray-800 text-[11px] h-7 px-2 text-gray-300 hover:bg-gray-800"
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onSelectStatusModal(p)}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] h-7 px-2 font-medium"
                  >
                    Status
                  </Button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="py-12 text-center text-gray-500 font-sans"
                >
                  No payments found matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-between font-sans text-xs text-gray-400">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => onSetPage(page - 1)}
          className="border-gray-800 text-gray-300 hover:bg-gray-800"
        >
          Previous
        </Button>
        <span>
          Page {page} of{" "}
          {Math.max(1, Math.ceil(filteredCount / ITEMS_PER_PAGE))} (
          {filteredCount} total)
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={startIndex + ITEMS_PER_PAGE >= filteredCount}
          onClick={() => onSetPage(page + 1)}
          className="border-gray-800 text-gray-300 hover:bg-gray-800"
        >
          Next
        </Button>
      </div>
    </>
  );
};
