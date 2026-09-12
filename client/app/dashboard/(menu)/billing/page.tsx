import { cookies } from "next/headers";
import { getUserPaymentsServer } from "./actions";
import Billing from "./components/Billing";

export default async function Page() {
  const userId = cookies().get("uid")?.value ?? "";
  const token = cookies().get("jwt")?.value ?? "";
  const initialPayments = await getUserPaymentsServer(userId, token);

  return <Billing initialPayments={initialPayments} />;
}