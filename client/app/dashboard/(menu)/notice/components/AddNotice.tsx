'use client';

import { IoIosAddCircleOutline } from 'react-icons/io';
import { NoticeFormModal } from './NoticeFormModal';

type AddNoticeProps = {
  fetch_notices: () => void;
};

function AddNotice({ fetch_notices }: AddNoticeProps) {
  return (
    <NoticeFormModal
      mode="add"
      onSuccess={fetch_notices}
      trigger={
        <button className="bg-primary flex items-center text-primary-foreground hover:bg-primary/90 rounded-lg font-bold px-4 py-2">
          <IoIosAddCircleOutline className="mr-2 text-2xl" /> Add Notice
        </button>
      }
    />
  );
}

export default AddNotice;
