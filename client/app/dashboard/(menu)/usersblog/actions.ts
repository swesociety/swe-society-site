'use server';

import { BACKENDURL } from '@/data/urls';
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
