"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getJWT, getUserRole } from "@/data/cookies/getCookies";
import { APIENDPOINTS, BACKENDURL } from "@/data/urls";
import axios from "axios";
import { useRouter } from "next/navigation";

import {
  decryptObject,
  election_status,
  reqSalt_keys,
  xorEncrypt,
} from "@/utils/encrypt_req";
import { encryptId } from "@/utils/encryption";
import { useProfile } from "@/hooks/useProfile";
import React, { useEffect, useState } from "react";
import { BsCopy } from "react-icons/bs";
import { MdOutlineArrowBackIos } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import ConfirmationModal from "../commons/ConfirmationModal";
import { useToast } from "../ui/use-toast";
import AddCommitteeMemberModal from "./AddCommitteeMemberModal";
import EligibleCandidate from "./EligibleCandidate";
import ManualNomination from "./ManualNomination";

interface Member {
  userid: number;
  year: string;
  fullname: string;
  profile_picture: string | null;
  email: string;
  regno: string;
  session: string;
  committee_post: string;
}

interface ElectionMemberDetailsProps {
  electionId: number;
  setShowFullCommitteee: React.Dispatch<React.SetStateAction<boolean>>;
}

const electionStatusButtons = [
  {
    title: "Pending",
    state: election_status.pending,
  },
  {
    title: "Nomination Start",
    state: election_status.candidate_reg_start,
  },
  {
    title: "Nomination End",
    state: election_status.candidate_reg_end,
  },
  {
    title: "Voting Not Started",
    state: election_status.voting_not_started,
  },
  {
    title: "Voting Start",
    state: election_status.voting_start,
  },
  {
    title: "Voting End",
    state: election_status.voting_end,
  },
  {
    title: "Finish",
    state: election_status.finished,
  },
];

const ElectionMemberDetails: React.FC<ElectionMemberDetailsProps> = ({
  electionId,
  setShowFullCommitteee,
}) => {
  const [election_state, setElection_state] =
    useState<string>("Set Election state");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCommitteeMember, setSelectedCommitteMember] =
    useState<number>(0);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [nominationLink, setNominationLink] = useState("");
  const [role, setRole] = useState<string>("");
  const router = useRouter();
  const [nomination_btn, setNomination_btn] = useState("Nomination Form Link");

  const fetchMembers = async () => {
    try {
      const response = await axios.get(
        `${APIENDPOINTS.election.getAllMembers}/${xorEncrypt(
          electionId.toString(),
          reqSalt_keys.election.getAllMembers
        )}`
      );
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handle_election_state = async (title: string, state: string) => {
    setElection_state(title);
    await axios.put(
      `${APIENDPOINTS.election.updateElection}/${electionId}`,
      {
        election_status: state,
      },
      { headers: { Authorization: `Bearer ${getJWT()}` } }
    );
  };

  const getNominationLink = () => {
    if (typeof window !== "undefined") {
      setNominationLink(
        `${window.location.origin}/election/${encryptId(
          electionId,
          "election_key"
        )}/nomination`
      );
    } else {
      setNominationLink(
        `/election/${encryptId(electionId, "election_key")}/nomination`
      );
    }
  };
  const handleCopy = async () => {
    if (!nominationLink) return;
    try {
      await navigator.clipboard.writeText(nominationLink);
      setNomination_btn("Copied");
      setTimeout(() => {
        setNomination_btn("Nomination Form Link");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  const fetchElectionInfo = () => {
    axios
      .get(
        `${APIENDPOINTS.election.getElectionbyID}/${xorEncrypt(
          electionId.toString(),
          reqSalt_keys.election.getElectionbyID
        )}`
      )
      .then((response) => {
        const decryptedData = decryptObject(
          response.data,
          reqSalt_keys.election.getElectionbyID
        );
        console.log("Decrypted Data:", decryptedData.election_status);
        switch (decryptedData.election_status) {
          case election_status.pending:
            setElection_state("Pending");
            break;
          case election_status.candidate_reg_start:
            setElection_state("Nomination Start");
            break;
          case election_status.candidate_reg_end:
            setElection_state("Nomination End");
            break;
          case election_status.voting_not_started:
            setElection_state("Voting Not Started");
            break;
          case election_status.voting_start:
            setElection_state("Voting Start");
            break;
          case election_status.voting_end:
            setElection_state("Voting End");
            break;
          case election_status.finished:
            setElection_state("Finished");
            break;

          default:
            setElection_state("Unknown State");
            break;
        }
      })
      .catch((error) => {
        console.error("Error fetching election info:", error);
      });
  };

  const { hasStandingsAccess } = useProfile();

  useEffect(() => {
    fetchElectionInfo();
    fetchMembers();
    getNominationLink();
    setRole(getUserRole() || "");
  }, [electionId]);

  if (loading) {
    return (
      <div className="text-white text-center py-4">Loading members...</div>
    );
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${BACKENDURL}election/members/${selectedCommitteeMember}`,
        {
          headers: {
            Authorization: `Bearer ${getJWT()}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Deleted Election Successfully",
          duration: 3000,
        });
        setOpenDeleteModal(false);
        fetchMembers();

        // window.location.reload();
      }
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  return (
    <>
      <div className="flex justify-between items-start w-full">
        <button
          onClick={() => {
            setShowFullCommitteee(false);
          }}
          className="text-white flex items-center space-x-3 "
        >
          {" "}
          <MdOutlineArrowBackIos className="text-white" />
          <div>Back</div>
        </button>

        <div className="flex flex-col gap-y-2">
          <button
            onClick={() => {
              const url = `/election/${encryptId(
                electionId,
                "nomination_key"
              )}/approve_nomination`;
              window.open(url, "_blank"); // Opens in a new tab
            }}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            Open Nomination Approval
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            + Add Panel Member
          </button>
          <button
            onClick={() => {
              const url = `/election/${encryptId(
                electionId,
                "election_access"
              )}/election_access`;
              window.open(url, "_blank");
            }}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            Manage Election Access
          </button>

          <EligibleCandidate />
          <button
            onClick={() => {
              const url = `/election/${encryptId(
                electionId,
                "monitor_voting"
              )}/monitor_voting`;
              window.open(url, "_blank");
            }}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            Monitor election voting
          </button>

          <ManualNomination electionId={electionId} />

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-x-2 bg-red-700 rounded-lg px-4 mr-2"
          >
            {nomination_btn}
            {nomination_btn === "Nomination Form Link" ? (
              <BsCopy />
            ) : (
              <TiTick />
            )}
          </button>
          {hasStandingsAccess && (
            <button
              onClick={() => {
                const url = `/election/${encryptId(
                  electionId,
                  "standing_key"
                )}/standings`;
                window.open(url, "_blank");
              }}
              className="bg-red-700 rounded-lg px-4 mr-2"
            >
              See standings
            </button>
          )}
          <button
            onClick={() => {
              const url = `/election/${encryptId(electionId, "vote_key")}/vote`;
              window.open(url, "_blank");
            }}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            Submit Vote
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-red-700 rounded-lg px-4 mr-2">
                {election_state}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              {electionStatusButtons.map((button) => (
                <DropdownMenuItem
                  key={button.title}
                  onClick={() =>
                    handle_election_state(
                      `state : ${button.title}`,
                      button.state
                    )
                  }
                >
                  {button.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {members && members.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xl text-gray-500">No Panel Members Available</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {members.map((member) => (
          <div
            key={member.regno}
            className="bg-gray-700 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow relative"
          >
            <div className="flex items-center space-x-4">
              {member.profile_picture ? (
                <img
                  src={member.profile_picture}
                  alt={member.fullname}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-500 flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {member.fullname[0]}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{member.fullname}</h3>
                <p className="text-sm text-gray-300">{member.committee_post}</p>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <p>
                <strong>Reg No:</strong> {member.regno}
              </p>
              <p>
                <strong>Email:</strong> {member.email}
              </p>
              {member.session && (
                <p>
                  <strong>Session:</strong> {member.session}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      {openDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          subtitle="Are you sure you want to delete the election? This action cannot be undone."
          confirmButtonTitle="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setOpenDeleteModal(false);
          }}
        />
      )}

      {isModalOpen && (
        <AddCommitteeMemberModal
          electionId={electionId}
          onClose={() => setIsModalOpen(false)}
          fetchMembers={fetchMembers}
        />
      )}
    </>
  );
};

export default ElectionMemberDetails;
