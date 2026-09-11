'use server';

import { APIENDPOINTS } from '@/data/urls';
import type { NoticeListResponse } from './types';

export const getAllNotices = async (): Promise<NoticeListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.notice.getAllNotice);
    const data = (await response.json()) as NoticeListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching notices:', error);
    return [];
  }
};
