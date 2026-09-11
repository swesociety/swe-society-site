'use client';

import BlogModal from '@/components/blogdashboard/AddBlogModal';
import BlogCard from '@/components/blogdashboard/BlogComp/BlogCard';
import BlogEditModal from '@/components/blogdashboard/BlogComp/BlogEditModal';
import FullBlogCard from '@/components/blogdashboard/BlogComp/FullBlog';
import ConfirmationModal from '@/components/commons/ConfirmationModal';
import { useToast } from '@/components/ui/use-toast';
import { getJWT, getUserID } from '@/data/cookies/getCookies';
import { BACKENDURL } from '@/data/urls';
import axios from 'axios';
import React, { useState } from 'react';
import type { Blog, BlogFormData } from '@/app/dashboard/(menu)/blog/types';

type Props = {
  initialBlogs: Blog[];
};

const UsersBlog: React.FC<Props> = ({ initialBlogs }) => {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [selecteBlogId, setSelecteBlogId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isShowFullBlog, setShowFullBlog] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openEditModal, setOpenEditModal] = useState<boolean>(false);

  const { toast } = useToast();

  const fetchBlogs = async () => {
    try {
      const userId = getUserID();
      const response = await fetch(`${BACKENDURL}blog/userblog/${userId}`);
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

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(
        `${BACKENDURL}blog/${selecteBlogId}`,
        {
          headers: { Authorization: `Bearer ${getJWT()}` },
        },
      );
      if (response.status === 200 || response.status === 201) {
        toast({ title: 'Deleted Blog Successfully', duration: 3000 });
        setOpenDeleteModal(false);
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
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
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-3 mr-4">
              {blogs.map((blog) => (
                <BlogCard
                  key={blog.blogid}
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
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              No blogs available.
            </div>
          )}
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

export default UsersBlog;
