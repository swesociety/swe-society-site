'use server';

import axios from 'axios';
import { APIENDPOINTS } from '@/data/urls';
import { getAxiosErrorResult } from '@/lib/axiosError';
import type { MemberDataType } from '@/data/types';

import type { AxiosRequestConfig } from 'axios';

export const getAllUsersServer = async (): Promise<MemberDataType[]> => {
  try {
    const response = await axios.get(APIENDPOINTS.users.getAllUsers);
    return response.data;
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const getUserById = async (userId: number) => {
  try {
    const response = await axios.get(
      `${APIENDPOINTS.users.getUserbyID}/${userId}`,
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching user details:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateUser = async (
  userId: number,
  data: Partial<import('@/data/types').UserProfile>,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.users.updateUserbyID}/${userId}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating user:', error);
    return getAxiosErrorResult(error);
  }
};

export const sendUserCredentials = async (regno: string, nemail: string) => {
  try {
    const response = await axios.post(APIENDPOINTS.auth.sendUserCreds, {
      regno,
      nemail,
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error sending user credentials:', error);
    return getAxiosErrorResult(error);
  }
};

export const getRoles = async (config: AxiosRequestConfig) => {
  try {
    const response = await axios.get(APIENDPOINTS.role.getRoleInfo, config);
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return getAxiosErrorResult(error);
  }
};

export const createMultipleMembers = async (
  members: Partial<MemberDataType>[],
  config: AxiosRequestConfig,
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
  config: AxiosRequestConfig,
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
