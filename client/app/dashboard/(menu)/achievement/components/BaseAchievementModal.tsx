'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Select, { MultiValue } from 'react-select';
import { getJWT } from '@/data/cookies/getCookies';
import { DatePicker } from '@/components/commons/DatePicker';
import { useToast } from '@/components/ui/use-toast';
import { uploadImageToCloud } from '@/utils/ImageUploadService';
import {
  createAchievement,
  editAchievementById,
  getAchievementUsers,
  type AchievementUser,
} from '../actions';

export interface OtherMember {
  othermember: string;
  other_member_institute: string;
}

export interface AchievementFormData {
  achieveid?: number;
  teamname: string;
  mentor: string;
  teammembers?: number[];
  eventname: string;
  segment: string;
  rank: string;
  photos: string[];
  task: string;
  solution: string;
  techstack: string;
  resources: string;
  others?: OtherMember[];
  startdate: string;
  enddate: string;
  organizer: string;
  venu: string;
}

export interface MappedUser {
  id: number;
  value: number;
  label: string;
}

export interface BaseAchievementModalProps {
  mode: 'add' | 'edit';
  initialData?: AchievementFormData;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultFormData: AchievementFormData = {
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
  others: [],
  startdate: '',
  enddate: '',
  organizer: '',
  venu: '',
};

const BaseAchievementModal: React.FC<BaseAchievementModalProps> = ({
  mode,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [loading, startTransition] = useTransition();
  const [userList, setUserList] = useState<MappedUser[]>([]);
  const [formData, setFormData] = useState<AchievementFormData>(
    initialData ? { ...defaultFormData, ...initialData } : defaultFormData,
  );
  const { toast } = useToast();

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isEdit) {
      startTransition(async () => {
        const data: AchievementUser[] = await getAchievementUsers();
        setUserList(
          data.map((user) => ({
            id: user.userid,
            value: user.userid,
            label: user.regno,
          })),
        );
      });
    }
  }, [isEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof AchievementFormData,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleOthersChange = (
    index: number,
    field: keyof OtherMember,
    value: string,
  ) => {
    const updatedOthers = [...(formData.others || [])];
    if (updatedOthers[index]) {
      updatedOthers[index] = {
        ...updatedOthers[index],
        [field]: value,
      };
      setFormData((prev) => ({
        ...prev,
        others: updatedOthers,
      }));
    }
  };

  const addOthersField = () => {
    setFormData((prev) => ({
      ...prev,
      others: [...(prev.others || []), { othermember: '', other_member_institute: '' }],
    }));
  };

  const handleSelectChange = (selectedOptions: MultiValue<MappedUser>) => {
    const selectedIds = selectedOptions.map((option) => option.id);
    setFormData((prev) => ({
      ...prev,
      teammembers: selectedIds,
    }));
  };

  const removePhoto = (index: number) => {
    setFormData((prevData) => ({
      ...prevData,
      photos: prevData.photos.filter((_, i) => i !== index),
    }));
  };

  const handleDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, startdate: date }));
  };

  const handleFileUpload = async (file: File) => {
    startTransition(async () => {
      try {
        const uploadedURL = await uploadImageToCloud(file);
        setFormData((prevData) => ({
          ...prevData,
          photos: [...prevData.photos, uploadedURL],
        }));
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields: (keyof AchievementFormData)[] = [
      'teamname',
      'eventname',
      'segment',
      'rank',
      'photos',
      'startdate',
      'organizer',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field];
      return !value || (Array.isArray(value) && value.length === 0);
    });

    if (missingFields.length > 0) {
      alert(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return;
    }

    startTransition(async () => {
      if (isEdit) {
        const requestBody = {
          eventname: formData.eventname,
          segment: formData.segment,
          organizer: formData.organizer,
          venue: formData.venu,
          startdate: formData.startdate,
          enddate: formData.enddate || formData.startdate,
          rank: formData.rank,
          rankarea: 'National',
          task: formData.task,
          solution: formData.solution,
          techstack: formData.techstack,
          resources: formData.resources,
          photos: formData.photos,
          approval_status: true,
        };

        const response = await editAchievementById(
          formData.achieveid!.toString(),
          requestBody,
          getJWT() || '',
        );

        if (response?.status === 201 || response?.status === 200) {
          toast({
            title: 'Achievement Updated Successfully',
            duration: 3000,
          });
          onSuccess();
        } else {
          toast({
            title: 'Failed to update achievement',
            variant: 'destructive',
            duration: 3000,
          });
        }
      } else {
        const requestBody = {
          teamname: formData.teamname,
          mentor: formData.mentor,
          teammembers: formData.teammembers || [],
          others: (formData.others || []).map((other) => ({
            othermember: other.othermember,
            other_member_institute: other.other_member_institute,
          })),
          eventname: formData.eventname,
          segment: formData.segment,
          organizer: formData.organizer,
          venue: formData.venu,
          startdate: formData.startdate,
          enddate: formData.startdate,
          rank: formData.rank,
          rankarea: 'National',
          task: formData.task,
          solution: formData.solution,
          techstack: formData.techstack,
          resources: formData.resources,
          photos: formData.photos,
          approval_status: false,
        };

        const response = await createAchievement(requestBody, getJWT() || '');

        if (response?.status === 201) {
          toast({
            title: 'Achievement Added Successfully',
            duration: 3000,
          });
          onSuccess();
        } else {
          toast({
            title: 'Failed to add achievement',
            variant: 'destructive',
            duration: 3000,
          });
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-black text-white p-8 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">
            {isEdit ? 'Edit Achievement' : 'Add Achievement'}
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-1 m-2 text-black w-5 h-5 flex justify-center items-center rounded-full"
          >
            X
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 h-[70vh] overflow-y-scroll px-2"
        >
          <div>
            <input
              type="text"
              placeholder="Team Name"
              value={formData.teamname}
              onChange={(e) => handleChange(e, 'teamname')}
              disabled={isEdit || loading}
              className="w-full p-2 rounded bg-gray-700"
            />
            {isEdit && (
              <div className="text-red-400 italic text-xs mt-1">
                Can't Change Team Related Infos
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              placeholder="Mentor"
              value={formData.mentor}
              onChange={(e) => handleChange(e, 'mentor')}
              disabled={isEdit || loading}
              className="w-full p-2 rounded bg-gray-700"
            />
            {isEdit && (
              <div className="text-red-400 italic text-xs mt-1">
                Can't Change Team Related Infos
              </div>
            )}
          </div>

          {!isEdit && (
            <>
              <Select
                name="Team Members"
                isMulti
                options={userList}
                className="border rounded w-full text-gray-800 bg-gray-700 leading-tight focus:outline-none"
                onChange={handleSelectChange}
                isDisabled={loading}
              />
              <div className="w-full text-sm flex justify-end">
                <button
                  type="button"
                  onClick={addOthersField}
                  disabled={loading}
                  className="underline text-red-400"
                >
                  Add member from another department / institution
                </button>
              </div>

              {(formData.others || []).map((other, index) => (
                <div
                  key={index}
                  id="others"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3"
                >
                  <input
                    type="text"
                    placeholder="Other Member"
                    value={other.othermember}
                    onChange={(e) =>
                      handleOthersChange(index, 'othermember', e.target.value)
                    }
                    disabled={loading}
                    className="w-full p-2 rounded bg-gray-700"
                  />
                  <input
                    type="text"
                    placeholder="Other Dept, Institute"
                    value={other.other_member_institute}
                    onChange={(e) =>
                      handleOthersChange(
                        index,
                        'other_member_institute',
                        e.target.value,
                      )
                    }
                    disabled={loading}
                    className="w-full p-2 rounded bg-gray-700"
                  />
                </div>
              ))}
            </>
          )}

          <input
            type="text"
            placeholder="Event Name"
            value={formData.eventname}
            onChange={(e) => handleChange(e, 'eventname')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Segment"
            value={formData.segment}
            onChange={(e) => handleChange(e, 'segment')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Rank"
            value={formData.rank}
            onChange={(e) => handleChange(e, 'rank')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <textarea
            placeholder="Task"
            value={formData.task}
            onChange={(e) => handleChange(e, 'task')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <textarea
            placeholder="Solution"
            value={formData.solution}
            onChange={(e) => handleChange(e, 'solution')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Tech Stack"
            value={formData.techstack}
            onChange={(e) => handleChange(e, 'techstack')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Resources"
            value={formData.resources}
            onChange={(e) => handleChange(e, 'resources')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <div className="space-x-2">
            <label className="text-sm font-medium">Competition Date</label>
            <DatePicker onDateChange={handleDateChange} />
          </div>

          <input
            type="text"
            placeholder="Organizer"
            value={formData.organizer}
            onChange={(e) => handleChange(e, 'organizer')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <input
            type="text"
            placeholder="Venue"
            value={formData.venu}
            onChange={(e) => handleChange(e, 'venu')}
            disabled={loading}
            className="w-full p-2 rounded bg-gray-700"
          />
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Upload Achievement Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full text-sm text-gray-500 bg-gray-700 rounded border border-gray-600 cursor-pointer"
            />
          </div>
          {formData.photos && formData.photos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Uploaded Photos</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-4">
                    {formData.photos.map((photoUrl, index) => (
                      <div
                        key={index}
                        className="relative flex flex-col items-center"
                      >
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          disabled={loading}
                          className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                          aria-label="Remove photo"
                        >
                          &times;
                        </button>
                        <img
                          src={photoUrl}
                          alt={`Uploaded photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded"
                        />
                        <a
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline mt-2"
                        >
                          View Full Image
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-700 rounded px-4 py-2"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 rounded px-4 py-2 disabled:opacity-50"
            >
              {loading ? 'Submitting' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BaseAchievementModal;
