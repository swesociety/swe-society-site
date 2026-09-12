'use server';

import axios from 'axios';
import { getAxiosErrorResult } from '@/lib/axiosError';
import { SocietyFeeApiResponse } from '@/components/billing/billingmanage/types';
import { UserSocietyFeeResponse } from './types/UserSocietyFeeTypes';

export const getSocietyFeeData = async (
  url: string,
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.get<SocietyFeeApiResponse>(url, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching society fee data: ', error);
    return getAxiosErrorResult(error);
  }
};

export const batchUpdateSocietyFeeStatus = async (
  url: string,
  requestBody: { action: 'verify_all' | 'accept_all'; societyFeeIds: number[] },
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.put<{ updatedCount: number }>(
      url,
      requestBody,
      config,
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating society fee status: ', error);
    return getAxiosErrorResult(error);
  }
};

export const getUserSocietyFee = async (
  url: string,
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.get<UserSocietyFeeResponse>(url, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching user society fee: ', error);
    return getAxiosErrorResult(error);
  }
};

export const saveSocietyFeeRecord = async (
  url: string,
  requestBody: Record<string, unknown>,
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.post(url, requestBody, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error saving society fee record: ', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteSocietyFeeRecord = async (
  url: string,
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.delete(url, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting society fee record: ', error);
    return getAxiosErrorResult(error);
  }
};
