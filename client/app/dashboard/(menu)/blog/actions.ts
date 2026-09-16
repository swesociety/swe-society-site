'use server';

import { APIENDPOINTS, BACKENDURL } from '@/data/urls';
import type { BlogListResponse } from './types';
import axios from 'axios';
import { getJWT } from '@/data/cookies/getCookies';

export const getAllBlogs = async (): Promise<BlogListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.blogs.getAllBlog, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch blogs: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as BlogListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};

export const updateBlogApprovalStatusById = async (
  id: number,
  token: string,
  isApproved: boolean,
) => {
  try {
    const response = await axios.put(
      `${BACKENDURL}blog/status/${id}`,
      { approval_status: !isApproved },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return {
      response,
      success: true,
      message: 'Approval status updated successfully',
    };
  } catch (error) {
    console.error('Error updating approval status:', error);
    return {
      response: null,
      success: false,
      message: 'Error updating approval status',
    };
  }
};

export const deleteBlogById = async (id: number, token: string) => {
  try {
    const response = await axios.delete(`${BACKENDURL}blog/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      response,
      success: true,
      message: 'Blog deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting blog:', error);
    return {
      response: null,
      success: false,
      message: 'Error deleting blog',
    };
  }
};
