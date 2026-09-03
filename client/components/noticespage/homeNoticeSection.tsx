'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, FileDown, FileText, Image as ImageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BACKENDURL } from '@/data/urls';

const NoticeCard = ({ notice }:any) => {
  const formatDate = (dateString:any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isImageFile = (url: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    return imageExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  const isPDFFile = (url: string) => {
    return url.toLowerCase().endsWith('.pdf');
  };

  const getFileName = (url: string) => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleDownload = async (url: string | URL | Request, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const FileSection = ({ fileUrl }:any) => {
    if (!fileUrl) return null;

    const fileName = getFileName(fileUrl);

    return (
      <div className="mt-4 border rounded-lg p-4 bg-gray-100 dark:bg-gray-800 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isImageFile(fileUrl) ? (
              <ImageIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <FileText className="h-5 w-5 text-blue-500" />
            )}
            <span className="text-sm text-gray-800 dark:text-gray-300 truncate max-w-xs">
              {fileName}
            </span>
          </div>
          <Button
            onClick={() => handleDownload(fileUrl, fileName)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Download
          </Button>
        </div>
        {isImageFile(fileUrl) && (
          <div className="mt-4">
            <img
              src={fileUrl}
              alt="Notice attachment"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        )}
        {isPDFFile(fileUrl) && (
          <div className="mt-4">
            <iframe
              src={`${fileUrl}#view=fit`}
              className="w-full h-96 rounded-lg"
              title="PDF Preview"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="w-full max-w-md cursor-pointer hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-bold text-primary">
                {notice.headline}
              </CardTitle>
              <div className="flex items-center gap-2">
                {notice.file && <FileText className="h-5 w-5 text-gray-400 dark:text-gray-600" />}
                <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </div>
            <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              {formatDate(notice.notice_date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-gray-700 dark:text-gray-300">{notice.notice_body}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Expires: {formatDate(notice.expire_date)}</span>
            </div>
          </CardFooter>
        </Card>
      </DialogTrigger>

      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {notice.headline}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-gray-800 dark:text-gray-300">
          <p>{notice.notice_body}</p>
          {notice.file && <FileSection fileUrl={notice.file} />}
          <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Posted: {formatDate(notice.notice_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Expires: {formatDate(notice.expire_date)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const HomeNoticeSection = () => {
    const path = usePathname()
  const [notices, setNotices] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await fetch(`${BACKENDURL}notice`);
        if (!response.ok) {
          throw new Error('Failed to fetch notices');
        }
        const data = await response.json();
        // Take only the first 6 notices
        setNotices(data.slice(0, 6));
        setLoading(false);
      } catch (err:any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-800 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
    <div className="flex flex-col items-center justify-center mt-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-primary">
        Latest Notices
      </h1>
      <div className='w-full flex justify-center  max-w-[1400px]'>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3   mx-0 md:mx-10">

        {notices.map((notice:any) => (

          <NoticeCard key={notice.noticeid} notice={notice} />
        ))}
      </div>
      </div>
    </div>
    {path==='/'&&(
      <Link href={'/notices'}>
      <div className='flex flex-col items-end justify-end p-10'>    
          <Button className='flex flex-col justify-center items-end'>All Notices</Button></div>
          </Link>
          )}
    </div>
  );
};

export default HomeNoticeSection;