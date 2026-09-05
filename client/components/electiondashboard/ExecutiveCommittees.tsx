"use client";

import { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import ConfirmationModal from "../commons/ConfirmationModal";
import { useToast } from "../ui/use-toast";
import {
  createExecutiveCommittee,
  ExecutiveCommittee,
  removeExecutiveCommittee,
  updateExecutiveCommittee,
} from "./actions";

interface ExecutiveCommitteesProps {
  committees: ExecutiveCommittee[];
  onRefresh: () => Promise<void>;
}

const emptyForm = { committee_name: "", year: "" };

const ExecutiveCommittees = ({
  committees,
  onRefresh,
}: ExecutiveCommitteesProps) => {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<ExecutiveCommittee | null>(null);
  const [deleting, setDeleting] = useState<ExecutiveCommittee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = {
      committee_name: form.committee_name.trim(),
      year: form.year.trim(),
    };
    if (!input.committee_name || !input.year) return;
    try {
      if (editing) {
        await updateExecutiveCommittee(editing.committeeid, input);
      } else {
        await createExecutiveCommittee(input);
      }
      closeModal();
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not save committee",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await removeExecutiveCommittee(deleting.committeeid);
      setDeleting(null);
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not delete committee",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const edit = (committee: ExecutiveCommittee) => {
    setEditing(committee);
    setForm({ committee_name: committee.committee_name, year: committee.year });
    setIsModalOpen(true);
  };

  return (
    <section className="rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Executive Committees</h2>
          <p className="text-sm text-gray-400">
            Manage committees independently from elections.
          </p>
        </div>
        <button
          className="rounded bg-red-700 px-4 py-2"
          onClick={() => setIsModalOpen(true)}
        >
          Add committee
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {committees.map((committee) => (
          <div
            key={committee.committeeid}
            className="flex items-center justify-between rounded border border-gray-700 p-3"
          >
            <div>
              <p className="font-semibold">{committee.committee_name}</p>
              <p className="text-sm text-gray-400">{committee.year}</p>
            </div>
            <span className="flex gap-2">
              <button
                aria-label={`Edit ${committee.committee_name}`}
                onClick={() => edit(committee)}
              >
                <MdModeEditOutline />
              </button>
              <button
                aria-label={`Delete ${committee.committee_name}`}
                onClick={() => setDeleting(committee)}
              >
                <MdDelete />
              </button>
            </span>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editing ? "Edit committee" : "Add committee"}
              </h3>
              <button
                type="button"
                aria-label="Close committee dialog"
                className="text-2xl text-gray-300"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <input
                value={form.committee_name}
                onChange={(event) =>
                  setForm({ ...form, committee_name: event.target.value })
                }
                placeholder="Committee name"
                required
                autoFocus
                className="w-full rounded border p-2 text-black"
              />
              <input
                value={form.year}
                onChange={(event) =>
                  setForm({ ...form, year: event.target.value })
                }
                placeholder="Year"
                required
                className="w-full rounded border p-2 text-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded bg-gray-700 px-4 py-2"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button className="rounded bg-red-700 px-4 py-2" type="submit">
                  {editing ? "Update committee" : "Add committee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleting && (
        <ConfirmationModal
          title="Delete committee?"
          subtitle="This removes the standalone committee record."
          confirmButtonTitle="Delete"
          onConfirm={remove}
          onCancel={() => setDeleting(null)}
        />
      )}
    </section>
  );
};

export default ExecutiveCommittees;
