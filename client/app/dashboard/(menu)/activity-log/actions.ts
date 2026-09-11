"use server";

import { APIENDPOINTS } from "@/data/urls";
import { cookies } from "next/headers";
import type { ActivityLogResponse } from "./types";

export const getActivityLogs = async (
  page: number = 1,
  category: string = "all",
  searchAction: string = "",
  statusFilter: string = "all"
): Promise<ActivityLogResponse> => {
  const token = cookies().get("jwt")?.value ?? "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let url = `${APIENDPOINTS.activityLog.getAllLogs}?page=${page}&limit=20`;
  if (category !== "all") url += `&category=${category}`;
  if (searchAction) url += `&action=${encodeURIComponent(searchAction)}`;
  if (statusFilter !== "all") url += `&status=${statusFilter}`;

  try {
    let res = await fetch(url, { headers, cache: "no-store" });
    let isAdminView = true;

    if (res.status === 403) {
      isAdminView = false;
      let myUrl = `${APIENDPOINTS.activityLog.getMyLogs}?page=${page}&limit=20`;
      if (category !== "all") myUrl += `&category=${category}`;
      if (statusFilter !== "all") myUrl += `&status=${statusFilter}`;
      res = await fetch(myUrl, { headers, cache: "no-store" });
    }

    if (!res.ok) {
      return { logs: [], totalPages: 1, total: 0, isAdminView: false };
    }

    const data = await res.json();
    return {
      logs: data.logs || [],
      totalPages: data.totalPages || 1,
      total: data.total || 0,
      isAdminView,
    };
  } catch (err) {
    console.error("Error fetching activity logs:", err);
    return { logs: [], totalPages: 1, total: 0, isAdminView: false };
  }
};
