"use client";
import { useToast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import { useState } from "react";

interface CandidateInfo {
  candidate_id: number;
  electionid: number;
  userId: number;
  marka_name: string;
  slogan?: string;
  logo_url?: string;
  committeepostid: number;
  request_approval_status: boolean;
}

interface CandidateCardProps {
  candidate: CandidateInfo;
  refreshCandidates: () => void; // Function to refetch data after approval/revoke
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  refreshCandidates,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async (approve: boolean) => {
    setLoading(true);
    try {
      await axios.patch(
        `${BACKENDURL}candidate/approve/${candidate.candidate_id}`,
        { request_approval_status: approve },
        {
          headers: {
            Authorization: `Bearer ${getJWT()}`,
          },
        }
      );
      toast({
        title: approve ? "Candidate Approved" : "Nomination Revoked",
        duration: 3000,
      });
      refreshCandidates(); // Refresh candidate list after action
    } catch (error) {
      console.error("Error updating candidate status:", error);
      toast({
        title: "Failed to update status",
        duration: 3000,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center space-x-4">
        {candidate.logo_url ? (
          <img
            src={candidate.logo_url}
            alt={candidate.marka_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {candidate.marka_name[0]}
            </span>
          </div>
        )}
        <div>
          <h3 className="text-xl font-semibold">{candidate.marka_name}</h3>
          <p className="text-sm text-gray-300">
            {candidate.slogan || "No Slogan"}
          </p>
        </div>
      </div>
      <div className="mt-2 text-sm">
        <p>
          <strong>Candidate ID:</strong> {candidate.candidate_id}
        </p>
        <p>
          <strong>Election ID:</strong> {candidate.electionid}
        </p>
        <p>
          <strong>Committee Post ID:</strong> {candidate.committeepostid}
        </p>
      </div>

      <div className="mt-4">
        {candidate.request_approval_status ? (
          <button
            onClick={() => handleAction(false)}
            disabled={loading}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            {loading ? "Revoking..." : "Revoke Nomination"}
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction(true)}
              disabled={loading}
              className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              {loading ? "Approving..." : "Approve"}
            </button>
            <button
              onClick={() => handleAction(false)}
              disabled={loading}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              {loading ? "Declining..." : "Decline"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
