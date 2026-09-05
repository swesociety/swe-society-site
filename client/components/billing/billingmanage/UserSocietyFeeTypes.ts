import { SocietyFeeRecord } from "./types";

export interface UserSocietyFeeBreakdown {
  semester_key: string;
  default_amount: number;
  record: SocietyFeeRecord | null;
  transaction_verified: boolean;
  payment_status: "Pending" | "Verified";
  isFullyCleared: boolean;
  isDue: boolean;
}

export interface UserSocietyFeeResponse {
  userId: string;
  totalDue: number;
  totalPaid: number;
  totalLifetimeFee: number;
  breakdown: UserSocietyFeeBreakdown[];
}
