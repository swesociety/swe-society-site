"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getJWT, getUserReg } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { election_status } from "@/utils/encrypt_req";
import { encryptId } from "@/utils/encryption";
import axios from "axios";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Info,
  Loader2,
  Lock,
  Radio,
  ShieldCheck,
  Vote,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import React, { useState } from "react";

export interface ElectionItem {
  electionid: number;
  year: string;
  election_type: string;
  batch: string;
  election_status?: string;
  candidatereg_start: string;
  candidatereg_end: string;
  election_start: string;
  election_end: string;
  election_commissioner: number;
  assistant_commissioner: number;
  commissioner_userid?: number;
  commissioner_fullname?: string;
  commissioner_email?: string;
  commissioner_profile_picture?: string;
  assistant_userid?: number;
  assistant_fullname?: string;
  assistant_email?: string;
  assistant_profile_picture?: string;
}

interface ElectionPortalProps {
  initialElections: ElectionItem[];
}

export default function ElectionPortal({
  initialElections,
}: ElectionPortalProps) {
  const [elections] = useState<ElectionItem[]>(initialElections || []);
  const [verifyingElectionId, setVerifyingElectionId] = useState<number | null>(
    null
  );
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "login_required" | "already_voted" | "not_registered" | "error";
    title: string;
    description: string;
    electionId?: number;
  }>({
    isOpen: false,
    type: "login_required",
    title: "",
    description: "",
  });

  const { hasStandingsAccess } = useProfile();
  const router = useRouter();
  const { toast } = useToast();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusMeta = (status?: string) => {
    switch (status) {
      case election_status.voting_start:
        return {
          label: "Voting Live",
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          isVotingLive: true,
          isNominationLive: false,
          badgeColor: "bg-emerald-500",
        };
      case election_status.candidate_reg_start:
        return {
          label: "Nomination Open",
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          isVotingLive: false,
          isNominationLive: true,
          badgeColor: "bg-amber-500",
        };
      case election_status.candidate_reg_end:
      case election_status.voting_not_started:
        return {
          label: "Upcoming Voting",
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          isVotingLive: false,
          isNominationLive: false,
          badgeColor: "bg-blue-500",
        };
      case election_status.voting_end:
      case election_status.finished:
        return {
          label: "Concluded",
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          isVotingLive: false,
          isNominationLive: false,
          badgeColor: "bg-gray-500",
        };
      default:
        return {
          label: "Scheduled",
          color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
          isVotingLive: false,
          isNominationLive: false,
          badgeColor: "bg-purple-500",
        };
    }
  };

  const handleVoteClick = async (election: ElectionItem) => {
    const token = getJWT();
    const regno = getUserReg();

    if (!token || !regno) {
      setModalState({
        isOpen: true,
        type: "login_required",
        title: "Authentication Required",
        description:
          "You must be logged in with your student credentials to cast a vote in SWE Society elections.",
        electionId: election.electionid,
      });
      return;
    }

    setVerifyingElectionId(election.electionid);

    try {
      const res = await axios.post(
        APIENDPOINTS.election.getCandidateStatus,
        {
          regno: regno,
          electionid: election.electionid,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const status = res.data?.status;

      if (status === "registered" || status === "casting") {
        router.push(
          `/election/${encryptId(election.electionid, "vote_key")}/vote`
        );
      } else if (status === "voted") {
        setModalState({
          isOpen: true,
          type: "already_voted",
          title: "Vote Already Cast",
          description:
            "Our records confirm you have already submitted your vote for this election. Thank you for participating!",
          electionId: election.electionid,
        });
      } else {
        setModalState({
          isOpen: true,
          type: "not_registered",
          title: "Not Registered to Vote",
          description:
            "You are not registered in the voter roll for this election. Please contact the election commissioner if you believe this is an error.",
          electionId: election.electionid,
        });
      }
    } catch (err: any) {
      const resStatus = err?.response?.status;
      if (resStatus === 404) {
        setModalState({
          isOpen: true,
          type: "not_registered",
          title: "Not in Voter Roll",
          description:
            "Your registration number was not found in the voter list for this election. Please contact the election committee.",
          electionId: election.electionid,
        });
      } else {
        setModalState({
          isOpen: true,
          type: "error",
          title: "Verification Error",
          description:
            err?.response?.data?.message ||
            "Unable to verify your voter status at this time. Please try again.",
          electionId: election.electionid,
        });
      }
    } finally {
      setVerifyingElectionId(null);
    }
  };

  const liveElections = elections.filter((e) => {
    const meta = getStatusMeta(e.election_status);
    return meta.isVotingLive || meta.isNominationLive;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-4">
          <Vote className="w-4 h-4" />
          <span>SWE Society Governance</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          Society Elections Portal
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Participate in student leadership, view candidate nominations, cast
          your ballot securely, and follow live election results.
        </p>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Live / Active Elections Section */}
        {liveElections.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-2xl font-bold text-white">
                Active Elections
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {liveElections.map((election) => {
                const meta = getStatusMeta(election.election_status);
                const isVerifying =
                  verifyingElectionId === election.electionid;

                return (
                  <Card
                    key={election.electionid}
                    className="bg-slate-900 border-slate-800 relative overflow-hidden flex flex-col justify-between shadow-2xl hover:border-slate-700 transition"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />

                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${meta.color}`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${meta.badgeColor} animate-ping`}
                          />
                          {meta.label}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-700 text-slate-400"
                        >
                          Batch {election.batch || "N/A"}
                        </Badge>
                      </div>

                      <CardTitle className="text-2xl font-bold text-white">
                        {election.election_type || "General"} Election{" "}
                        {election.year}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Leadership election for Department of Software
                        Engineering Society
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500  text-xs items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" /> Nomination
                          </span>
                          <span className="text-slate-300 font-medium">
                            {formatDate(election.candidatereg_end)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500  text-xs flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Voting Date
                          </span>
                          <span className="text-slate-300 font-medium">
                            {formatDate(election.election_end)}
                          </span>
                        </div>
                      </div>

                      {election.commissioner_fullname && (
                        <div className="flex items-center gap-3 pt-2">
                          <img
                            src={
                              election.commissioner_profile_picture ||
                              "/logo.png"
                            }
                            alt={election.commissioner_fullname}
                            className="w-9 h-9 rounded-full border border-slate-700 object-cover"
                          />
                          <div className="text-xs">
                            <p className="text-slate-400">
                              Chief Election Commissioner
                            </p>
                            <p className="font-semibold text-slate-200">
                              {election.commissioner_fullname}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {meta.isVotingLive && (
                        <Button
                          onClick={() => handleVoteClick(election)}
                          disabled={isVerifying}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold flex-1 gap-2 shadow-lg shadow-red-600/20"
                        >
                          {isVerifying ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Verifying Status...
                            </>
                          ) : (
                            <>
                              <Vote className="w-4 h-4" />
                              Cast Vote
                            </>
                          )}
                        </Button>
                      )}

                      {meta.isNominationLive && (
                        <Link
                          href={`/election/${encryptId(
                            election.electionid,
                            "election_key"
                          )}/nomination`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            className="w-full border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-2"
                          >
                            <FileCheck className="w-4 h-4" />
                            Nomination Form
                          </Button>
                        </Link>
                      )}

                      {hasStandingsAccess && (
                        <Link
                          href={`/election/${encryptId(
                            election.electionid,
                            "standing_key"
                          )}/standings`}
                        >
                          <Button
                            variant="ghost"
                            className="text-slate-400 hover:text-white hover:bg-slate-800 gap-1.5"
                          >
                            <BarChart3 className="w-4 h-4" />
                            Standings
                          </Button>
                        </Link>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Society Elections Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              All Society Elections
            </h2>
            <span className="text-xs text-slate-500">
              {elections.length} Total Registered
            </span>
          </div>

          {elections.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center">
              <Info className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-300">
                No Elections Found
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                There are currently no elections recorded in the system.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {elections.map((election) => {
                const meta = getStatusMeta(election.election_status);
                const isVerifying =
                  verifyingElectionId === election.electionid;

                return (
                  <Card
                    key={election.electionid}
                    className="bg-slate-900/70 border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <CardHeader className="space-y-2 pb-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          Batch {election.batch || "-"}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-100">
                        SWE Election {election.year}
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        {election.election_type || "General"} Election
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3 text-xs">
                      <div className="space-y-1.5 text-slate-400">
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Registration End:
                          </span>
                          <span>
                            {formatDate(election.candidatereg_end)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">
                            Voting Date:
                          </span>
                          <span>{formatDate(election.election_end)}</span>
                        </div>
                      </div>

                      {election.commissioner_fullname && (
                        <div className="border-t border-slate-800 pt-2 flex items-center gap-2">
                          <div className="text-slate-500">
                            Commissioner:
                          </div>
                          <div className="font-medium text-slate-300 truncate">
                            {election.commissioner_fullname}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="pt-3 border-t border-slate-800/80 flex gap-2">
                      {meta.isVotingLive ? (
                        <Button
                          onClick={() => handleVoteClick(election)}
                          disabled={isVerifying}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white font-medium flex-1 text-xs gap-1.5"
                        >
                          {isVerifying ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Vote className="w-3.5 h-3.5" />
                          )}
                          Vote Now
                        </Button>
                      ) : hasStandingsAccess ? (
                        <Link
                          href={`/election/${encryptId(
                            election.electionid,
                            "standing_key"
                          )}/standings`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 text-xs gap-1.5"
                          >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Standings
                          </Button>
                        </Link>
                      ) : null}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Information & Verification Modal */}
      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open) =>
          setModalState((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              {modalState.type === "login_required" && (
                <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Lock className="w-5 h-5" />
                </div>
              )}
              {modalState.type === "already_voted" && (
                <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {modalState.type === "not_registered" && (
                <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {modalState.type === "error" && (
                <div className="p-2.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}

              <DialogTitle className="text-xl font-bold">
                {modalState.title}
              </DialogTitle>
            </div>

            <DialogDescription className="text-slate-400 text-sm pt-2 leading-relaxed">
              {modalState.description}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            {modalState.type === "login_required" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setModalState((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => router.push("/signin?redirect=/election")}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  Sign In Now
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </>
            )}

            {modalState.type === "already_voted" && (
              <>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setModalState((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="text-slate-400 hover:text-white"
                >
                  Close
                </Button>
                {modalState.electionId && hasStandingsAccess && (
                  <Button
                    onClick={() => {
                      setModalState((prev) => ({ ...prev, isOpen: false }));
                      router.push(
                        `/election/${encryptId(
                          modalState.electionId!,
                          "standing_key"
                        )}/standings`
                      );
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white gap-1.5"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Live Results
                  </Button>
                )}
              </>
            )}

            {(modalState.type === "not_registered" ||
              modalState.type === "error") && (
              <Button
                onClick={() =>
                  setModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="w-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                Understood
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
