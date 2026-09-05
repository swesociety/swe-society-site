export type PaymentType = {
  payment_typeid: number;
  payment_type: string;
  year: string;
  subtype: string;
  amount: number;
  method: string[];
  created_at?: string;
};

export enum PaymentTypeOption {
  SocietyFee = "Society Fee",
  Sponsorship = "Sponsorship",
  FundRising = "Fund Rising",
}

export type MethodOption = {
  payment_methodid: number;
  method_name: string;
  transaction_account: string;
  account_holder: string;
};

export type SortField = "payment_type" | "year" | "created_at";
export type SortDirection = "asc" | "desc";

export const getMethodLabel = (method: MethodOption) =>
  `${method.method_name}- ${method.transaction_account} - ${method.account_holder}`;