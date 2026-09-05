"use client";
import React, { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import EditAchievementModal from "./dashboardcomponents.tsx/EditAchievementModal";
import ConfirmationModal from "../commons/ConfirmationModal";
import axios from "axios";
import { BACKENDURL } from "@/data/urls";
import { getJWT } from "@/data/cookies/getCookies";
import { useToast } from "@/components/ui/use-toast";
interface Achievement {
  achieveid: number;
  teamid: number;
  teamname: string;
  mentor: string | null;
  task: string | null;
  solution: string | null;
  resources: string | null;
  startdate: string | null;
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  techstack: string;
  enddate: string | null;
  organizer: string | null;
  venu: string | null;
  approval_status:boolean;
  teammembers: {
    userid: number;
    fullname: string;
    session: string;
  }[];
}

interface Props {
  achievements: Achievement[];
  fetchDataAll: () => void;
  isAdmin?: boolean;
}

interface FormData {
  achieveid: number;
  teamname: string;
  mentor: string;
  teammembers: number[];
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  task: string;
  solution: string;
  techstack: string;
  resources: string;
  startdate: string;
  enddate: string;
  organizer: string;
  venu: string;
}

const AchievementComponent: React.FC<Props> = ({
  achievements,
  fetchDataAll,
  isAdmin
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selecteAchieveId, setSelectedAchieveId] = useState<number | null>(
    null
  );
  const [approvalStatusModal, setApprovalStatusModal] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    achieveid: 0,
    teamname: "",
    mentor: "",
    teammembers: [],
    eventname: "",
    segment: "",
    rank: "",
    photos: [],
    task: "",
    solution: "",
    techstack: "",
    resources: "",
    startdate: "",
    enddate: "",
    organizer: "",
    venu: "",
  });

  const handleEditClick = (achievement: Achievement) => {
    // Map the Achievement object to the FormData structure
    const transformedFormData: FormData = {
      achieveid: achievement.achieveid,
      teamname: achievement.teamname,
      mentor: achievement.mentor || "", // Default null to empty string
      teammembers: achievement.teammembers.map((member) => member.userid), // Extract user IDs
      eventname: achievement.eventname,
      segment: achievement.segment,
      rank: achievement.rank,
      photos: achievement.photos,
      task: achievement.task || "", // Default null to empty string
      solution: achievement.solution || "", // Default null to empty string
      techstack: achievement.techstack,
      resources: achievement.resources || "", // Default null to empty string
      startdate: achievement.startdate || "", // Default null to empty string
      enddate: achievement.enddate || "", // Default null to empty string
      organizer: achievement.organizer || "", // Default null to empty string
      venu: achievement.venu || "", // Default null to empty string
    };

    setFormData(transformedFormData); // Set transformed data
    setIsEditModalOpen(true); // Open the modal
  };

  // Check if there are any achievements to display
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-500">No achievements available</p>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${BACKENDURL}achievement/post/${selecteAchieveId}`,
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
        fetchDataAll();
        setOpenDeleteModal(false);

        // window.location.reload();
      }
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  const handleApprovalStatus = async () => {
       
    try {
      const response = await axios.put(
        `${BACKENDURL}achievement/poststatus/${selecteAchieveId}`,
        { approval_status: !isApproved },
        {
          headers: {
            Authorization: `Bearer ${getJWT()}`,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        toast({
            title: "Status Updated Successfully",
            duration: 3000,
          });
          setApprovalStatusModal(false);
          fetchDataAll();
          
         
        
        // window.location.reload();
      }
    } catch (error) {
      console.error("Error creating election:", error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 px-4 h-[70vh] overflow-y-scroll">
        {achievements.map((achievement) => (
          <div
            key={achievement.achieveid}
            className="p-4 border rounded-lg shadow-md relative"
          >
            <div className="flex justify-end w-full right-10 top-5 space-x-3 absolute">
            {isAdmin &&  <button
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedAchieveId(achievement.achieveid);
                  setIsApproved(achievement.approval_status);
                  setApprovalStatusModal(true);
                }}
                className={`p-2 ${achievement.approval_status ? 'text-gray-400 border border-gray-600 bg-gray-800' : 'bg-white text-black border border-black'}  rounded  text-xs`}>{achievement.approval_status ? "Approved" : "Approve"}
              </button>}
            <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleEditClick(achievement);
                }}
                className="p-2 rounded border bg-gray-200 border-black  flex items-center justify-center"
              >
                <MdModeEditOutline className="text-black text-sm" />
              </button>
              
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedAchieveId(achievement.achieveid);
                  setOpenDeleteModal(true);
                }}
                className="p-2 rounded border bg-gray-200 border-black  flex items-center justify-center"
              >
                <MdDelete className="text-black text-sm" />
              </button>
            </div>

            {achievement.photos && achievement.photos.length > 0 && (
              <div className="mb-4">
                <img
                  src={achievement.photos[0]}
                  alt="Achievement"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
            <div className="mb-2">
              <p className="font-semibold text-lg md:text-lg">
                {achievement.rank} in {achievement.eventname}
              </p>
              <p className="">
                <span className="font-semibold text-red-300"> Segment:</span>{" "}
                {achievement.segment}
              </p>
              <p className="">
                <span className="font-semibold text-red-300">Team Name:</span>{" "}
                {achievement.teamname}
              </p>
              <p className="">
                <span className="font-semibold text-red-300">Tech Stack:</span>{" "}
                {achievement.techstack}
              </p>
            </div>
            <div className="mt-2">
              <div className="font-semibold">Team Members:</div>
              <div className="text-white bg-gray-900 pr-3 py-2 rounded-lg m-1 text-sm flex items-center">
                {achievement.teammembers
                  .map(
                    (member) =>
                      `${member.fullname || "SWE student"} (${
                        member.session || "Unknown"
                      })`
                  )
                  .join(", ")}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditModalOpen && (
        <EditAchievementModal
          onClose={() => setIsEditModalOpen(false)}
          onAchievementEdited={() => {
            setIsEditModalOpen(false);
            fetchDataAll();
          }}
          formDatass={formData} // Pass the selected achievement
        />
      )}
      {openDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          subtitle="Are you sure you want to delete the achievement? This action cannot be undone."
          confirmButtonTitle="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setOpenDeleteModal(false);
          }}
        />
      )}
      {approvalStatusModal && (
        <ConfirmationModal
          title="Confirm Approval Status"
          subtitle={`Are you sure you want to ${isApproved ? 'Disapprove' : 'Approve'} the Achievement? This action cannot be undone.`}
          confirmButtonTitle={`${isApproved ? 'Disapprove' : 'Approve'}`}
          onConfirm={handleApprovalStatus}
          onCancel={()=>{setApprovalStatusModal(false)}}
        />
      )}
    </>
  );
};

export default AchievementComponent;
