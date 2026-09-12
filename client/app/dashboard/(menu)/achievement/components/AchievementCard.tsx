'use client';
import React, { useState, useTransition } from 'react';
import { MdDelete, MdModeEditOutline } from 'react-icons/md';
import EditAchievementModal from './EditAchievementModal';
import ConfirmationModal from '../../../../../components/commons/ConfirmationModal';
import { getJWT } from '@/data/cookies/getCookies';
import { useToast } from '@/components/ui/use-toast';
import { Achievement, FormDataType } from '../types';
import { deleteAchievementById, updateAchievementById } from '../actions';

type Props = {
  achievements: Achievement[];
  fetchDataAll?: () => void;
  isAdmin?: boolean;
};

const AchievementCard: React.FC<Props> = ({
  achievements,
  fetchDataAll,
  isAdmin,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selecteAchieveId, setSelectedAchieveId] = useState<number | null>(
    null,
  );
  const [loading, startTransition] = useTransition();
  const [approvalStatusModal, setApprovalStatusModal] = useState(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormDataType>({
    achieveid: 0,
    teamname: '',
    mentor: '',
    teammembers: [],
    eventname: '',
    segment: '',
    rank: '',
    photos: [],
    task: '',
    solution: '',
    techstack: '',
    resources: '',
    startdate: '',
    enddate: '',
    organizer: '',
    venu: '',
  });

  const handleEditClick = (achievement: Achievement) => {
    const transformedFormData: FormDataType = {
      achieveid: achievement.achieveid,
      teamname: achievement.teamname,
      mentor: achievement.mentor || '',
      teammembers: achievement.teammembers.map((member) => member.userid),
      eventname: achievement.eventname,
      segment: achievement.segment,
      rank: achievement.rank,
      photos: achievement.photos,
      task: achievement.task || '',
      solution: achievement.solution || '',
      techstack: achievement.techstack,
      resources: achievement.resources || '',
      startdate: achievement.startdate || '',
      enddate: achievement.enddate || '',
      organizer: achievement.organizer || '',
      venu: achievement.venu || '',
    };

    setFormData(transformedFormData);
    setIsEditModalOpen(true);
  };

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-500">No achievements available</p>
      </div>
    );
  }

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      const response = await deleteAchievementById(
        selecteAchieveId?.toString() || '',
        getJWT() || '',
      );
      if (response?.status === 200 || response?.status === 201) {
        toast({
          title: 'Deleted achievement Successfully',
          duration: 3000,
        });
        fetchDataAll?.();
        setOpenDeleteModal(false);
      } else {
        toast({
          title: 'Failed to delete achievement',
          variant: 'destructive',
          duration: 3000,
        });
      }
    });
  };

  const handleApprovalStatus = () => {
    startTransition(async () => {
      const response = await updateAchievementById(
        selecteAchieveId?.toString() || '',
        getJWT() || '',
        isApproved,
      );
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Status Updated Successfully',
          duration: 3000,
        });
        setApprovalStatusModal(false);
        fetchDataAll?.();
      } else {
        toast({
          title: 'Failed to update status',
          variant: 'destructive',
          duration: 3000,
        });
      }
    });
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
              {isAdmin && (
                <button
                  disabled={loading}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedAchieveId(achievement.achieveid);
                    setIsApproved(achievement.approval_status);
                    setApprovalStatusModal(true);
                  }}
                  className={`p-2 ${achievement.approval_status ? 'text-gray-400 border border-gray-600 bg-gray-800' : 'bg-white text-black border border-black'}  rounded  text-xs`}
                >
                  {achievement.approval_status ? 'Approved' : 'Approve'}
                </button>
              )}
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  handleEditClick(achievement);
                }}
                disabled={loading}
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
                disabled={loading}
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
                <span className="font-semibold text-red-300"> Segment:</span>{' '}
                {achievement.segment}
              </p>
              <p className="">
                <span className="font-semibold text-red-300">Team Name:</span>{' '}
                {achievement.teamname}
              </p>
              <p className="">
                <span className="font-semibold text-red-300">Tech Stack:</span>{' '}
                {achievement.techstack}
              </p>
            </div>
            <div className="mt-2">
              <div className="font-semibold">Team Members:</div>
              <div className="text-white bg-gray-900 pr-3 py-2 rounded-lg m-1 text-sm flex items-center">
                {achievement.teammembers
                  .map(
                    (member) =>
                      `${member.fullname || 'SWE student'} (${
                        member.session || 'Unknown'
                      })`,
                  )
                  .join(', ')}
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
            fetchDataAll?.();
          }}
          formDatass={formData}
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
          onCancel={() => {
            setApprovalStatusModal(false);
          }}
        />
      )}
    </>
  );
};

export default AchievementCard;
