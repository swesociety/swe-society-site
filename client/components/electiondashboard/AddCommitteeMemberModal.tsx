"use client";
import { getJWT } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Select from "react-select";

interface UserResponse {
  userid: number;
  regno: string;
  fullname: string;
}

interface PostResponse {
  committeepostid: number;
  post_name: string;
}

interface MappedUser {
  id: number;
  value: number;
  label: string;
}

interface MappedPost {
  value: number;
  label: string;
}

interface MemberFormData {
  userid: number;
  postid: number;
  electionid: number;
}

const AddCommitteeMemberModal: React.FC<{
  electionId: number;
  onClose: () => void;
  fetchMembers: () => void;
}> = ({ electionId, onClose, fetchMembers }) => {
  const [userList, setUserList] = useState<MappedUser[]>([]);
  const [postList, setPostList] = useState<MappedPost[]>([]);
  const [members, setMembers] = useState<MemberFormData[]>([
    { userid: 0, postid: 0, electionid: electionId },
  ]);

  useEffect(() => {
    // Fetch users list
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BACKENDURL}users/`);
        const users: UserResponse[] = response.data;
        const mappedUsers = users.map((user) => ({
          id: user.userid,
          value: user.userid,
          label: `${user.fullname} - ${user.regno}`,
        }));
        setUserList(mappedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    // Fetch post list
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${BACKENDURL}election/positions`);
        const posts: PostResponse[] = response.data;
        const mappedPosts = posts.map((post) => ({
          value: post.committeepostid,
          label: post.post_name,
        }));
        setPostList(mappedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchUsers();
    fetchPosts();
  }, []);

  const handleSelectChange = (
    selectedOption: any,
    index: number,
    field: "userid" | "postid"
  ) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = selectedOption ? selectedOption.value : 0;
    setMembers(updatedMembers);
  };

  const handleAddMember = () => {
    setMembers([...members, { userid: 0, postid: 0, electionid: electionId }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Loop through the members and send individual API requests
      console.log(members);
      for (const member of members) {
        const response = await axios.post(
          `${BACKENDURL}election/members/create`,
          {
            userid: member.userid, // assuming member has userid property
            postid: member.postid, // assuming member has postid property
            electionid: member.electionid, // assuming member has electionid property
          },
          {
            headers: {
              Authorization: `Bearer ${getJWT()}`,
            },
          }
        );

        // Handle response for each member (optional)
        if (response.status !== 201) {
          throw new Error(`Failed to add member with ID: ${member.userid}`);
        }
      }

      // Show success message after all requests are completed
      toast.success("Committee Members added successfully.");
      onClose();
      fetchMembers();
    } catch (error) {
      console.error("Error adding members:", error);
      toast.error("Failed to add members.");
    }
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
                      handleSelectChange(selectedOption, index, "userid")
                    }
                    className="border rounded w-full text-gray-800 bg-gray-100 leading-tight focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Position</label>
                  <Select
                    options={postList}
                    onChange={(selectedOption) =>
                      handleSelectChange(selectedOption, index, "postid")
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
              className="bg-red-600 text-white rounded px-4 py-2"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCommitteeMemberModal;
