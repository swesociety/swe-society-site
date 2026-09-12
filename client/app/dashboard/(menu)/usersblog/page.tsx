import { cookies } from "next/headers";
import { getUserBlogs } from "./actions";
import UsersBlog from "./components/UsersBlog";

export default async function Page() {
  const userId = cookies().get("uid")?.value ?? "";
  const initialBlogs = await getUserBlogs(userId);

  return <UsersBlog initialBlogs={initialBlogs} />;
}