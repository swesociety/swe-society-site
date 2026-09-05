import ElectionPortal from "@/components/election/ElectionPortal";
import { getElections } from "./actions";

export default async function ElectionPage() {
  const initialElections = await getElections();
  return <ElectionPortal initialElections={initialElections} />;
}
