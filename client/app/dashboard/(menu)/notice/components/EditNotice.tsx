'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { NoticeFormModal } from './NoticeFormModal';
import type { NoticeFormValues } from '../types';

type EditNoticeProps = {
  noticeid: number;
  notice_provider: number;
  notice_date: string;
  expire_date: string;
  headline: string;
  notice_body: string;
  picture: string | null;
  file: string | null;
  fetch_notices: () => void;
};

function EditNotice({
  noticeid,
  notice_provider,
  notice_date,
  expire_date,
  headline,
  notice_body,
  picture,
  file,
  fetch_notices,
}: EditNoticeProps) {
  const initialValues: Partial<NoticeFormValues> = {
    notice_provider,
    notice_date,
    expire_date,
    headline,
    notice_body,
    picture: picture ?? '',
    file: file ?? '',
  };

  return (
    <NoticeFormModal
      mode="edit"
      noticeId={noticeid}
      initialValues={initialValues}
      onSuccess={fetch_notices}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-300 hover:text-blue-600 hover:bg-blue-100/10"
        >
          <Edit className="h-4 w-4" />
        </Button>
      }
    />
  );
}

export default EditNotice;
