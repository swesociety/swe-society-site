import ElectionPortal from "@/components/election/ElectionPortal";
import { getElections } from "./actions";

export const dynamic = "force-dynamic";

export default async function ElectionPage() {
  const initialElections = await getElections();
  return <ElectionPortal initialElections={initialElections} />;
}
