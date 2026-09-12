'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { getJWT, getUserID } from '@/data/cookies/getCookies';
import {
  uploadAssetsToCloud,
  uploadImageToCloud,
} from '@/utils/ImageUploadService';
import { format } from 'date-fns';
import React, { useState, useTransition } from 'react';
import { BsCheck2All } from 'react-icons/bs';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { createNotice, updateNotice } from '../actions';
import type { NoticeFormValues } from '../types';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type NoticeFormModalProps = {
  mode: 'add' | 'edit';
  noticeId?: number;
  initialValues?: Partial<NoticeFormValues>;
  trigger: React.ReactNode;
  onSuccess: () => void;
};

const emptyValues: NoticeFormValues = {
  notice_provider: 0,
  notice_date: '',
  expire_date: '',
  headline: '',
  notice_body: '',
  picture: '',
  file: '',
};

function UploadStatusIcon({ status }: { status: UploadStatus }) {
  if (status === 'uploading') {
    return (
      <div
        className="h-5 w-5 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"
        role="status"
      />
    );
  }
  if (status === 'success') {
    return <BsCheck2All className="text-green-600 w-6 h-6" />;
  }
  if (status === 'error') {
    return <MdOutlineErrorOutline className="text-red-600 w-6 h-6" />;
  }
  return null;
}

export function NoticeFormModal({
  mode,
  noticeId,
  initialValues,
  trigger,
  onSuccess,
}: NoticeFormModalProps) {
  const isEdit = mode === 'edit';

  const [open, setOpen] = useState(false);
  const [loading, startTransition] = useTransition();
  const { toast } = useToast();

  // Form field state
  const [values, setValues] = useState<NoticeFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [noticeDate, setNoticeDate] = useState<Date | undefined>(
    initialValues?.notice_date
      ? new Date(initialValues.notice_date)
      : undefined,
  );
  const [expireDate, setExpireDate] = useState<Date | undefined>(
    initialValues?.expire_date
      ? new Date(initialValues.expire_date)
      : undefined,
  );

  // Upload status state
  const [imgStatus, setImgStatus] = useState<UploadStatus>('idle');
  const [fileStatus, setFileStatus] = useState<UploadStatus>('idle');

  const handleChange = (field: keyof NoticeFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgStatus('uploading');
    try {
      const url = await uploadImageToCloud(file);
      if (!url) throw new Error('Upload returned empty URL');
      handleChange('picture', url);
      setImgStatus('success');
      setTimeout(() => setImgStatus('idle'), 2000);
    } catch (err) {
      console.error('Image upload failed:', err);
      setImgStatus('error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileStatus('uploading');
    try {
      const url = await uploadAssetsToCloud(file);
      if (!url) throw new Error('Upload returned empty URL');
      handleChange('file', url);
      setFileStatus('success');
      setTimeout(() => setFileStatus('idle'), 2000);
    } catch (err) {
      console.error('File upload failed:', err);
      setFileStatus('error');
    }
  };

  const resetForm = () => {
    const userId = getUserID();
    setValues({
      ...emptyValues,
      notice_provider: userId ?? 0,
    });
    setNoticeDate(undefined);
    setExpireDate(undefined);
    setImgStatus('idle');
    setFileStatus('idle');
  };

  const handleSubmit = () => {
    const userId = getUserID();
    const payload: NoticeFormValues = {
      ...values,
      notice_provider: userId ?? 0,
      notice_date: noticeDate ? format(noticeDate, 'yyyy-MM-dd') : '',
      expire_date: expireDate ? format(expireDate, 'yyyy-MM-dd') : '',
    };

    startTransition(async () => {
      const response = isEdit
        ? await updateNotice(noticeId!, payload, getJWT() || '')
        : await createNotice(payload, getJWT() || '');

      if (response?.status === 200 || response?.status === 201) {
        toast({
          title: isEdit
            ? 'Notice updated successfully'
            : 'Notice published successfully',
          duration: 3000,
        });
        onSuccess();
        if (!isEdit) resetForm();
        setOpen(false);
      } else {
        toast({
          title: isEdit
            ? 'Failed to update notice'
            : 'Failed to publish notice',
          variant: 'destructive',
          duration: 3000,
        });
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="mb-5">
            {isEdit ? 'Edit Notice' : 'Add Notice'}
          </AlertDialogTitle>

          <form className="flex flex-col space-y-5">
            <Label>
              {isEdit ? 'Edit notice details' : 'Enter notice details'}
            </Label>

            {/* Title */}
            <div className="flex flex-col space-y-2">
              <Label className="font-bold">Title</Label>
              <Input
                value={values.headline}
                onChange={(e) => handleChange('headline', e.target.value)}
                className="w-full border-2 border-input"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-2">
              <Label className="font-bold">Description</Label>
              <textarea
                value={values.notice_body}
                onChange={(e) => handleChange('notice_body', e.target.value)}
                disabled={loading}
                className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Dates */}
            <div className="flex justify-between space-x-5">
              <div className="w-1/2 flex flex-col space-y-2">
                <Label className="font-bold">Notice Date</Label>
                <Input
                  type="date"
                  value={noticeDate ? format(noticeDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    setNoticeDate(
                      e.target.value ? new Date(e.target.value) : undefined,
                    )
                  }
                  disabled={loading}
                  className="w-full"
                />
              </div>
              <div className="w-1/2 flex flex-col space-y-2">
                <Label className="font-bold">Expire Date</Label>
                <Input
                  type="date"
                  value={expireDate ? format(expireDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) =>
                    setExpireDate(
                      e.target.value ? new Date(e.target.value) : undefined,
                    )
                  }
                  disabled={loading}
                  className="w-full"
                />
              </div>
            </div>

            {/* File uploads */}
            <div className="flex space-x-5">
              <div className="flex flex-col space-y-2">
                <Label className="font-bold">Upload an image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="w-full border-2 border-input"
                  />
                  <UploadStatusIcon status={imgStatus} />
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="font-bold">Upload a file</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="w-full border-2 border-input"
                  />
                  <UploadStatusIcon status={fileStatus} />
                </div>
              </div>
            </div>

            {/* Notify */}
            <div className="flex items-center space-x-2">
              <Checkbox id="notify-members" />
              <label htmlFor="notify-members" className="text-sm font-medium">
                Notify all members
              </label>
            </div>
          </form>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogAction onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Publish Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
