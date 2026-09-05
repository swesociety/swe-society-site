import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import axios from "axios";
import { MethodOption, PaymentType } from "./paymentTypeTypes";

const authConfig = () => ({
  headers: { Authorization: `Bearer ${getJWT()}` },
});

export async function getPaymentTypes(): Promise<PaymentType[]> {
  const response = await axios.get<PaymentType[]>(
    APIENDPOINTS.billing.getAllPaymentTypes,
    authConfig(),
  );
  return response.data;
}

export async function getPaymentMethods(): Promise<MethodOption[]> {
  const response = await axios.get<MethodOption[]>(
    APIENDPOINTS.billing.getAllMethodTypes,
    authConfig(),
  );
  return response.data;
}

export async function createPaymentType(
  payment: Partial<PaymentType>,
): Promise<PaymentType> {
  const response = await axios.post<PaymentType>(
    APIENDPOINTS.billing.createPaymentType,
    payment,
    authConfig(),
  );
  return response.data;
}

export async function updatePaymentType(
  id: number,
  payment: Partial<PaymentType>,
): Promise<PaymentType> {
  const response = await axios.put<PaymentType>(
    `${APIENDPOINTS.billing.updatePaymentType}/${id}`,
    payment,
    authConfig(),
  );
  return response.data;
}

export async function deletePaymentType(id: number): Promise<void> {
  await axios.delete(
    `${APIENDPOINTS.billing.deletePaymentType}/${id}`,
    authConfig(),
  );
}