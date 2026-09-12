'use client';

import BlogModal from '@/components/blogdashboard/AddBlogModal';
import BlogCard from '@/components/blogdashboard/BlogComp/BlogCard';
import BlogEditModal from '@/components/blogdashboard/BlogComp/BlogEditModal';
import FullBlogCard from '@/components/blogdashboard/BlogComp/FullBlog';
import ConfirmationModal from '@/components/commons/ConfirmationModal';
import { useToast } from '@/components/ui/use-toast';
import { getJWT } from '@/data/cookies/getCookies';
import { APIENDPOINTS } from '@/data/urls';
import React, { useState, useTransition } from 'react';
import type { Blog, BlogFormData } from '../types';
import { deleteBlogById, updateBlogApprovalStatusById } from '../actions';

type Props = {
  initialBlogs: Blog[];
};

const AdminBlog: React.FC<Props> = ({ initialBlogs }) => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [selecteBlogId, setSelecteBlogId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isShowFullBlog, setShowFullBlog] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);
  const [approvalStatusModal, setApprovalStatusModal] =
    useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, startTransition] = useTransition();

  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const response = await fetch(APIENDPOINTS.blogs.getAllBlog);
      const data = (await response.json()) as Blog[];
      setBlogs(data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const selectedBlog: BlogFormData = (() => {
    if (selecteBlogId !== null) {
      const matched = blogs.find((b) => b.blogid === selecteBlogId);
      if (matched) {
        return {
          blogid: matched.blogid,
          userid: matched.userid,
          headline: matched.headline,
          designation: matched.designation ?? '',
          current_institution: matched.current_institution ?? '',
          article: matched.article,
          photos: matched.photos,
          blogtype: matched.blogtype,
          approval_status: matched.approval_status,
        };
      }
    }
    return {
      blogid: 0,
      userid: 0,
      headline: '',
      designation: '',
      current_institution: '',
      article: '',
      photos: [],
      blogtype: '',
      approval_status: false,
    };
  })();

  const selectedFullBlog: Blog = blogs.find(
    (b) => b.blogid === selecteBlogId,
  ) ?? {
    blogid: 0,
    userid: 0,
    headline: '',
    designation: null,
    current_institution: null,
    article: '',
    photos: [],
    blogtype: '',
    approval_status: false,
    fullname: null,
  };

  const handleDeleteConfirm = () => {
    startTransition(async () => {
      const token = getJWT();
      const response = await deleteBlogById(selecteBlogId ?? 0, token ?? '');
      toast({
        title: response.message,
        duration: 3000,
        variant: response.success ? 'default' : 'destructive',
      });

      setOpenDeleteModal(false);
      fetchBlogs();
    });
  };

  const handleApprovalStatus = async () => {
    startTransition(async () => {
      const token = getJWT();
      const response = await updateBlogApprovalStatusById(
        selecteBlogId ?? 0,
        token ?? '',
        isApproved,
      );
      toast({
        title: response.message,
        duration: 3000,
        variant: response.success ? 'default' : 'destructive',
      });

      setApprovalStatusModal(false);
      fetchBlogs();
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2 py-16 mb-16">
      <div className="w-full mt-4">
        <div className="text-3xl text-center font-bold">Blogs</div>
      </div>
      {!isShowFullBlog && (
        <>
          <div className="w-full flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-700 rounded-lg px-4 mr-2"
            >
              + Add Blog
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-3 mr-4">
            {blogs.map((blog) => (
              <div key={blog.blogid} className="w-full relative">
                <div className="absolute top-4 right-32">
                  <button
                    onClick={() => {
                      setSelecteBlogId(blog.blogid);
                      setIsApproved(blog.approval_status);
                      setApprovalStatusModal(true);
                    }}
                    className={`p-2 ${
                      blog.approval_status
                        ? 'text-gray-400 border border-gray-600'
                        : 'bg-white text-black'
                    } rounded text-xs`}
                  >
                    {blog.approval_status ? 'Approved' : 'Approve'}
                  </button>
                </div>
                <BlogCard
                  blogid={blog.blogid}
                  label={blog.blogtype}
                  title={blog.headline}
                  description={blog.article}
                  author={blog.fullname ?? 'Anonymous'}
                  image={blog.photos[0] ?? null}
                  setBlogId={setSelecteBlogId}
                  setOpenDeleteModal={setOpenDeleteModal}
                  setOpenEditModal={setOpenEditModal}
                  setShowFullBlog={setShowFullBlog}
                />
              </div>
            ))}
          </div>
          {isModalOpen && (
            <BlogModal
              onClose={() => setIsModalOpen(false)}
              fetchDataAll={fetchBlogs}
            />
          )}
        </>
      )}

      {isShowFullBlog && (
        <FullBlogCard
          blogDetails={selectedFullBlog}
          setShowFullBlog={setShowFullBlog}
        />
      )}

      {openDeleteModal && (
        <ConfirmationModal
          title="Confirm Deletion"
          subtitle="Are you sure you want to delete the Blog? This action cannot be undone."
          confirmButtonTitle="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setOpenDeleteModal(false)}
        />
      )}

      {approvalStatusModal && (
        <ConfirmationModal
          title="Confirm Approval Status"
          subtitle={`Are you sure you want to ${isApproved ? 'Disapprove' : 'Approve'} the Blog? This action cannot be undone.`}
          confirmButtonTitle={isApproved ? 'Disapprove' : 'Approve'}
          onConfirm={handleApprovalStatus}
          onCancel={() => setApprovalStatusModal(false)}
        />
      )}

      {openEditModal && (
        <BlogEditModal
          onClose={() => setOpenEditModal(false)}
          fetchDataAll={fetchBlogs}
          formDataPrev={selectedBlog}
        />
      )}
    </div>
  );
};

export default AdminBlog;
