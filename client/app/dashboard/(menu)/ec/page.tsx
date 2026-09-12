import { cookies } from "next/headers";
import { getAllElections } from "./actions";
import ElectionCommitteeView from "./components/ElectionCommittee";

export default async function Page() {
  const userRole = cookies().get("userrole")?.value ?? "";
  const initialElections = await getAllElections();

  return (
    <ElectionCommitteeView
      initialElections={initialElections}
      userRole={userRole}
    />
  );
}