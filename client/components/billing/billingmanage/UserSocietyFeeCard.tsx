"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { RefreshCw } from "lucide-react";
import { APIENDPOINTS } from "@/data/urls";
import { getUserID } from "@/data/cookies/getCookies";
import { headerConfig } from "@/lib/header_config";
import { AdminProfileDialog, AdminProfileInfo } from "./AdminProfileDialog";
import { UserSocietyFeeBreakdownTable } from "./UserSocietyFeeBreakdownTable";
import { UserSocietyFeeSummary } from "./UserSocietyFeeSummary";
import { UserSocietyFeeResponse } from "./UserSocietyFeeTypes";

export const UserSocietyFeeCard: React.FC = () => {
  const userId = getUserID();
  const [data, setData] = useState<UserSocietyFeeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminProfileInfo | null>(
    null,
  );

  const fetchUserSocietyFee = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await axios.get<UserSocietyFeeResponse>(
        `${APIENDPOINTS.societyFee.getIndiUserSocietyFee}/${userId}`,
        headerConfig(),
      );
      setData(response.data);
    } catch (error) {
      console.error("Error fetching user society fee:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchUserSocietyFee();
  }, [fetchUserSocietyFee]);

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center text-gray-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        Loading 2-step society fee verification information…
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-full bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-4 shadow-lg">
      <UserSocietyFeeSummary data={data} />
      <UserSocietyFeeBreakdownTable
        breakdown={data.breakdown}
        onSelectAdmin={setSelectedAdmin}
      />
      <AdminProfileDialog
        open={Boolean(selectedAdmin)}
        onOpenChange={(open) => !open && setSelectedAdmin(null)}
        adminInfo={selectedAdmin}
      />
    </div>
  );
};
