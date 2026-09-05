"use client";
import { getJWT, getUserRole } from "@/data/cookies/getCookies";
import { APIENDPOINTS } from "@/data/urls";
import { reqSalt_keys, xorEncrypt } from "@/utils/encrypt_req";
import axios from "axios";
import React, { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import ConfirmationModal from "../commons/ConfirmationModal";
import { useToast } from "../ui/use-toast";
import ElectionModal from "./ElectionEditModal";
import { formatDateDDMMYYYY } from "./functions";

interface ElectionCommitteeItem {
  electionid: number;
  year: string;
  election_type: string;
  batch: string;
  candidatereg_start: Date; // ISO date string
  candidatereg_end: Date; // ISO date string
  election_start: Date; // ISO date string
  election_end: Date; // ISO date string
  election_commissioner: number;
  assistant_commissioner: number;
  commissioner_userid: number;
  commissioner_fullname: string;
  commissioner_email: string;
  commissioner_profile_picture: string;
  assistant_userid: number;
  assistant_fullname: string;
  assistant_email: string;
  assistant_profile_picture: string;
}

interface ElectionCommitteeProps {
  electionCommittees: ElectionCommitteeItem[];
  setShowFullCommitteee: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedElectionId: React.Dispatch<React.SetStateAction<number | null>>;
  fetchData: () => void;
}

const ElectionCommitteeComponent: React.FC<ElectionCommitteeProps> = ({
  electionCommittees,
  setShowFullCommitteee,
  setSelectedElectionId,
  fetchData,
}) => {
  const [role, setRole] = useState<string>(getUserRole() || "general_member");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditingModal, setOpenEditModal] = useState<boolean>(false);
  const [editElectionId, setEditElectionId] = useState<number>(-1);
  const [electioneditInfo, setelectioneditInfo] =
    useState<ElectionCommitteeItem>();
  const { toast } = useToast();
  const handleDeleteConfirm = async () => {
    if (editElectionId === -1) return;
    try {
      const encryptedElectionId = xorEncrypt(
        editElectionId.toString(),
        reqSalt_keys.election.deleteElection
      );
      const deleteUrl = `${APIENDPOINTS.election.deleteElection}/${encryptedElectionId}`;
      const jwt = getJWT();

      const response = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      toast({
        title: response.data?.message || "Election deleted successfully",
        duration: 3000,
      });

      setOpenDeleteModal(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error deleting election",
        description: error?.response?.data?.message || error.message,
        duration: 5000,
        variant: "destructive",
      });
      setOpenDeleteModal(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <>
      <div className="w-full p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {electionCommittees.map((election) => (
          <div
            key={election.electionid}
            onClick={() => {
              setSelectedElectionId(election.electionid);
              setShowFullCommitteee(true);
            }}
            className="bg-gray-900 hover:bg-black cursor-pointer shadow-md rounded-lg p-6 flex flex-col space-y-4 border border-gray-700"
          >
            <div className="space-y-2">
              <div className="flex justify-between">
                <h4 className="text-lg font-bold text-red-300">
                  Election Details
                </h4>
                <div className="flex space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenEditModal(true);
                      setelectioneditInfo(election);
                      setEditElectionId(election.electionid);
                    }}
                    className="p-2 rounded border border-red-300 flex items-center justify-center"
                  >
                    <MdModeEditOutline className="text-red-300 text-sm" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditElectionId(election.electionid);
                      setOpenDeleteModal(true);
                    }}
                    className="p-2 rounded border border-red-300 flex items-center justify-center"
                  >
                    <MdDelete className="text-red-300 text-sm" />
                  </button>
                </div>
              </div>

              <p className="font-bold">
                {election.election_type || ""} Election {election.year || ""}
              </p>
              {election.batch && (
                <p>
                  <span className="font-medium">Batch:</span> {election.batch}
                </p>
              )}
              <p>
                <span className="font-medium">Registration Deadline:</span>{" "}
                {formatDateDDMMYYYY(election.candidatereg_end)}
              </p>
              <p>
                <span className="font-medium">Election Date:</span>{" "}
                {formatDateDDMMYYYY(election.election_end)}
              </p>
            </div>

            {election.commissioner_fullname && (
              <div className="flex items-center space-x-4">
                <img
                  src={
                    election.commissioner_profile_picture ||
                    "/default-profile.png"
                  }
                  alt="Commissioner"
                  className="w-12 h-12 rounded-full border border-gray-300"
                />
                <div>
                  <h5 className="text-sm font-bold text-red-300">
                    Commissioner
                  </h5>
                  <h3 className="text-xl font-semibold">
                    {election.commissioner_fullname}
                  </h3>
                  <p className="text-red-300 text-sm">
                    {election.commissioner_email || "No email provided"}
                  </p>
                </div>
              </div>
            )}

            {election.assistant_fullname && (
              <div className="mt-4 flex items-center space-x-4">
                <img
                  src={
                    election.assistant_profile_picture || "/default-profile.png"
                  }
                  alt="Assistant"
                  className="w-12 h-12 rounded-full border border-gray-300"
                />
                <div>
                  <h5 className="text-sm font-bold text-red-300">
                    Assistant Commissioner
                  </h5>
                  <h3 className="text-lg font-semibold">
                    {election.assistant_fullname}
                  </h3>
                  <p className="text-red-300 text-sm">
                    {election.assistant_email || "No email provided"}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {openEditingModal && editElectionId !== -1 && electioneditInfo && (
        <ElectionModal
          onClose={() => setOpenEditModal(false)}
          fetchData={fetchData}
          election_info={electioneditInfo}
        />
      )}

      {openDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          subtitle="Are you sure you want to delete the election? This action cannot be undone."
          confirmButtonTitle="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setOpenDeleteModal(false)}
        />
      )}
    </>
  );
};

export default ElectionCommitteeComponent;
