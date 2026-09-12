import { cookies } from "next/headers";
import Achievement from "./components/Achievement";
import { getAchievementByUserId } from "./actions";

export default async function Page() {
 const userId = cookies().get("uid")?.value ?? "";

const achievements = await getAchievementByUserId(userId);

  return <Achievement Achievement={achievements} />;
}

