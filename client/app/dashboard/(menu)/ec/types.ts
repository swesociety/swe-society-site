export type ElectionCommittee = {
  electionid: number;
  year?: string;
  election_type?: string;
  batch?: string;
  candidatereg_start?: Date | string;
  candidatereg_end?: Date | string;
  election_start?: Date | string;
  election_end?: Date | string;
  election_commissioner?: number;
  assistant_commissioner?: number;
  commissioner_userid?: number;
  commissioner_fullname?: string;
  commissioner_email?: string;
  commissioner_profile_picture?: string;
  assistant_userid?: number;
  assistant_fullname?: string;
  assistant_email?: string;
  assistant_profile_picture?: string;
  election_name?: string;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  created_at?: string | null;
};

export type ElectionCommitteeListResponse = ElectionCommittee[];

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

export interface CommitteeMemberInput {
  userid: number;
  postid: number;
  executive_committeeid: number;
  service_start: string;
  service_end: string;
  electionid?: number;
}

export interface ElectionFormInput {
  year: string;
  election_type: string;
  batch?: string;
  election_commissioner?: number;
  assistant_commissioner?: number;
  candidatereg_start?: string;
  candidatereg_end?: string;
  election_start?: string;
  election_end?: string;
}

