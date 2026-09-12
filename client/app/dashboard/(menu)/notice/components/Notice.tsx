'use client';

import AddNotice from '@/app/dashboard/(menu)/notice/components/AddNotice';
import Notice_Card from '@/components/dashboardpage/notice/notice_card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getJWT } from '@/data/cookies/getCookies';
import React, { useTransition, useState } from 'react';
import type { Notice } from '../types';
import { fetchAllNotices, deleteNoticeById } from '../actions';

type Props = {
  initialNotices: Notice[];
};

const NoticeComponent: React.FC<Props> = ({ initialNotices }) => {
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [onlyMyNotices, setOnlyMyNotices] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { toast } = useToast();

  const [loadingFetch, startFetchTransition] = useTransition();
  const [loadingDelete, startDeleteTransition] = useTransition();

  const fetch_notices = () => {
    startFetchTransition(async () => {
      const response = await fetchAllNotices(getJWT() || '');
      if (response?.status === 200 || response?.status === 201) {
        setNotices(response.data as Notice[]);
      } else {
        console.error('Failed to refresh notices');
      }
    });
  };

  const handle_dlt = (noticeid: number) => {
    startDeleteTransition(async () => {
      const response = await deleteNoticeById(noticeid, getJWT() || '');
      if (response?.status === 200 || response?.status === 204) {
        setNotices((prev) =>
          prev.filter((notice) => notice.noticeid !== noticeid),
        );
        toast({ title: 'Notice deleted successfully.', duration: 3000 });
      } else {
        toast({
          title: 'Failed to delete notice.',
          variant: 'destructive',
          duration: 3000,
        });
      }
    });
  };

  const filteredNotices = notices.filter(
    (notice) =>
      notice.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.notice_body.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isBusy = loadingFetch || loadingDelete;

  return (
    <div className="flex flex-col items-center justify-start gap-4 space-y-2 pt-16 px-4 h-screen">
      <h1>Notices</h1>
      <div className="w-full flex justify-between">
        <Input
          placeholder="Search notices"
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <AddNotice fetch_notices={fetch_notices} />
      </div>
      <div className="w-full h-max grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice) => {
            const noticeCardData = {
              noticeid: notice.noticeid,
              notice_provider: notice.notice_provider ?? notice.userid ?? 0,
              notice_date:
                notice.notice_date ??
                notice.created_at ??
                new Date().toISOString(),
              expire_date: notice.expire_date ?? new Date().toISOString(),
              headline: notice.headline,
              notice_body: notice.notice_body,
              picture: notice.picture ?? null,
              file: notice.file ?? null,
            };
            return (
              <Notice_Card
                key={notice.noticeid}
                notice={noticeCardData}
                handle_dlt={handle_dlt}
                fetch_notices={fetch_notices}
                loading={isBusy}
              />
            );
          })
        ) : (
          <p className="text-white">No matching notices found.</p>
        )}
      </div>

      <div className="w-full flex justify-center items-center gap-2 mt-4">
        <Checkbox
          id="onlyMyNotices"
          onClick={() => {
            setOnlyMyNotices(!onlyMyNotices);
          }}
        />
        <label
          htmlFor="onlyMyNotices"
          className="text-sm font-medium leading-none cursor-pointer"
        >
          See only your notices
        </label>
      </div>
    </div>
  );
};

export default NoticeComponent;
