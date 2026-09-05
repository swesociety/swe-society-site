"use client";

import SidebarButton from "@/components/dashboardpage/SidebarButton";
import StateImg from "@/components/election/StateImg";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { clearCookies } from "@/data/cookies/deleteCookies";
import { getJWT, getUserID, getUserReg } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import {
  decryptArray,
  encryptArray,
  reqSalt_keys,
  xorEncrypt,
} from "@/utils/encrypt_req";
import { decryptId } from "@/utils/encryption";
import axios from "axios";
import { ArrowLeft, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchElection } from "../functions";
interface Candidate {
  candidate_id: number;
  electionid: number;
  userid: number;
  marka_name: string;
  slogan: string;
  logo_url: string;
  committeepostid: number;
  request_approval_status: boolean;
  created_at: string;
  fullname: string;
  profile_picture: string;
  session: string;
  post_name: string;
}

interface Election {
  electionid: number;
  year: string;
  election_type: string;
  batch: string;
  election_commissioner: number;
  assistant_commissioner: number;
  candidatereg_start: Date;
  candidatereg_end: Date;
  election_start: Date;
  election_end: Date;
}

function Page({ params }: { params: { election: string } }) {
  const electionId = decryptId(params.election, "vote_key") || 0;
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionInfo, set_electionInfo] = useState<Election>();
  const [selectedVotes, setSelectedVotes] = useState<{ [key: string]: number }>(
    {}
  );
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<"" | "pending" | "running" | "over">("");
  const fetch_data = async () => {
    try {
      const res = await axios.get(
        `${
          APIENDPOINTS.candidate.getCandidatesFilteredByElectionAccess
        }/${xorEncrypt(
          electionId.toString(),
          reqSalt_keys.candidate.getFilteredCandidatesByElectionAccess
        )}/${xorEncrypt(
          getUserID() || "",
          reqSalt_keys.candidate.getFilteredCandidatesByElectionAccess
        )}`,
        { headers: { Authorization: `Bearer ${getJWT()}` } }
      );
      const temp_res = decryptArray(
        res.data,
        reqSalt_keys.candidate.getFilteredCandidatesByElectionAccess
      ) as Candidate[];
      const sortedCandidates = temp_res.sort(
        (a: Candidate, b: Candidate) => a.committeepostid - b.committeepostid
      );
      setCandidates(sortedCandidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    }
  };
  const handleLogout = () => {
    clearCookies();
    
    router.push("/signin");
  };

  useEffect(() => {
    const fetchAndSetState = async () => {
      const uid = getUserID();
      const token = getJWT();
      const regno = getUserReg();

      if (!uid || !token) {
        router.push("/signin?redirect=/election");
        return;
      }

      // Pre-check if voter has already voted
      if (regno && electionId) {
        try {
          const statusRes = await axios.post(
            APIENDPOINTS.election.getCandidateStatus,
            { regno, electionid: electionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (statusRes.data?.status === "voted") {
            toast({
              title: "Already Voted",
              description:
                "You have already submitted your vote for this election.",
            });
            router.push("/election");
            return;
          }
        } catch (err) {
          // If status not found or error, continue to check election status
        }
      }

      const temp = await fetchElection(electionId, "vote");
      setState(temp.status as "" | "pending" | "running" | "over");
      set_electionInfo(temp.info as Election);
      if (temp.status == "running") {
        fetch_data();
      }
    };
    fetchAndSetState();
  }, [electionId]);

  const groupedCandidates: { [key: string]: Candidate[] } = {};
  candidates.forEach((candidate) => {
    if (!groupedCandidates[candidate.post_name])
      groupedCandidates[candidate.post_name] = [];
    groupedCandidates[candidate.post_name].push(candidate);
  });

  const handleVote = (postName: string, candidateId: number) => {
    setSelectedVotes((prev) => ({ ...prev, [postName]: candidateId }));
  };

  const handleReset = () => {
    setSelectedVotes({});
  };

  const handleSubmit = async () => {
    try {
      const requiredPostNames = Object.keys(groupedCandidates);

      const unselectedPositions = requiredPostNames.filter(
        (postName) => !selectedVotes[postName]
      );

      if (unselectedPositions.length > 0) {
        toast({
          title: "Incomplete Vote",
          description: `Please vote for all positions before submitting.`,
          variant: "destructive",
        });
        return;
      }
      setSubmitting(true);
      const userId = getUserID();
      const candidateIds = Object.values(selectedVotes);
      console.log(candidateIds); // array of selected candidate_id

      const votesPayload = {
        user_id: xorEncrypt(userId || "", reqSalt_keys.vote.create),
        vote: encryptArray(
          candidateIds.map((id) => ({ candidate_id: id })),
          reqSalt_keys.vote.create
        ),
      };

      const res = await axios.post(`${APIENDPOINTS.vote.create}`, votesPayload, {
        headers: { Authorization: `Bearer ${getJWT()}` },
      });
      if (res.status == 201) {
        const regnos = getUserReg();
        await axios.post(
          `${APIENDPOINTS.election.updateCandidateStatus}`,
          {
            regno: regnos,
            status: "voted",
          },
          {
            headers: { Authorization: `Bearer ${getJWT()}` },
          }
        );

        toast({
          title: "Votes Submitted",
          description: "Your votes have been successfully submitted.",
          variant: "default",
        });

        router.push("/election");
      }
        
    } catch (err: unknown) {
      console.error("Vote submission failed", err);
      let errorMessage =
        "An error occurred while submitting your votes. Please try again.";

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      toast({
        title: "Vote Submission Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[600px] items-center justify-center ">
      {state === "" && (
        <div className="w-full h-full flex justify-center items-center">
          <div
            className="
          w-10 sm:w-15 md:w-20 lg:w-20
          h-10 sm:h-15 md:h-20 lg:h-20
          border-4 
          border-t-red-600 rounded-full animate-spin"
          />
        </div>
      )}
      {state === "pending" && (
        <div className="w-full h-full flex flex-col gap-5 justify-center items-center ">
          <StateImg Form_state={"Not_Started"} />
          <h1 className="text-2xl font-bold text-primary-400">
            Election is not started yet
          </h1>
        </div>
      )}
      {state === "running" && (
        <div className="w-full max-w-6xl min-h-[600px] flex flex-col justify-start shadow-xl rounded-lg p-5 gap-5 ">
          <div className="w-full flex justify-center">
            <img
              className="lg:w-[100px] md:w-[90px] sm:w-[80px] w-[70px]"
              src="/logo.png"
              alt=""
            />
          </div>

          <h1 className="text-center font-bold text-3xl sm:text-4xl md:text-5xl text-primary">
            SWE Society Election {electionInfo?.year}
          </h1>

          {Object.entries(groupedCandidates).map(([postName, candidates]) => (
            <div
              key={postName}
              className="bg-gray-800 p-4 rounded-lg shadow-md w-full"
            >
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 text-white">
                {postName}
              </h2>
              <div className="flex flex-wrap gap-4 z-0">
                {candidates.map((candidate) => (
                  <label
                    key={candidate.candidate_id}
                    className={`cursor-pointer w-[300px] h-[200px] rounded-lg p-3 flex flex-col justify-between bg-gray-700 text-white shadow-lg border-2 transition-all duration-300 ${
                      selectedVotes[postName] === candidate.candidate_id
                        ? "border-red-500 scale-105"
                        : "border-transparent hover:border-gray-500"
                    }`}
                    onClick={() => handleVote(postName, candidate.candidate_id)}
                  >
                    <input
                      type="radio"
                      name={postName}
                      value={candidate.candidate_id}
                      checked={
                        selectedVotes[postName] === candidate.candidate_id
                      }
                      onChange={() =>
                        handleVote(postName, candidate.candidate_id)
                      }
                      className="hidden"
                    />
                    <div className="flex gap-x-2 items-center">
                      <img
                        className="w-[50px] h-[50px] rounded-full"
                        src={candidate.profile_picture}
                        alt={candidate.fullname}
                      />
                      <div>
                        <h1 className="text-sm font-semibold">
                          {candidate.fullname}
                        </h1>
                        <Badge className="bg-gray-300 text-gray-700 px-1 py-0 rounded-sm">
                          {candidate.session}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <img
                        className="w-[80px] h-[80px] rounded-lg"
                        src={candidate.logo_url}
                        alt={candidate.marka_name}
                      />
                    </div>
                    <h1 className="italic text-center text-sm text-muted-foreground">
                      &ldquo;{candidate.slogan}&rdquo;
                    </h1>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleReset}
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset Form
            </button>
            <button
              disabled={submitting}
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/80 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Votes"}
            </button>
          </div>
        </div>
      )}
      {state === "over" && (
        <div className="w-full h-full flex flex-col gap-4 justify-center items-center animate-pulse">
          <StateImg Form_state={"Finished"} />
          <h1 className="text-2xl font-bold text-red-600">Election is over</h1>
        </div>
      )}

      <div className="fixed bottom-6 left-6 z-50 flex gap-2">
        <SidebarButton
          size="lg"
          Icon={ArrowLeft}
          variant="default"
          className="bg-gray-800 hover:bg-gray-700"
          onClick={() => router.push("/election")}
        >
          Exit to Elections
        </SidebarButton>
        <SidebarButton
          size="lg"
          Icon={LogOut}
          variant="default"
          className="bg-gray-700 hover:bg-gray-600"
          onClick={handleLogout}
        >
          Log Out
        </SidebarButton>
      </div>
    </div>
  );
}

export default Page;
