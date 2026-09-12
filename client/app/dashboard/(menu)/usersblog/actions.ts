'use server';

import { BACKENDURL } from '@/data/urls';
import { getAxiosErrorResult } from '@/lib/axiosError';
import axios from 'axios';
import type { BlogListResponse } from '@/app/dashboard/(menu)/blog/types';

export const getUserBlogs = async (
  userId: string,
): Promise<BlogListResponse> => {
  try {
    const response = await fetch(`${BACKENDURL}blog/userblog/${userId}`);
    const data = (await response.json()) as BlogListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return [];
  }
};

export const fetchUserBlogs = async (userId: string, token: string) => {
  try {
    const response = await axios.get<BlogListResponse>(
      `${BACKENDURL}blog/userblog/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteBlogById = async (id: number, token: string) => {
  try {
    const response = await axios.delete(`${BACKENDURL}blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return getAxiosErrorResult(error);
  }
};
