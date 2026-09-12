'use client';

import { getJWT } from '@/data/cookies/getCookies';
import React, { useMemo, useState, useTransition } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select';
import { createLegacyCommitteeMember } from '../actions';
import type {
  MappedUser,
  MappedPost,
  MemberFormData,
  AddCommitteeMemberModalProps,
} from '../types';

const AddCommitteeMemberModal: React.FC<AddCommitteeMemberModalProps> = ({
  electionId,
  onClose,
  fetchMembers,
  users = [],
  posts = [],
}) => {
  const userList: MappedUser[] = useMemo(
    () =>
      users.map((user) => ({
        id: user.userid,
        value: user.userid,
        label: `${user.fullname} - ${user.regno}`,
      })),
    [users],
  );

  const postList: MappedPost[] = useMemo(
    () =>
      posts.map((post) => ({
        value: post.committeepostid,
        label: post.post_name,
      })),
    [posts],
  );

  const [members, setMembers] = useState<MemberFormData[]>([
    { userid: 0, postid: 0, electionid: electionId },
  ]);
  const [loading, startTransition] = useTransition();

  const handleSelectChange = (
    selectedOption: any,
    index: number,
    field: 'userid' | 'postid',
  ) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = selectedOption ? selectedOption.value : 0;
    setMembers(updatedMembers);
  };

  const handleAddMember = () => {
    setMembers([...members, { userid: 0, postid: 0, electionid: electionId }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const token = getJWT() || '';
        for (const member of members) {
          const response = await createLegacyCommitteeMember(
            {
              userid: member.userid,
              postid: member.postid,
              electionid: member.electionid,
            },
            token,
          );
          if (response.status !== 201) {
            throw new Error(`Failed to add member with ID: ${member.userid}`);
          }
        }
        toast.success('Committee Members added successfully.');
        onClose();
      } catch (error) {
        console.error('Error adding members:', error);
        toast.error('Failed to add members.');
      }
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black text-white p-8 rounded-lg w-full max-w-6xl">
        <Toaster />
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">Add Committee Members</h2>
          <button
            onClick={onClose}
            className="bg-gray-200 p-1 w-5 h-5 flex justify-center items-center rounded-full text-black"
          >
            X
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] min-h-[50vh] overflow-y-scroll px-3 flex flex-col justify-between "
        >
          <div>
            {members.map((member, index) => (
              <div
                key={index}
                className=" p-2 m-2 gap-2 grid grid-cols-1 md:grid-cols-2 bg-gray-700 rounded-md"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select User</label>
                  <Select
                    options={userList}
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, index, 'userid')
                    }
                    className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Position</label>
                  <Select
                    options={postList}
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, index, 'postid')
                    }
                    className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddMember}
                className="underline hover:text-red  text-white pb-5"
              >
                Add Another Member
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white rounded px-4 py-2"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white rounded px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommitteeMemberModal;
