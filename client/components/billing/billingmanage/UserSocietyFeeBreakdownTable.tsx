"use client";

import {
  CheckCircle2,
  Clock,
  FileCheck2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { AdminProfileInfo } from "./AdminProfileDialog";
import { UserSocietyFeeBreakdown } from "./UserSocietyFeeTypes";

interface UserSocietyFeeBreakdownTableProps {
  breakdown: UserSocietyFeeBreakdown[];
  onSelectAdmin: (admin: AdminProfileInfo) => void;
}

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

export const UserSocietyFeeBreakdownTable = ({
  breakdown,
  onSelectAdmin,
}: UserSocietyFeeBreakdownTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-gray-800">
    <table className="min-w-full text-xs text-left font-mono">
      <thead className="bg-gray-900 text-gray-300 border-b border-gray-800">
        <tr>
          {[
            "#",
            "Semester",
            "Amount",
            "Verification Status",
            "Payment Status",
            "Audited By (Admin)",
            "Date",
          ].map((heading) => (
            <th key={heading} className="p-2.5 border-r border-gray-800">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {breakdown.map((item, index) => {
          const record = item.record;
          const sameAdmin =
            record?.verifier_name &&
            record?.accepter_name &&
            record.verifier_name === record.accepter_name;
          const admin = (
            type: "verifier" | "accepter",
            title: string,
          ): AdminProfileInfo => ({
            fullname:
              type === "verifier"
                ? record?.verifier_name || null
                : record?.accepter_name || null,
            regno:
              type === "verifier"
                ? record?.verifier_regno || "N/A"
                : record?.accepter_regno || "N/A",
            profile_picture:
              type === "verifier"
                ? record?.verifier_profile_picture
                : record?.accepter_profile_picture,
            role:
              type === "verifier"
                ? record?.verifier_role
                : record?.accepter_role,
            committee_memberships:
              type === "verifier"
                ? record?.verifier_committee_memberships
                : record?.accepter_committee_memberships,
            actionTitle: title,
          });
          const rowClass = item.isFullyCleared
            ? "bg-emerald-950/20"
            : item.transaction_verified
              ? "bg-amber-950/20"
              : "bg-rose-950/20";
          return (
            <tr
              key={item.semester_key}
              className={`border-b border-gray-800/60 ${rowClass}`}
            >
              <td className="p-2.5 border-r border-gray-800 text-gray-500 font-sans">
                {index + 1}
              </td>
              <td className="p-2.5 border-r border-gray-800 font-semibold text-white font-sans">
                {item.semester_key === "1/1 & 1/2"
                  ? "1/1 & 1/2 (Paired 1st Year + Admission)"
                  : `Semester ${item.semester_key}`}
              </td>
              <td className="p-2.5 border-r border-gray-800 text-emerald-400 font-semibold">
                ৳ {record?.amount ?? item.default_amount}
              </td>
              <td className="p-2.5 border-r border-gray-800 font-sans">
                {item.transaction_verified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    Tx Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    Unverified
                  </span>
                )}
              </td>
              <td className="p-2.5 border-r border-gray-800 font-sans">
                {item.payment_status === "Verified" ? (
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accepted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Pending
                  </span>
                )}
              </td>
              <td className="p-2.5 border-r border-gray-800 font-sans">
                {sameAdmin ? (
                  <button
                    onClick={() =>
                      onSelectAdmin(admin("verifier", "Verified & Accepted By"))
                    }
                    className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-white underline underline-offset-2"
                  >
                    <UserCheck className="w-3 h-3 text-indigo-400" />
                    Verified & Accepted by {record?.verifier_name}
                  </button>
                ) : (
                  <div className="flex flex-col gap-1 text-[11px]">
                    {record?.verifier_name && (
                      <button
                        onClick={() =>
                          onSelectAdmin(
                            admin("verifier", "Verified Transaction By"),
                          )
                        }
                        className="text-left text-emerald-400 hover:underline"
                      >
                        Verified by: {record.verifier_name}
                      </button>
                    )}
                    {record?.accepter_name && (
                      <button
                        onClick={() =>
                          onSelectAdmin(
                            admin("accepter", "Accepted Payment By"),
                          )
                        }
                        className="text-left text-emerald-300 hover:underline"
                      >
                        Accepted by: {record.accepter_name}
                      </button>
                    )}
                    {!record?.verifier_name && !record?.accepter_name && (
                      <span className="text-gray-500 italic">Unassigned</span>
                    )}
                  </div>
                )}
              </td>
              <td className="p-2.5 text-gray-400 font-sans">
                {formatDate(record?.created_at)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
