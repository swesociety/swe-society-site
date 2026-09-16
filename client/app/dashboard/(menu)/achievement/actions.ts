'use server';

import { BACKENDURL } from '@/data/urls';
import axios from 'axios';
import type { AchievementListResponse, FormDataType } from './types';
import { getAxiosErrorResult } from '@/lib/axiosError';

export interface AchievementUser {
  userid: number;
  regno: string;
}

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

export const getAchievementUsers = async (): Promise<AchievementUser[]> => {
  try {
    const response = await fetch(`${BACKENDURL}users/`);
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = (await response.json()) as AchievementUser[];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching achievement users: ', error);
    return [];
  }
};

export const createAchievement = async (
  requestBody: Partial<FormDataType>,
  token: string,
) => {
  try {
    const response = await axios.post(
      `${BACKENDURL}achievement/post/fullachievement`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating achievement: ', error);
    return getAxiosErrorResult(error);
  }
};

export const editAchievementById = async (
  id: string,
  requestBody: Partial<FormDataType>,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${BACKENDURL}achievement/post/${id}`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error editing achievement: ', error);
    return getAxiosErrorResult(error);
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
