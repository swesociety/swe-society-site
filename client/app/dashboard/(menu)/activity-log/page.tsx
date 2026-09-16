import { getActivityLogs } from "./actions";
import ActivityLogComponent from "./components/ActivityLog";

export default async function Page() {
  const initialData = await getActivityLogs();

  return <ActivityLogComponent initialData={initialData} />;
}
