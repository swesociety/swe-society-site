'use server';

import { APIENDPOINTS } from '@/data/urls';
import { decryptArray, reqSalt_keys } from '@/utils/encrypt_req';
import axios from 'axios';
import { getAxiosErrorResult } from '@/lib/axiosError';
import type { ElectionCommitteeListResponse } from './types';

export const getAllElections =
  async (): Promise<ElectionCommitteeListResponse> => {
    try {
      const response = await fetch(APIENDPOINTS.election.getAllElection);
      const raw = (await response.json()) as Record<string, string>[];
      const decrypted = decryptArray(raw, reqSalt_keys.election.getAllElection);
      return decrypted as ElectionCommitteeListResponse;
    } catch (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
  };

export const deleteElection = async (url: string, token: string) => {
  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting election:', error);
    return getAxiosErrorResult(error);
  }
};
