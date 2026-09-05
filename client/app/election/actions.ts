import { APIENDPOINTS } from "@/data/urls";
import { decryptArray, reqSalt_keys } from "@/utils/encrypt_req";
import { ElectionItem } from "@/components/election/ElectionPortal";

export async function getElections(): Promise<ElectionItem[]> {
  try {
    const res = await fetch(APIENDPOINTS.election.getAllElection, {
      cache: "no-store",
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    const decrypted = decryptArray(
      data,
      reqSalt_keys.election.getAllElection
    ) as ElectionItem[];

    return (decrypted || []).sort(
      (a, b) => Number(b.year) - Number(a.year)
    );
  } catch (error) {
    console.error("Error fetching elections in actions.ts:", error);
    return [];
  }
}