'use server';

import { BACKENDURL } from '@/data/urls';
import axios from 'axios';
import { getAxiosErrorResult } from '@/lib/axiosError';

export interface ChangePasswordPayload {
  regno: string;
  oldpass: string;
  newpass: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${BACKENDURL}auth/changePassword`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error changing password: ', error);
    return getAxiosErrorResult(error);
  }
};
