"use client";

import { NominationCard } from "@/components/election/NominationCard";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { reqSalt_keys, xorEncrypt } from "@/utils/encrypt_req";
import { decryptId } from "@/utils/encryption";
import axios from "axios";
import { useEffect, useState } from "react";

interface CandidateProps {
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

function Page({ params }: { params: { election: string } }) {
  const electionId = decryptId(params.election, "nomination_key");
  const encrypted_electionId = xorEncrypt(
    electionId?.toString() ?? "",
    reqSalt_keys.candidate.approveAllNominations
  );
  const [candidates, setCandidates] = useState<CandidateProps[]>([]);
  const [loading, setLoading] = useState(true);
  const accept_all = () => {
    axios
      .put(
        `${APIENDPOINTS.candidate.approveAllNominations}/${encrypted_electionId}`,
        {}, // Empty request body or actual payload if needed
        { headers: { Authorization: `Bearer ${getJWT()}` } } // Headers as third parameter
      )
      .then((response) => {
        if (response.status === 200) {
          console.log("All nominations accepted successfully");
          toast({
            title: "All nominations accepted successfully",
            description: "All nominations have been accepted.",
          });
          fetch_data(); // Refresh the data after accepting all
        } else {
          console.error("Failed to accept all nominations");
        }
      })
      .catch((error) => {
        console.error("Error accepting nominations:", error);
        toast({
          title: "Error",
          description: "Failed to accept nominations. Please try again.",
          variant: "destructive",
        });
      });
  };
  const fetch_data = async () => {
    if (electionId) {
      axios
        .get(
          `${APIENDPOINTS.candidate.getAllNominations}/${encrypted_electionId}`,
          { headers: { Authorization: `Bearer ${getJWT()}` } }
        )
        .then((response) => {
          const sortedCandidates = response.data.sort(
            (a: CandidateProps, b: CandidateProps) => {
              if (a.committeepostid !== b.committeepostid) {
                return a.committeepostid - b.committeepostid;
              }
              return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
              );
            }
          );
          setCandidates(sortedCandidates);
        })
        .catch((error) => console.error("Error fetching candidates:", error))
        .finally(() => setLoading(false));
    }
  };
  //   const electionId = decryptId(params.election) || 0;

  useEffect(() => {
    fetch_data();
  }, [electionId]);

  // Group candidates by post_name
  const groupedCandidates: { [key: string]: CandidateProps[] } = {};
  candidates.forEach((candidate) => {
    if (!groupedCandidates[candidate.post_name]) {
      groupedCandidates[candidate.post_name] = [];
    }
    groupedCandidates[candidate.post_name].push(candidate);
  });

  return (
    <div className="min-h-screen w-full flex flex-col items-center text-center bg-background text-white p-4">
      <h1 className="text-2xl font-bold mb-6">Nomination List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="w-full max-w-3xl space-y-6">
          {Object.entries(groupedCandidates).map(([postName, candidates]) => (
            <div key={postName}>
              <h2 className="text-xl font-semibold mb-2">{postName}</h2>
              <Separator className="mb-4" />
              <div className="grid gap-4">
                {candidates.map((candidate) => (
                  <NominationCard
                    key={candidate.candidate_id}
                    candidate={candidate}
                    fetch={fetch_data}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        className="fixed bottom-4 right-4 bg-destructive text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 transition duration-300 z-50"
        onClick={accept_all}
        // Change this to your action
      >
        Accept all
      </button>
    </div>
  );
}

export default Page;
