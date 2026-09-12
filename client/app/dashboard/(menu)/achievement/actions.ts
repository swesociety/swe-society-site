'use server';

import { BACKENDURL } from '@/data/urls';
import axios from 'axios';
import type { AchievementListResponse } from './types';
import { getAxiosErrorResult } from '@/lib/axiosError';

export const getAchievementByUserId = async (
  id: string,
): Promise<AchievementListResponse> => {
  try {
    const response = await fetch(`${BACKENDURL}achievement/individual/${id}`);
    const data = (await response.json()) as AchievementListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching data: ', error);
    return [];
  }
};

export const deleteAchievementById = async (id: string, token: string) => {
  try {
    const response = await axios.delete(`${BACKENDURL}achievement/post/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting achievement: ', error);
    return getAxiosErrorResult(error);
  }
};

export const updateAchievementById = async (
  id: string,
  token: string,
  isApproved: boolean,
) => {
  try {
    const response = await axios.put(
      `${BACKENDURL}achievement/poststatus/${id}`,
      { approval_status: !isApproved },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating achievement: ', error);
    return getAxiosErrorResult(error);
  }
};
