"use client";
import NominationForm from "@/components/election/NominationForm";
import StateImg from "@/components/election/StateImg";
import { getUserID } from "@/data/cookies/getCookies";
import { decryptId } from "@/utils/encryption";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchElection } from "../functions";
function Page({ params }: { params: { election: string } }) {
  const router = useRouter();
  const nth = decryptId(params.election, "election_key") || 0;
  const [state, setState] = useState<"" | "pending" | "running" | "over">("");

  useEffect(() => {
    const fetchAndSetState = async () => {
      const uid = getUserID();
      if (uid === null || uid === undefined) {
        router.push("/");
        return;
      }
      const temp = await fetchElection(nth, "nomination");
      setState(temp.status as "" | "pending" | "running" | "over");
    };
    fetchAndSetState();
  }, []);
  return (
    <div className="min-h-screen w-full flex  justify-center items-center text-center bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4">
      {state === "pending" && (
        <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
          <StateImg Form_state={"Not_Started"} />

          <div className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-primary-400">
            Registration has not started yet. Please check back later.
          </div>
        </div>
      )}

      {state === "running" && (
        <div className="animate-fade-in-up">
          <NominationForm electionID={nth} />
        </div>
      )}

      {state === "over" && (
        <div className="flex flex-col items-center justify-center space-y-3 animate-pulse">
          <StateImg Form_state={"Finished"} />
          <div className="text-xl font-semibold text-red-400">
            Registration period is over.
          </div>
        </div>
      )}

      {state === "" && (
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg
            className="animate-spin h-10 w-10 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <div className="text-xl font-semibold text-gray-400">
            Loading election details...
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
