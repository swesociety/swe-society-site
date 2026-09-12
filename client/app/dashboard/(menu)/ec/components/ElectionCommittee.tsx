'use client';

import ElectionMemberDetails from '@/components/electiondashboard/CommmitteeMembers';
import ElectionModal from '@/components/electiondashboard/CreateElectionModal';
import ElectionCommitteeComponent from '@/components/electiondashboard/ElectionCommitteeComponent';
import CommitteeManagement from '@/components/electiondashboard/CommitteeManagement';
import React, { useState, useTransition } from 'react';
import type { ElectionCommittee } from '../types';
import { getAllElections } from '../actions';

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
  const [loading, startTransition] = useTransition();

  const fetchData = () => {
    startTransition(async () => {
      const elections = await getAllElections();
      setElectionCommittees(elections as ElectionCommittee[]);
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <CommitteeManagement />
      {!isShowFullCommitteee && (
        <>
          <div className="w-full flex justify-end ">
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
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
