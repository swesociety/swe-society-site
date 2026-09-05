"use client";

import ElectionMemberDetails from "@/components/electiondashboard/CommmitteeMembers";
import ElectionModal from "@/components/electiondashboard/CreateElectionModal";
import ElectionCommitteeComponent from "@/components/electiondashboard/ElectionCommitteeComponent";
import CommitteeManagement from "@/components/electiondashboard/CommitteeManagement";
import { getUserRole } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { decryptArray, reqSalt_keys } from "@/utils/encrypt_req";
import React, { useEffect, useState } from "react";

const ElectionCommittee: React.FC = () => {
  const [electionCommittees, setElectionCommittees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShowFullCommitteee, setShowFullCommitteee] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState<number | null>(
    null,
  );
  const [role, set_role] = useState("");

  const fetchData = async () => {
    try {
      // const response = await fetch(`${APIENDPOINTS.election.getAllElection}`);
      const response1 = await fetch(`${APIENDPOINTS.election.getAllElection}`);
      const data1 = await response1.json();
      const decryptedElectionCommittees = decryptArray(
        data1,
        reqSalt_keys.election.getAllElection,
      );
      setElectionCommittees(decryptedElectionCommittees);
      const t_role = getUserRole();
      set_role(t_role || "");
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            electionCommittees={electionCommittees}
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

export default ElectionCommittee;
