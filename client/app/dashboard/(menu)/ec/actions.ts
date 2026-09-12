'use server';

import { APIENDPOINTS, BACKENDURL } from '@/data/urls';
import { decryptArray, encryptObject, reqSalt_keys } from '@/utils/encrypt_req';
import axios from 'axios';
import { getAxiosErrorResult } from '@/lib/axiosError';
import type {
  CommitteeData,
  CommitteeElection,
  CommitteeMember,
  CommitteeMemberInput,
  CommitteePost,
  CommitteeUser,
  ElectionCommitteeListResponse,
  ElectionFormInput,
  ExecutiveCommittee,
} from './types';

export type * from './types';


// ---------------------------------------------------------------------------
// Elections
// ---------------------------------------------------------------------------

export const getAllElections =
  async (): Promise<ElectionCommitteeListResponse> => {
    try {
      const response = await fetch(APIENDPOINTS.election.getAllElection);
      const raw = (await response.json()) as Record<string, string>[];
      const decrypted = decryptArray(raw, reqSalt_keys.election.getAllElection);
      return decrypted as ElectionCommitteeListResponse;
    } catch (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
  };

export const deleteElection = async (url: string, token: string) => {
  try {
    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting election:', error);
    return getAxiosErrorResult(error);
  }
};

export const createElection = async (
  input: ElectionFormInput,
  token: string,
) => {
  try {
    const encrypted = encryptObject(input, reqSalt_keys.election.createElection);
    const response = await axios.post(
      APIENDPOINTS.election.createElection,
      encrypted,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating election:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateElection = async (
  url: string,
  input: Partial<ElectionFormInput>,
  token: string,
) => {
  try {
    const response = await axios.put(url, input, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating election:', error);
    return getAxiosErrorResult(error);
  }
};

// ---------------------------------------------------------------------------
// Committee data (aggregated fetch)
// ---------------------------------------------------------------------------

export const getCommitteeData = async (): Promise<CommitteeData> => {
  const [postsResponse, membersResponse, usersResponse, electionsResponse] =
    await Promise.all([
      axios.get(APIENDPOINTS.election.getAllPosition),
      axios.get(APIENDPOINTS.election.getAllCommitteeMembers),
      axios.get(`${BACKENDURL}users/`),
      axios.get(APIENDPOINTS.election.getAllElection),
    ]);

  return {
    posts: postsResponse.data as CommitteePost[],
    members: membersResponse.data as CommitteeMember[],
    users: usersResponse.data as CommitteeUser[],
    elections: decryptArray(
      electionsResponse.data,
      reqSalt_keys.election.getAllElection,
    ) as CommitteeElection[],
  };
};

// ---------------------------------------------------------------------------
// Committee posts
// ---------------------------------------------------------------------------

export const createCommitteePost = async (
  post_name: string,
  token: string,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.election.createPosition,
      { post_name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating committee post:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateCommitteePost = async (
  committeepostid: number,
  post_name: string,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.election.updatePosition}/${committeepostid}`,
      { post_name },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating committee post:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteCommitteePost = async (
  committeepostid: number,
  token: string,
) => {
  try {
    const response = await axios.delete(
      `${APIENDPOINTS.election.deletePosition}/${committeepostid}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting committee post:', error);
    return getAxiosErrorResult(error);
  }
};

// ---------------------------------------------------------------------------
// Committee members
// ---------------------------------------------------------------------------

export const createCommitteeMember = async (
  input: CommitteeMemberInput,
  token: string,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.election.createCommitteeMember,
      input,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating committee member:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateCommitteeMember = async (
  committeeid: number,
  input: CommitteeMemberInput,
  token: string,
) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.election.updateCommitteeMember}/${committeeid}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating committee member:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteCommitteeMember = async (
  committeeid: number,
  token: string,
) => {
  try {
    const response = await axios.delete(
      `${APIENDPOINTS.election.deleteCommitteeMember}/${committeeid}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting committee member:', error);
    return getAxiosErrorResult(error);
  }
};

export const createLegacyCommitteeMember = async (
  member: { userid: number; postid: number; electionid: number },
  token: string,
) => {
  try {
    const response = await axios.post(
      `${BACKENDURL}election/members/create`,
      member,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating legacy committee member:', error);
    return getAxiosErrorResult(error);
  }
};

// ---------------------------------------------------------------------------
// Executive committees
// ---------------------------------------------------------------------------

export const getExecutiveCommittees = async (): Promise<
  ExecutiveCommittee[]
> => {
  try {
    const response = await axios.get(
      APIENDPOINTS.election.getAllExecutiveCommittees,
    );
    return response.data as ExecutiveCommittee[];
  } catch (error) {
    console.error('Error fetching executive committees:', error);
    return [];
  }
};

export const createExecutiveCommittee = async (
  input: { committee_name: string; year: string },
  token: string,
) => {
  try {
    const response = await axios.post(
      APIENDPOINTS.election.createExecutiveCommittee,
      input,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error creating executive committee:', error);
    return getAxiosErrorResult(error);
  }
};

export const updateExecutiveCommittee = async (
  committeeid: number,
  input: { committee_name: string; year: string },
  token: string,
) => {
  try {
    const response = await axios.put(
      `${APIENDPOINTS.election.updateExecutiveCommittee}/${committeeid}`,
      input,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating executive committee:', error);
    return getAxiosErrorResult(error);
  }
};

export const deleteExecutiveCommittee = async (
  committeeid: number,
  token: string,
) => {
  try {
    const response = await axios.delete(
      `${APIENDPOINTS.election.deleteExecutiveCommittee}/${committeeid}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error deleting executive committee:', error);
    return getAxiosErrorResult(error);
  }
};

// ---------------------------------------------------------------------------
// Users (for dropdowns)
// ---------------------------------------------------------------------------

export const getUsers = async (): Promise<CommitteeUser[]> => {
  try {
    const response = await fetch(`${BACKENDURL}users/`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return (await response.json()) as CommitteeUser[];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};
