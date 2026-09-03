"use client"
import React, { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";

import axios from "axios";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import { useToast } from "../ui/use-toast";
import ConfirmationModal from "../commons/ConfirmationModal";

interface ElectionCommitteeProps {
  electionCommittees: {
    electionid: number;
    year?: string | null;
    election_type?: string | null;
    batch?: string | null;
    candidate_form_date?: string | null;
    election_date?: string | null;
    commissioner_userid?: number | null;
    commissioner_fullname?: string | null;
    commissioner_email?: string | null;
    commissioner_profile_picture?: string | null;
    assistant_userid?: number | null;
    assistant_fullname?: string | null;
    assistant_email?: string | null;
    assistant_profile_picture?: string | null;
  }[];
  setShowFullCommitteee: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedElectionId: React.Dispatch<React.SetStateAction<number | null>>;
}

interface ElectionFormData {
    year: string;
    election_type: string;
    candidate_form_date: string;
    election_date: string;
    election_commissioner?: number;
    assistant_commissioner?: number;
  }

const AllBlogs: React.FC<ElectionCommitteeProps> = ({ electionCommittees, setShowFullCommitteee, setSelectedElectionId }) => {
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const { toast } = useToast();
    const [editingElectionData, setEditingElectionData]= useState<ElectionFormData>({
        year: "",
        election_type: "",
        candidate_form_date: "",
        election_date: "",
        election_commissioner: 1,
        assistant_commissioner: 1
    });
    const [editElectionId, setEditElectionId] = useState<number>(0);
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB"); // Format as dd-mm-yyyy
      };

      const handleDeleteConfirm = async () => {
       
        try {
          const response = await axios.delete(
            `${BACKENDURL}election/newelection/${editElectionId}`,
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
            
            window.location.reload();
          }
        } catch (error) {
          console.error("Error creating election:", error);
        }
      };


  return (
    <>
    <div className="w-full p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {electionCommittees.map((election) => (
        <div
         onClick={()=>{
            setSelectedElectionId(election.electionid)
            setShowFullCommitteee(true);
         }}
          key={election.electionid}
          className="bg-gray-900 hover:bg-black cursor-pointer shadow-md rounded-lg p-6 flex flex-col space-y-4 border border-gray-700"
        >
                
        

        
        



        </div>
      ))}


     
    </div>
    {openEditModal && (<></>
    //      <ElectionEditModal onClose={() => setOpenEditModal(false)}  prevformData={editingElectionData} electionId={editElectionId}/>
       )}

{openDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          subtitle="Are you sure you want to delete the blog? This action cannot be undone."
          confirmButtonTitle="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={()=>{setOpenDeleteModal(false)}}
        />
      )}
    </>
  );
};

export default AllBlogs;
