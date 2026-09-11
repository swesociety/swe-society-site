"use server";

import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import type { AchievementListResponse } from "./types";

export const getAchievementByUserId = async (id: string): Promise<AchievementListResponse> => {
 try{
   const response = await fetch(`${BACKENDURL}achievement/individual/${id}`);
   const data = (await response.json()) as AchievementListResponse;
   return Array.isArray(data) ? data : [];
 }catch (error) {
  console.error("Error fetching data: ", error);
  return [];
 }
}

export const deleteAchievementById = async (id: string, token: string) => {
  try {
    const response = await axios.delete(
        `${BACKENDURL}achievement/post/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    return response;
  } catch (error) {
    console.error("Error deleting achievement: ", error);
  }
}

export const updateAchievementById = async (id: string, token: string, isApproved: boolean) => {
  const response = await axios.put(
        `${BACKENDURL}achievement/poststatus/${id}`,
        { approval_status: !isApproved },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  return response;
}
