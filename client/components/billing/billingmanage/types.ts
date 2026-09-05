export enum SocietyFeeStatus {
  PENDING = "Pending",
  VERIFIED = "Verified",
}

export enum SemesterKey {
  YEAR_1 = "1/1 & 1/2",
  SEM_1_1 = "1/1",
  SEM_1_2 = "1/2",
  SEM_2_1 = "2/1",
  SEM_2_2 = "2/2",
  SEM_3_1 = "3/1",
  SEM_3_2 = "3/2",
  SEM_4_1 = "4/1",
  SEM_4_2 = "4/2",
}

export enum SocietyFeeSemesterKey {
  YEAR_1 = "1/1 & 1/2",
  SEM_2_1 = "2/1",
  SEM_2_2 = "2/2",
  SEM_3_1 = "3/1",
  SEM_3_2 = "3/2",
  SEM_4_1 = "4/1",
  SEM_4_2 = "4/2",
}

export const DEFAULT_SEMESTER_FEES: Record<SocietyFeeSemesterKey, number> = {
  [SocietyFeeSemesterKey.YEAR_1]: 1000,
  [SocietyFeeSemesterKey.SEM_2_1]: 300,
  [SocietyFeeSemesterKey.SEM_2_2]: 300,
  [SocietyFeeSemesterKey.SEM_3_1]: 300,
  [SocietyFeeSemesterKey.SEM_3_2]: 300,
  [SocietyFeeSemesterKey.SEM_4_1]: 300,
  [SocietyFeeSemesterKey.SEM_4_2]: 300,
};

export interface SocietyFeeRecord {
  society_fee_id?: number;
  userid: number;
  semester_key: SemesterKey | string;
  amount: number;
  status: SocietyFeeStatus;
  transaction_verified: boolean;
  transaction_id?: string | null;
  paymentid?: number | null;
  payment_amount?: number | null;
  payment_status?: boolean | null;
  transaction_slip?: string | null;
  payment_created_at?: string | null;
  method_name?: string | null;
  verifier_name?: string | null;
  verifier_regno?: string | null;
  verifier_profile_picture?: string | null;
  verifier_role?: string | null;
  verifier_committee_memberships?: CommitteeMembership[];
  accepter_name?: string | null;
  accepter_regno?: string | null;
  accepter_profile_picture?: string | null;
  accepter_role?: string | null;
  accepter_committee_memberships?: CommitteeMembership[];
  created_at?: string;
}

export interface CommitteeMembership {
  post_name: string;
  committee_name: string;
  committee_year: string;
}

export interface UserSocietyFeeRow {
  userid: number;
  fullname: string | null;
  regno: string;
  session: string | null;
  batch: string;
  payments: Record<string, SocietyFeeRecord | null>;
}

export interface SocietyFeeApiResponse {
  semesters: Array<{ semester_key: SemesterKey; default_amount: number }>;
  users: UserSocietyFeeRow[];
}
