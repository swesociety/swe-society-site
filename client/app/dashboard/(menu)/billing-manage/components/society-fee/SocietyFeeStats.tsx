"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface SocietyFeeStatsProps {
  stats: {
    verified: number;
    pending: number;
    unpaid: number;
  };
}

export const SocietyFeeStats: React.FC<SocietyFeeStatsProps> = ({ stats }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-950/80 p-3 rounded-lg border border-gray-800 text-xs">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300">Fully Cleared</span>
          <Badge
            variant="outline"
            className="text-emerald-400 border-emerald-800 bg-emerald-950/50"
          >
            {stats.verified}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-amber-300">Pending Step 2</span>
          <Badge
            variant="outline"
            className="text-amber-400 border-amber-800 bg-amber-950/50"
          >
            {stats.pending}
          </Badge>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <XCircle className="w-4 h-4 text-rose-400" />
          <span className="text-rose-300">Unpaid / Unverified</span>
          <Badge
            variant="outline"
            className="text-rose-400 border-rose-900 bg-rose-950/50"
          >
            {stats.unpaid}
          </Badge>
        </div>
      </div>

      <div className="text-gray-400 italic">
        💡 Click cell for 2-step verification · Click admin name to view profile
      </div>
    </div>
  );
};
