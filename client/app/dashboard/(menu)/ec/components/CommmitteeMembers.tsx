'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getJWT } from '@/data/cookies/getCookies';
import { election_status } from '@/utils/encrypt_req';
import { encryptId } from '@/utils/encryption';
import { useProfile } from '@/hooks/useProfile';
import React, { useEffect, useState, useTransition } from 'react';
import { BsCopy } from 'react-icons/bs';
import { MdOutlineArrowBackIos } from 'react-icons/md';
import { TiTick } from 'react-icons/ti';
import ConfirmationModal from '../../../../../components/commons/ConfirmationModal';
import { useToast } from '../../../../../components/ui/use-toast';
import AddCommitteeMemberModal from './AddCommitteeMemberModal';
import EligibleCandidate from './EligibleCandidate';
import ManualNomination from './ManualNomination';
import {
  deleteCommitteeMember,
  getElectionById,
  getElectionMembers,
  updateElectionStatus,
} from '../actions';

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
  users?: { userid: number; fullname: string; regno: string }[];
  posts?: { committeepostid: number; post_name: string }[];
  members?: Member[];
  initialElectionStatus?: string;
}

const electionStatusButtons = [
  {
    title: 'Pending',
    state: election_status.pending,
  },
  {
    title: 'Nomination Start',
    state: election_status.candidate_reg_start,
  },
  {
    title: 'Nomination End',
    state: election_status.candidate_reg_end,
  },
  {
    title: 'Voting Not Started',
    state: election_status.voting_not_started,
  },
  {
    title: 'Voting Start',
    state: election_status.voting_start,
  },
  {
    title: 'Voting End',
    state: election_status.voting_end,
  },
  {
    title: 'Finish',
    state: election_status.finished,
  },
];

const mapStatusToTitle = (status?: string) => {
  switch (status) {
    case election_status.pending:
      return 'Pending';
    case election_status.candidate_reg_start:
      return 'Nomination Start';
    case election_status.candidate_reg_end:
      return 'Nomination End';
    case election_status.voting_not_started:
      return 'Voting Not Started';
    case election_status.voting_start:
      return 'Voting Start';
    case election_status.voting_end:
      return 'Voting End';
    case election_status.finished:
      return 'Finished';
    default:
      return status ? `state : ${status}` : 'Set Election state';
  }
};

const ElectionMemberDetails: React.FC<ElectionMemberDetailsProps> = ({
  electionId,
  setShowFullCommitteee,
  users,
  posts,
  members,
  initialElectionStatus,
}) => {
  const [election_state, setElection_state] = useState<string>(() =>
    mapStatusToTitle(initialElectionStatus),
  );
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [nominationLink, setNominationLink] = useState('');
  const [nomination_btn, setNomination_btn] = useState('Nomination Form Link');
  const [loading, startTransition] = useTransition();

  const handle_election_state = (title: string, state: string) => {
    setElection_state(title);
    startTransition(async () => {
      await updateElectionStatus(electionId, state, getJWT() || '');
    });
  };
  const fetchMembers = async () => {
    startTransition(async () => {
      try {
        const decryptedData = await getElectionMembers(electionId);
        if (!decryptedData) return;
        console.log('Decrypted Data:', decryptedData.election_status);
        setElection_state(mapStatusToTitle(decryptedData.election_status));
      } catch (error) {
        console.error('Error fetching election info:', error);
      }
    });
  };
  const getNominationLink = () => {
    if (typeof window !== 'undefined') {
      setNominationLink(
        `${window.location.origin}/election/${encryptId(
          electionId,
          'election_key',
        )}/nomination`,
      );
    } else {
      setNominationLink(
        `/election/${encryptId(electionId, 'election_key')}/nomination`,
      );
    }
  };
  const handleCopy = async () => {
    if (!nominationLink) return;
    try {
      await navigator.clipboard.writeText(nominationLink);
      setNomination_btn('Copied');
      setTimeout(() => {
        setNomination_btn('Nomination Form Link');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  const fetchElectionInfo = () => {
    startTransition(async () => {
      try {
        const decryptedData = await getElectionById(electionId);
        if (!decryptedData) return;
        console.log('Decrypted Data:', decryptedData.election_status);
        setElection_state(mapStatusToTitle(decryptedData.election_status));
      } catch (error) {
        console.error('Error fetching election info:', error);
      }
    });
  };

  const { hasStandingsAccess } = useProfile();

  useEffect(() => {
    if (!initialElectionStatus) {
      fetchElectionInfo();
    }
    fetchMembers();
    getNominationLink();
  }, [electionId]);

  if (loading) {
    return (
      <div className="text-white text-center py-4">Loading members...</div>
    );
  }

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      try {
        const response = await deleteCommitteeMember(0, getJWT() || '');
        if (response.status === 200 || response.status === 201) {
          toast({
            title: 'Deleted Election Successfully',
            duration: 3000,
          });
          setOpenDeleteModal(false);
        }
      } catch (error) {
        console.error('Error deleting election member:', error);
      }
    });
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
          {' '}
          <MdOutlineArrowBackIos className="text-white" />
          <div>Back</div>
        </button>

        <div className="flex flex-col gap-y-2">
          <button
            onClick={() => {
              const url = `/election/${encryptId(
                electionId,
                'nomination_key',
              )}/approve_nomination`;
              window.open(url, '_blank'); // Opens in a new tab
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
                'election_access',
              )}/election_access`;
              window.open(url, '_blank');
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
                'monitor_voting',
              )}/monitor_voting`;
              window.open(url, '_blank');
            }}
            className="bg-red-700 rounded-lg px-4 mr-2"
          >
            Monitor election voting
          </button>

          <ManualNomination
            electionId={electionId}
            users={users}
            posts={posts}
          />

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-x-2 bg-red-700 rounded-lg px-4 mr-2"
          >
            {nomination_btn}
            {nomination_btn === 'Nomination Form Link' ? (
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
                  'standing_key',
                )}/standings`;
                window.open(url, '_blank');
              }}
              className="bg-red-700 rounded-lg px-4 mr-2"
            >
              See standings
            </button>
          )}
          <button
            onClick={() => {
              const url = `/election/${encryptId(electionId, 'vote_key')}/vote`;
              window.open(url, '_blank');
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
                      button.state,
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
        {members?.map((member) => (
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
          users={users}
          posts={posts}
        />
      )}
    </>
  );
};

export default ElectionMemberDetails;
