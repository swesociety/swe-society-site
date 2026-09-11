'use client';

import ElectionMemberDetails from '@/components/electiondashboard/CommmitteeMembers';
import ElectionModal from '@/components/electiondashboard/CreateElectionModal';
import ElectionCommitteeComponent from '@/components/electiondashboard/ElectionCommitteeComponent';
import CommitteeManagement from '@/components/electiondashboard/CommitteeManagement';
import { APIENDPOINTS } from '@/data/urls';
import { decryptArray, reqSalt_keys } from '@/utils/encrypt_req';
import React, { useState } from 'react';
import type { ElectionCommittee } from '../types';

type Props = {
  initialElections: ElectionCommittee[];
  userRole: string;
};

const ElectionCommitteeView: React.FC<Props> = ({
  initialElections,
  userRole,
}) => {
  const [electionCommittees, setElectionCommittees] =
    useState<ElectionCommittee[]>(initialElections);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isShowFullCommitteee, setShowFullCommitteee] =
    useState<boolean>(false);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const response = await fetch(APIENDPOINTS.election.getAllElection);
      const raw = (await response.json()) as Record<string, string>[];
      const decryptedElectionCommittees = decryptArray(
        raw,
        reqSalt_keys.election.getAllElection,
      );
      setElectionCommittees(decryptedElectionCommittees as ElectionCommittee[]);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <CommitteeManagement />
      {!isShowFullCommitteee && (
        <>
          <div className="w-full flex justify-end ">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-700 rounded-lg px-4 mr-2"
            >
              + Add Election
            </button>
          </div>

          <ElectionCommitteeComponent
            fetchData={fetchData}
            electionCommittees={
              electionCommittees as unknown as import('@/components/electiondashboard/ElectionCommitteeComponent').ElectionCommitteeItem[]
            }
            setShowFullCommitteee={setShowFullCommitteee}
            setSelectedElectionId={setSelectedElectionId}
          />
          {isModalOpen && (
            <ElectionModal
              onClose={() => setIsModalOpen(false)}
              fetchData={fetchData}
            />
          )}
        </>
      )}

      {isShowFullCommitteee && selectedElectionId && (
        <div className="w-full">
          <ElectionMemberDetails
            electionId={selectedElectionId}
            setShowFullCommitteee={setShowFullCommitteee}
          />
        </div>
      )}
    </div>
  );
};

export default ElectionCommitteeView;
