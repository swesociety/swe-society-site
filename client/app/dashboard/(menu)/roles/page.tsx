import { cookies } from "next/headers";
import { getRoles } from "./actions";
import Roles from "./components/Roles";

export default async function Page() {
  const token = cookies().get("jwt")?.value ?? "";
  const initialRoles = await getRoles(token);

  return <Roles initialRoles={initialRoles} />;
}