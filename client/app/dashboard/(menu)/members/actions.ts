'use server';

import axios from 'axios';
import { APIENDPOINTS } from '@/data/urls';
import { getAxiosErrorResult } from '@/lib/axiosError';

export const getRoles = async (config: Record<string, unknown>) => {
  try {
    const response = await axios.get(APIENDPOINTS.role.getRoleInfo, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return getAxiosErrorResult(error);
  }
};

export const createMultipleMembers = async (
  members: unknown[],
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.auth.createMultiuser,
      members,
      config,
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating members:', error);
    return getAxiosErrorResult(error);
  }
};

export const assignRole = async (
  userIds: number[],
  roleId: number,
  config: Record<string, unknown>,
) => {
  try {
    const response = await axios.put(
      APIENDPOINTS.role.assignRole,
      { roleid: roleId, userIds },
      config,
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error assigning role:', error);
    return getAxiosErrorResult(error);
  }
};
