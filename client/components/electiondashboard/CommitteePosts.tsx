"use client";

import { useState } from "react";
import { MdDelete, MdModeEditOutline } from "react-icons/md";
import ConfirmationModal from "../commons/ConfirmationModal";
import { useToast } from "../ui/use-toast";
import {
  CommitteePost,
  createCommitteePost,
  removeCommitteePost,
  updateCommitteePost,
} from "./actions";

interface CommitteePostsProps {
  posts: CommitteePost[];
  onRefresh: () => Promise<void>;
}

const CommitteePosts = ({ posts, onRefresh }: CommitteePostsProps) => {
  const [postName, setPostName] = useState("");
  const [editingPost, setEditingPost] = useState<CommitteePost | null>(null);
  const [deletingPost, setDeletingPost] = useState<CommitteePost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setEditingPost(null);
    setPostName("");
    setIsModalOpen(false);
  };

  const savePost = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = postName.trim();
    if (!name) return;

    try {
      if (editingPost) {
        await updateCommitteePost(editingPost.committeepostid, name);
      } else {
        await createCommitteePost(name);
      }
      resetForm();
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not save committee post",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const deletePost = async () => {
    if (!deletingPost) return;
    try {
      await removeCommitteePost(deletingPost.committeepostid);
      setDeletingPost(null);
      await onRefresh();
    } catch (error: any) {
      toast({
        title: "Could not delete committee post",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <section className="rounded-lg border border-gray-700 bg-gray-900 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Committee Posts</h2>
        <button
          className="rounded bg-red-700 px-4 py-2"
          onClick={() => setIsModalOpen(true)}
        >
          Add post
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((post) => (
          <div
            key={post.committeepostid}
            className="flex items-center justify-between rounded border border-gray-700 p-3"
          >
            <span>{post.post_name}</span>
            <span className="flex gap-2">
              <button
                aria-label={`Edit ${post.post_name}`}
                onClick={() => {
                  setEditingPost(post);
                  setPostName(post.post_name);
                  setIsModalOpen(true);
                }}
              >
                <MdModeEditOutline />
              </button>
              <button
                aria-label={`Delete ${post.post_name}`}
                onClick={() => setDeletingPost(post)}
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
                {editingPost ? "Edit committee post" : "Add committee post"}
              </h3>
              <button
                type="button"
                aria-label="Close post dialog"
                className="text-2xl text-gray-300"
                onClick={resetForm}
              >
                &times;
              </button>
            </div>
            <form onSubmit={savePost} className="space-y-4">
              <input
                value={postName}
                onChange={(event) => setPostName(event.target.value)}
                placeholder="Post name"
                required
                autoFocus
                className="w-full rounded border p-2 text-black"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded bg-gray-700 px-4 py-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button className="rounded bg-red-700 px-4 py-2" type="submit">
                  {editingPost ? "Update post" : "Add post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deletingPost && (
        <ConfirmationModal
          title="Delete committee post?"
          subtitle="Existing committee assignments using this post may prevent deletion."
          confirmButtonTitle="Delete"
          onConfirm={deletePost}
          onCancel={() => setDeletingPost(null)}
        />
      )}
    </section>
  );
};

export default CommitteePosts;
