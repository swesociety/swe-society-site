import { getAllUsersServer } from "./actions";
import Members from "./components/Members";

export default async function Page() {
  const initialMembers = await getAllUsersServer();

  return <Members initialMembers={initialMembers} />;
}