import { cookies } from "next/headers";
import {
  getAllElections,
  getCommitteeData,
  getExecutiveCommittees,
} from "./actions";
import ElectionCommitteeView from "./components/ElectionCommittee";

export default async function Page() {
  const userRole = cookies().get("userrole")?.value ?? "";
  const [initialElections, initialCommitteeData, initialExecutiveCommittees] =
    await Promise.all([
      getAllElections(),
      getCommitteeData(),
      getExecutiveCommittees(),
    ]);

  return (
    <ElectionCommitteeView
      initialElections={initialElections}
      userRole={userRole}
      initialCommitteeData={initialCommitteeData}
      initialExecutiveCommittees={initialExecutiveCommittees}
    />
  );
}