import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS, BACKENDURL } from "@/data/urls";
import { decryptArray, reqSalt_keys } from "@/utils/encrypt_req";
import axios from "axios";

export interface CommitteePost {
  committeepostid: number;
  post_name: string;
}

export interface CommitteeUser {
  userid: number;
  fullname: string;
  regno: string;
}

export interface CommitteeElection {
  electionid: number;
  year: string;
  election_type: string;
  batch: string;
}

export interface CommitteeMember {
  committeeid: number;
  userid: number;
  postid: number;
  electionid: number;
  executive_committeeid: number;
  service_start?: string | null;
  service_end?: string | null;
  fullname: string;
  regno: string;
  profile_picture?: string | null;
  post_name: string;
  executive_committee_name: string;
  executive_committee_year: string;
  year: string;
  election_type: string;
  batch: string;
}

export interface CommitteeData {
  posts: CommitteePost[];
  members: CommitteeMember[];
  users: CommitteeUser[];
  elections: CommitteeElection[];
}

export interface ExecutiveCommittee {
  committeeid: number;
  committee_name: string;
  year: string;
  created_at?: string;
}

const authConfig = () => ({
  headers: { Authorization: `Bearer ${getJWT()}` },
});

export async function getCommitteeData(): Promise<CommitteeData> {
  const [postsResponse, membersResponse, usersResponse, electionsResponse] =
    await Promise.all([
      axios.get(APIENDPOINTS.election.getAllPosition),
      axios.get(APIENDPOINTS.election.getAllCommitteeMembers),
      axios.get(`${BACKENDURL}users/`),
      axios.get(APIENDPOINTS.election.getAllElection),
    ]);

  return {
    posts: postsResponse.data,
    members: membersResponse.data,
    users: usersResponse.data,
    elections: decryptArray(
      electionsResponse.data,
      reqSalt_keys.election.getAllElection,
    ) as CommitteeElection[],
  };
}

export async function createCommitteePost(post_name: string) {
  return axios.post(
    APIENDPOINTS.election.createPosition,
    { post_name },
    authConfig(),
  );
}

export async function updateCommitteePost(
  committeepostid: number,
  post_name: string,
) {
  return axios.put(
    `${APIENDPOINTS.election.updatePosition}/${committeepostid}`,
    { post_name },
    authConfig(),
  );
}

export async function removeCommitteePost(committeepostid: number) {
  return axios.delete(
    `${APIENDPOINTS.election.deletePosition}/${committeepostid}`,
    authConfig(),
  );
}

export interface CommitteeMemberInput {
  userid: number;
  postid: number;
  executive_committeeid: number;
  service_start: string;
  service_end: string;
  electionid?: number;
}

export async function createCommitteeMember(input: CommitteeMemberInput) {
  return axios.post(
    APIENDPOINTS.election.createCommitteeMember,
    input,
    authConfig(),
  );
}

export async function updateCommitteeMember(
  committeeid: number,
  input: CommitteeMemberInput,
) {
  return axios.put(
    `${APIENDPOINTS.election.updateCommitteeMember}/${committeeid}`,
    input,
    authConfig(),
  );
}

export async function removeCommitteeMember(committeeid: number) {
  return axios.delete(
    `${APIENDPOINTS.election.deleteCommitteeMember}/${committeeid}`,
    authConfig(),
  );
}

export async function getExecutiveCommittees(): Promise<ExecutiveCommittee[]> {
  const response = await axios.get(APIENDPOINTS.election.getAllExecutiveCommittees);
  return response.data;
}

export async function createExecutiveCommittee(input: {
  committee_name: string;
  year: string;
}) {
  return axios.post(
    APIENDPOINTS.election.createExecutiveCommittee,
    input,
    authConfig(),
  );
}

export async function updateExecutiveCommittee(
  committeeid: number,
  input: { committee_name: string; year: string },
) {
  return axios.put(
    `${APIENDPOINTS.election.updateExecutiveCommittee}/${committeeid}`,
    input,
    authConfig(),
  );
}

export async function removeExecutiveCommittee(committeeid: number) {
  return axios.delete(
    `${APIENDPOINTS.election.deleteExecutiveCommittee}/${committeeid}`,
    authConfig(),
  );
}
