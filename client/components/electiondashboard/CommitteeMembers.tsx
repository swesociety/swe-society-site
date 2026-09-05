"use client";

import { useState } from "react";
import {
  AdminProfileDialog,
  AdminProfileInfo,
} from "../billing/billingmanage/AdminProfileDialog";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import ConfirmationModal from "../commons/ConfirmationModal";
import { useToast } from "../ui/use-toast";
import {
  CommitteeElection,
  CommitteeMember,
  CommitteeMemberInput,
  CommitteePost,
  CommitteeUser,
  ExecutiveCommittee,
  createCommitteeMember,
  removeCommitteeMember,
  updateCommitteeMember,
} from "./actions";

interface CommitteeMembersProps {
  members: CommitteeMember[];
  posts: CommitteePost[];
  users: CommitteeUser[];
  elections: CommitteeElection[];
  executiveCommittees: ExecutiveCommittee[];
  onRefresh: () => Promise<void>;
}

type MemberForm = {
  userid: string;
  postid: string;
  electionid: string;
  executive_committeeid: string;
  service_start: string;
  service_end: string;
};

const emptyMemberForm: MemberForm = {
  userid: "",
  postid: "",
  electionid: "",
  executive_committeeid: "",
  service_start: "",
  service_end: "",
};

const toDateTimeLocal = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";

const formatServiceDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB") : "Not set";

const CommitteeMembers = ({
  members,
  posts,
  users,
  elections,
  executiveCommittees,
  onRefresh,
}: CommitteeMembersProps) => {
  const [memberForm, setMemberForm] = useState<MemberForm>(emptyMemberForm);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(
    null,
  );
  const [deletingMember, setDeletingMember] = useState<CommitteeMember | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] =
    useState<AdminProfileInfo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setEditingMember(null);
    setMemberForm(emptyMemberForm);
    setIsModalOpen(false);
  };

  const saveMember = async (event: React.FormEvent) => {
    event.preventDefault();
    const input: CommitteeMemberInput = {
      userid: Number(memberForm.userid),
      postid: Number(memberForm.postid),
      executive_committeeid: Number(memberForm.executive_committeeid),
      service_start: memberForm.service_start,
      service_end: memberForm.service_end,
      ...(memberForm.electionid
        ? { electionid: Number(memberForm.electionid) }
        : {}),
    };

    if (
      !input.userid ||
      !input.postid ||
      !input.executive_committeeid ||
      !input.service_start ||
      !input.service_end
    ) {
      toast({
        title: "Complete all member fields",
        description:
          "Select a member, post, and Executive Committee. Election is optional.",
        variant: "destructive",
      });
      return;
    }

    if (new Date(input.service_end) <= new Date(input.service_start)) {
      toast({
        title: "Invalid service period",
        description: "Service end must be after service start.",
        variant: "destructive",
      });
      return;
    }

    const alreadyAssigned = members.some(
      (member) =>
        member.userid === input.userid &&
        member.executive_committeeid === input.executive_committeeid &&
        member.committeeid !== editingMember?.committeeid,
    );
    if (alreadyAssigned) {
      toast({
        title: "User already assigned",
        description:
          "A user can have only one post in the same Executive Committee.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingMember) {
        await updateCommitteeMember(editingMember.committeeid, input);
      } else {
        await createCommitteeMember(input);
      }
      resetForm();
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not save committee member",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMember = async () => {
    if (!deletingMember) return;
    try {
      await removeCommitteeMember(deletingMember.committeeid);
      setDeletingMember(null);
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not delete committee member",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (member: CommitteeMember) => {
    setEditingMember(member);
    setMemberForm({
      userid: String(member.userid),
      postid: String(member.postid),
      electionid: member.electionid ? String(member.electionid) : "",
      executive_committeeid: String(member.executive_committeeid),
      service_start: toDateTimeLocal(member.service_start),
      service_end: toDateTimeLocal(member.service_end),
    });
    setIsModalOpen(true);
  };

  const groupedMembers = members.reduce<Record<string, CommitteeMember[]>>(
    (groups, member) => {
      const groupKey = String(member.executive_committeeid || "legacy");
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(member);
      return groups;
    },
    {},
  );

  return (
    <section className="rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Committee Members</h2>
        <button
          className="rounded bg-red-700 px-4 py-2"
          disabled={isSaving}
          onClick={() => setIsModalOpen(true)}
        >
          Add member
        </button>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-gray-300">
              <th className="p-2">Member</th>
              <th className="p-2">Post</th>
              <th className="p-2">Executive Committee</th>
              <th className="p-2">Election reference</th>
              <th className="p-2">Service period</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          {Object.entries(groupedMembers).map(([groupKey, group]) => (
            <tbody key={groupKey}>
              <tr className="bg-gray-800">
                <th colSpan={6} className="p-2 text-left text-red-200">
                  {group[0].executive_committee_name ||
                    "Legacy election committee"}
                  {group[0].executive_committee_year
                    ? ` (${group[0].executive_committee_year})`
                    : ""}
                </th>
              </tr>
              {group.map((member) => (
                <tr
                  key={member.committeeid}
                  className="border-b border-gray-800"
                >
                  <td className="p-2">
                    <button
                      type="button"
                      className="text-left font-medium text-red-200 underline-offset-2 hover:underline"
                      onClick={() =>
                        setSelectedProfile({
                          fullname: member.fullname,
                          regno: member.regno,
                          profile_picture: member.profile_picture,
                          actionTitle: "Committee Member Profile",
                        })
                      }
                    >
                      {member.fullname} ({member.regno})
                    </button>
                  </td>
                  <td className="p-2">{member.post_name}</td>
                  <td className="p-2">
                    {member.executive_committee_name ||
                      "Legacy election committee"}
                  </td>
                  <td className="p-2">
                    {member.electionid
                      ? `${member.election_type} ${member.year}${member.batch ? ` - ${member.batch}` : ""}`
                      : "None"}
                  </td>
                  <td className="p-2 text-xs">
                    <div>{formatServiceDate(member.service_start)}</div>
                    <div className="text-gray-400">
                      to {formatServiceDate(member.service_end)}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="flex gap-3">
                      <button
                        aria-label={`Edit ${member.fullname}`}
                        onClick={() => startEdit(member)}
                      >
                        <MdModeEditOutline />
                      </button>
                      <button
                        aria-label={`Delete ${member.fullname}`}
                        onClick={() => setDeletingMember(member)}
                      >
                        <MdDelete />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editingMember
                  ? "Edit committee member"
                  : "Add committee member"}
              </h3>
              <button
                type="button"
                aria-label="Close member dialog"
                className="text-2xl text-gray-300"
                onClick={resetForm}
              >
                &times;
              </button>
            </div>
            <form onSubmit={saveMember} className="space-y-4">
              <select
                value={memberForm.userid}
                required
                autoFocus
                disabled={isSaving}
                onChange={(event) =>
                  setMemberForm({ ...memberForm, userid: event.target.value })
                }
                className="w-full rounded border p-2 text-black"
              >
                <option value="">Select member</option>
                {users.map((user) => (
                  <option key={user.userid} value={user.userid}>
                    {user.fullname} - {user.regno}
                  </option>
                ))}
              </select>
              <select
                value={memberForm.postid}
                required
                disabled={isSaving}
                onChange={(event) =>
                  setMemberForm({ ...memberForm, postid: event.target.value })
                }
                className="w-full rounded border p-2 text-black"
              >
                <option value="">Select post</option>
                {posts.map((post) => (
                  <option
                    key={post.committeepostid}
                    value={post.committeepostid}
                  >
                    {post.post_name}
                  </option>
                ))}
              </select>
              <select
                value={memberForm.electionid}
                disabled={isSaving}
                onChange={(event) =>
                  setMemberForm({
                    ...memberForm,
                    electionid: event.target.value,
                  })
                }
                className="w-full rounded border p-2 text-black"
              >
                <option value="">Election reference (optional)</option>
                {elections.map((election) => (
                  <option key={election.electionid} value={election.electionid}>
                    {election.election_type} {election.year}
                    {election.batch ? ` - ${election.batch}` : ""}
                  </option>
                ))}
              </select>
              <select
                value={memberForm.executive_committeeid}
                required
                disabled={isSaving}
                onChange={(event) =>
                  setMemberForm({
                    ...memberForm,
                    executive_committeeid: event.target.value,
                  })
                }
                className="w-full rounded border p-2 text-black"
              >
                <option value="">Select Executive Committee</option>
                {executiveCommittees.map((committee) => (
                  <option
                    key={committee.committeeid}
                    value={committee.committeeid}
                  >
                    {committee.committee_name} ({committee.year})
                  </option>
                ))}
              </select>
              <label className="block text-sm text-gray-300">
                Service begins
                <input
                  type="datetime-local"
                  value={memberForm.service_start}
                  required
                  disabled={isSaving}
                  onChange={(event) =>
                    setMemberForm({
                      ...memberForm,
                      service_start: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border p-2 text-black"
                />
              </label>
              <label className="block text-sm text-gray-300">
                Service ends
                <input
                  type="datetime-local"
                  value={memberForm.service_end}
                  required
                  disabled={isSaving}
                  onChange={(event) =>
                    setMemberForm({
                      ...memberForm,
                      service_end: event.target.value,
                    })
                  }
                  className="mt-1 w-full rounded border p-2 text-black"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded bg-gray-700 px-4 py-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  className="rounded bg-red-700 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingMember
                      ? "Update member"
                      : "Add member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deletingMember && (
        <ConfirmationModal
          title="Delete committee member?"
          subtitle="This removes the member from the selected election committee."
          confirmButtonTitle="Delete"
          onConfirm={deleteMember}
          onCancel={() => setDeletingMember(null)}
        />
      )}
      <AdminProfileDialog
        open={Boolean(selectedProfile)}
        onOpenChange={(open) => !open && setSelectedProfile(null)}
        adminInfo={selectedProfile}
      />
    </section>
  );
};

export default CommitteeMembers;
