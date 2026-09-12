'use server';

import { APIENDPOINTS, BACKENDURL } from '@/data/urls';
import { Role } from '@/data/types';
import { getAxiosErrorResult } from '@/lib/axiosError';
import axios from 'axios';
import type { RoleData, RoleDataListResponse } from './types';

// ── helpers ──────────────────────────────────────────────────────────────────
const authHeader = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ── queries ───────────────────────────────────────────────────────────────────

export const getRoles = async (token: string): Promise<RoleDataListResponse> => {
  try {
    const response = await fetch(APIENDPOINTS.role.getRoleInfo, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as RoleDataListResponse;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const getRoleById = async (id: number, token: string) => {
  try {
    const response = await axios.get<Role>(
      `${APIENDPOINTS.role.getRole}/${id}`,
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching role by id:', error);
    return getAxiosErrorResult(error);
  }
};

export const fetchRoles = async (token: string) => {
  try {
    const response = await axios.get<RoleData[]>(
      APIENDPOINTS.role.getRoleInfo,
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching roles:', error);
    return getAxiosErrorResult(error);
  }
};

// ── mutations ─────────────────────────────────────────────────────────────────

export const createRole = async (
  roleData: Omit<Role, 'roleid'>,
  token: string,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.role.createRole,
      roleData,
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating role:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateRole = async (role: Role, token: string) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.role.updateRole}/${role.roleid}`,
      role,
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating role:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateDefaultRole = async (id: number, token: string) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.role.updateDefaultRole}/${id}`,
      {},
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating default role:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteRole = async (id: number, token: string) => {
  try {
    const response = await axios.delete(
      `${BACKENDURL}role/${id}`,
      authHeader(token),
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting role:', error);
    return getAxiosErrorResult(error);
  }
};
