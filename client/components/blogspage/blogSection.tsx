

  'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, User, Calendar, Clock } from 'lucide-react';
import { BACKENDURL } from '@/data/urls';

import { extractText } from '@/utils/TextManupulate';
import HtmlContent from '../blogdashboard/BlogComp/HtmlContent';
import Link from 'next/link';


const BlogCard = ({ blog }:any) => {
  // Function to get first image from photos array
  const getFirstImage = (photos:any) => {
    if (photos && photos.length > 0) {
      return `/api/placeholder/400/250`; // Using placeholder for demo
    }
    return `/api/placeholder/400/250`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 dark:border-gray-700 cursor-pointer">
          <CardHeader className="p-0">
            <img
              src={blog.photos[0]}
              alt={blog.headline}
              className="w-full h-48 object-cover"
            />
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary">
                {blog.blogtype}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 dark:text-gray-100">
              {blog.headline}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
              {extractText(blog.article)}
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 dark:bg-gray-700">
                <User className="w-10 h-8" />
              </Avatar>
              <div>
                <p className="font-medium text-sm dark:text-gray-100">
                  {blog.fullname || 'Anonymous Author'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {blog.designation} at {blog.current_institution}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-3xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {blog.headline}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <img
            src={blog.photos[0]}
            alt={blog.headline}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />
          
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="bg-primary">
              {blog.blogtype}
            </Badge>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              <HtmlContent  content={blog.article}/>
            </p>
          </div>

          <div className="mt-8 border-t dark:border-gray-700 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 dark:bg-gray-700">
                <User className="w-12 h-10" />
              </Avatar>
              <div>
                <p className="font-semibold text-lg dark:text-gray-100">
                  {blog.fullname || 'Anonymous Author'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {blog.designation} at {blog.current_institution}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BlogSection = () => {
  const [blogs, setBlogs] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const blogsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      try {

        const response = await fetch(`${BACKENDURL}blog/landing/approved`);

        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await response.json();
        setBlogs(data);
        setLoading(false);
      } catch (err:any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Pagination calculations
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(blogs.length / blogsPerPage);

  const paginate = (pageNumber:number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400 text-center">
          <h2 className="text-xl font-bold mb-2">Error Loading Blogs</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">
          Blog Posts
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentBlogs.map((blog:any) => (
            <BlogCard key={blog.blogid} blog={blog} />
          ))}
        </div>

        {/* Pagination Controls */}
        {blogs.length > blogsPerPage && (
          <div className="flex justify-center items-center mt-8 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 dark:border-gray-700 dark:hover:bg-primary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => paginate(pageNumber)}
                      className={`w-8 h-8 dark:border-gray-700 ${
                        currentPage === pageNumber 
                          ? 'dark:bg-primary dark:text-white' 
                          : 'dark:hover:bg-gray-800'
                      }`}
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-1 dark:text-gray-400">...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 dark:border-gray-700 dark:hover:bg-primary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <Link href={'/'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>Back</Button></div>
          </Link>
    </div>
  );
};

export default BlogSection;