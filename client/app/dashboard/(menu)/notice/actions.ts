'use server';

import { APIENDPOINTS } from '@/data/urls';
import { getAxiosErrorResult } from '@/lib/axiosError';
import axios from 'axios';
import type { NoticeListResponse, NoticeFormValues } from './types';

export const getAllNotices = async (): Promise<NoticeListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.notice.getAllNotice, {
      cache: 'no-store',
    });
    const data = (await response.json()) as NoticeListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
};

export const fetchAllNotices = async (token: string) => {
  try {
    const response = await axios.get<NoticeListResponse>(
      APIENDPOINTS.notice.getAllNotice,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching notices:', error);
    return getAxiosErrorResult(error);
  }
};

export const createNotice = async (body: NoticeFormValues, token: string) => {
  try {
    const response = await axios.post(APIENDPOINTS.notice.createNotice, body, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating notice:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateNotice = async (
  id: number,
  body: NoticeFormValues,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.notice.updateNotice}${id}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating notice:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteNoticeById = async (id: number, token: string) => {
  try {
    const response = await axios.delete(
      `${APIENDPOINTS.notice.delNoticebyID}/${id}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting notice:', error);
    return getAxiosErrorResult(error);
  }
};
