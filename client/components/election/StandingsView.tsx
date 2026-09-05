"use client";
import { StandingsChart } from "@/components/election/StandingsChart";
import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { decryptArray, reqSalt_keys, xorEncrypt } from "@/utils/encrypt_req";
import { decryptId } from "@/utils/encryption";
import axios from "axios";
import { ShieldOff } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Candidate {
  candidate_id: number;
  marka_name: string;
  slogan: string;
  logo_url: string;
  committeepostid: number;
  candidate_name: string;
  regno: string;
  session: string;
  vote_count: string;
  post_name: string;
}

interface Grouped {
  post_name: string;
  committeepostid: number;
  candidates: Candidate[];
}

type PageState = "loading" | "ok" | "denied" | "error";

export default function StandingsView({ electionParam }: { electionParam: string }) {
  const electionId = decryptId(electionParam, "standing_key") || 0;
  const encryptedElectionId = xorEncrypt(
    electionId.toString(),
    reqSalt_keys.vote.getVoteCountByID
  );

  const [state, setState] = useState<PageState>("loading");
  const [groupedCandidates, setGroupedCandidates] = useState<Grouped[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${APIENDPOINTS.vote.getVoteCountByID}/${encryptedElectionId}`,
          { headers: { Authorization: `Bearer ${getJWT()}` } }
        );
        const decrypted: Record<string, any>[] = decryptArray(
          res.data,
          reqSalt_keys.candidate.getcandidateByID
        );
        const candidates: Candidate[] = decrypted.map((item) => ({
          candidate_id: Number(item.candidate_id),
          marka_name: String(item.marka_name),
          slogan: String(item.slogan),
          logo_url: String(item.logo_url),
          committeepostid: Number(item.committeepostid),
          candidate_name: String(item.candidate_name),
          regno: String(item.regno),
          session: String(item.session),
          vote_count: String(item.vote_count),
          post_name: String(item.post_name),
        }));

        const groupedMap: Record<string, Grouped> = {};
        candidates.forEach((candidate) => {
          if (!groupedMap[candidate.post_name]) {
            groupedMap[candidate.post_name] = {
              post_name: candidate.post_name,
              committeepostid: candidate.committeepostid,
              candidates: [],
            };
          }
          groupedMap[candidate.post_name].candidates.push(candidate);
        });

        const sortedGrouped = Object.values(groupedMap).sort(
          (a, b) => a.committeepostid - b.committeepostid
        );

        setGroupedCandidates(sortedGrouped);
        setState("ok");
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401 || status === 403) {
          setState("denied");
        } else {
          setState("error");
        }
      }
    };

    fetchData();
  }, [electionId]);

  if (state === "loading") {
    return (
      <div className="w-full min-h-[600px] flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShieldOff className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to view election standings. Contact an
          administrator if you believe this is a mistake.
        </p>
        <Link
          href="/election"
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Back to Elections
        </Link>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full min-h-[600px] flex flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-xl font-bold text-destructive">Failed to load standings</h1>
        <p className="text-muted-foreground">Something went wrong. Please try again later.</p>
        <Link
          href="/election"
          className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
        >
          Back to Elections
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col min-h-[600px] items-center justify-center">
      <div className="w-full max-w-6xl min-h-[600px] flex flex-col justify-start shadow-xl rounded-lg p-5 gap-5">
        <div className="w-full flex justify-center">
          <img
            className="lg:w-[100px] md:w-[90px] sm:w-[80px] w-[70px]"
            src="/logo.png"
            alt="logo"
          />
        </div>

        <h1 className="text-center font-bold text-3xl sm:text-4xl md:text-5xl text-primary">
          SWE Society Election
        </h1>

        {groupedCandidates.map((group) => (
          <div
            key={group.committeepostid}
            className="bg-gray-800 p-4 rounded-lg shadow-md min-w-fit"
          >
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 text-white">
              {group.post_name}
            </h2>
            <StandingsChart Grouped_data={group} />
          </div>
        ))}
      </div>
    </div>
  );
}
