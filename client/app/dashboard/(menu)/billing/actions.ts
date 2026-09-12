'use server';

import axios from 'axios';
import { APIENDPOINTS } from '@/data/urls';

export const getUserPaymentsServer = async (userId: string, token: string) => {
  if (!userId) return [];
  try {
    const response = await axios.get(
      `${APIENDPOINTS.billing.getIndiUserPayments}/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return [];
  }
};
