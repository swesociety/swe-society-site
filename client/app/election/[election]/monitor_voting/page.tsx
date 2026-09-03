"use client";

import { toast } from "@/components/ui/use-toast";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import { decryptId } from "@/utils/encryption";
import axios from "axios";
import { motion } from "framer-motion";
import { CheckCircle, Clock, Loader2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ElectionOnArrival {
  election_on_arival_id: number;
  electionid: number;
  otp: string;
  regno: string;
  status: "registered" | "registered_voted" | string;
  fullname: string | null;
  last_status: "registered" | "voted" | string;
}

const statusSteps = ["registered", "casting", "voted"];

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "registered":
      return "Has entered the voting system";
    case "casting":
      return "Is currently casting vote";
    case "voted":
      return "Has casted the vote";
    default:
      return "Unknown status";
  }
};

const getStatusProgress = (status: string): number => {
  const index = statusSteps.indexOf(status);
  return index !== -1 ? index : 0;
};

const RECORDS_PER_PAGE = 10;

const Page = ({ params }: { params: { election: string } }) => {
  const router = useRouter();
  const electionId = decryptId(params.election, "monitor_voting") || 0;

  const [votingInfo, setVotingInfo] = useState<ElectionOnArrival[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchInfo = (electionId: number) => {
    const jwt = getJWT();
    if (!jwt || electionId === 0) {
      toast({
        title: "Error",
        description: "Invalid election ID or not authenticated",
        variant: "destructive",
      });
      router.push("/");
      return;
    }

    axios
      .get(`${BACKENDURL}election/candidatetrack/getalltrackss/${electionId}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      .then((res) => {
        setVotingInfo(res.data || []);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err.message || "Failed to fetch voting information",
          variant: "destructive",
        });
      });
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchInfo(electionId);
    const interval = setInterval(() => fetchInfo(electionId), 10000);
    return () => clearInterval(interval);
  }, [electionId]);

  const totalPages = Math.ceil(votingInfo.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const currentRecords = votingInfo.slice(
    startIndex,
    startIndex + RECORDS_PER_PAGE
  );

  return (
    <div className="p-6 w-full max-w-4xl mx-auto space-y-6 flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-primary mb-4 text-center">
        🗳️ Live Voting Monitor
      </h2>

      {currentRecords.map((info, index) => {
        const progress = getStatusProgress(info.last_status);

        return (
          <motion.div
            key={info.election_on_arival_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center bg-card border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
          >
            {/* Left: User Info */}
            <div className="space-y-2 max-w-sm">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <User className="w-4 h-4 text-muted-foreground" />
                {info.fullname || "Unknown User"}
              </div>
              <div className="text-sm text-muted-foreground">
                Reg. No: <span className="font-mono">{info.regno}</span>
              </div>
              <div className="text-sm italic text-muted-foreground">
                {getStatusLabel(info.last_status)}
              </div>
            </div>

            {/* Right: Progress Tracker */}
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {statusSteps.map((step, stepIndex) => {
                const isCompleted = stepIndex <= progress;

                const icon =
                  step === "registered" ? (
                    <Clock className="w-4 h-4" />
                  ) : step === "casting" ? (
                    <Loader2
                      className={`w-4 h-4 ${isCompleted ? "" : "animate-spin"}`}
                    />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  );

                return (
                  <div
                    key={step}
                    className="flex flex-col items-center text-xs"
                  >
                    <div
                      className={`rounded-full p-2 ${
                        isCompleted
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {icon}
                    </div>
                    <span
                      className={`mt-1 ${
                        isCompleted
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-1 border rounded-md text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Page;
