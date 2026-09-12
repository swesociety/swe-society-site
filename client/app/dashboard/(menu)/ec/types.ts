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
