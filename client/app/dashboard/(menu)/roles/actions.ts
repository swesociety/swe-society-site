"use server";

import { APIENDPOINTS } from "@/data/urls";
import type { RoleDataListResponse } from "./types";

export const getRoles = async (token: string): Promise<RoleDataListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.role.getRoleInfo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as RoleDataListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
};
