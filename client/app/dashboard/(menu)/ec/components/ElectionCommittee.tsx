'use client';

import ElectionMemberDetails from '@/app/dashboard/(menu)/ec/components/CommmitteeMembers';
import ElectionModal from '@/app/dashboard/(menu)/ec/components/CreateElectionModal';
import ElectionCommitteeComponent from '@/app/dashboard/(menu)/ec/components/ElectionCommitteeComponent';
import CommitteeManagement from '@/app/dashboard/(menu)/ec/components/CommitteeManagement';
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { CommitteeData, ExecutiveCommittee } from '../actions';
import type { ElectionCommittee } from '../types';
import { getAllElections } from '../actions';

type Props = {
  initialElections: ElectionCommittee[];
  userRole: string;
  initialCommitteeData: CommitteeData;
  initialExecutiveCommittees: ExecutiveCommittee[];
};

const ElectionCommitteeView: React.FC<Props> = ({
  initialElections,
  userRole,
  initialCommitteeData,
  initialExecutiveCommittees,
}) => {
  const router = useRouter();
  const [electionCommittees, setElectionCommittees] =
    useState<ElectionCommittee[]>(initialElections);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isShowFullCommitteee, setShowFullCommitteee] =
    useState<boolean>(false);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(
    null,
  );
  const [loading, startTransition] = useTransition();

  const handleRefresh = () => {
    router.refresh();
  };

  const fetchData = () => {
    startTransition(async () => {
      const elections = await getAllElections();
      setElectionCommittees(elections as ElectionCommittee[]);
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <CommitteeManagement
        committeeData={initialCommitteeData}
        executiveCommittees={initialExecutiveCommittees}
        onRefresh={handleRefresh}
      />
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
              electionCommittees as unknown as import('@/app/dashboard/(menu)/ec/components/ElectionCommitteeComponent').ElectionCommitteeItem[]
            }
            setShowFullCommitteee={setShowFullCommitteee}
            setSelectedElectionId={setSelectedElectionId}
            users={initialCommitteeData?.users}
          />
          {isModalOpen && (
            <ElectionModal
              onClose={() => setIsModalOpen(false)}
              fetchData={fetchData}
              users={initialCommitteeData?.users}
            />
          )}
        </>
      )}

      {isShowFullCommitteee && selectedElectionId && (
        <div className="w-full">
          <ElectionMemberDetails
            electionId={selectedElectionId}
            setShowFullCommitteee={setShowFullCommitteee}
            users={initialCommitteeData?.users}
            posts={initialCommitteeData?.posts}
          />
        </div>
      )}
    </div>
  );
};

export default ElectionCommitteeView;
