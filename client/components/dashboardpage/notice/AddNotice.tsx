"use client";
import { BsCheck2All } from "react-icons/bs";
import { MdOutlineErrorOutline } from "react-icons/md";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getUserID } from "@/data/cookies/getCookies";
import { BACKENDURL } from "@/data/urls";
import {
  uploadAssetsToCloud,
  uploadImageToCloud,
} from "@/utils/ImageUploadService";
import axios from "axios";
import { format } from "date-fns";
import React, { useState } from "react";
import { IoIosAddCircleOutline } from "react-icons/io";
// import { cookies } from 'next/headers';

type AddNoticeProps = {
  fetch_notices: () => void;
};

function AddNotice({ fetch_notices }: AddNoticeProps) {
  const [notice, setNotice] = useState({
    notice_provider: 3,
    notice_date: "",
    expire_date: "",
    headline: "",
    notice_body: "",
    picture: "",
    file: "",
  });

  const [notice_date, setNotice_date] = useState<Date>();
  const [expire_date, setExpire_date] = useState<Date>();
  const [uploadingStatus, setUploadingStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [Img_uploadingStatus, set_Img_uploadingStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const handleNoticeChange = (field: string, value: any) => {
    setNotice((prevNotice) => ({
      ...prevNotice,
      [field]: value,
    }));
  };

  const clearNotice = () => {
    const userId = getUserID() || -1;
    setNotice({
      notice_provider: typeof userId === "number" ? userId : 3,
      notice_date: "",
      expire_date: "",
      headline: "",
      notice_body: "",
      picture: "",
      file: "",
    });
    setUploadingStatus("idle");
    setNotice_date(undefined);
    setExpire_date(undefined);
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    set_Img_uploadingStatus("uploading");
    const file = event.target.files?.[0];
    if (file) {
      try {
        const cloudinary_resonse = await uploadImageToCloud(file);
        console.log(cloudinary_resonse);
        if (!cloudinary_resonse) {
          console.log("File upload failed");
          set_Img_uploadingStatus("error");
          throw new Error("File upload failed");
        }
        handleNoticeChange("picture", cloudinary_resonse);
        set_Img_uploadingStatus("success");
        setTimeout(() => {
          set_Img_uploadingStatus("idle");
        }, 2000);
      } catch (error) {
        console.error("File upload failed:", error);
        set_Img_uploadingStatus("error");
      }
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadingStatus("uploading");
    const file = event.target.files?.[0];
    if (file) {
      try {
        const cloudinary_resonse = await uploadAssetsToCloud(file);
        console.log(cloudinary_resonse);
        if (!cloudinary_resonse) {
          console.log("File upload failed");
          setUploadingStatus("error");
          throw new Error("File upload failed");
        }
        handleNoticeChange("file", cloudinary_resonse);
        setUploadingStatus("success");
        setTimeout(() => {
          setUploadingStatus("idle");
        }, 2000);
      } catch (error) {
        console.error("File upload failed:", error);
        setUploadingStatus("error");
      }
    }
  };

  const handleSubmit = async (e: any) => {
    const userId = getUserID();
    const updatedNotice = {
      ...notice,
      notice_provider: userId || 3,
      notice_date: notice_date ? format(notice_date, "yyyy-MM-dd") : "",
      expire_date: expire_date ? format(expire_date, "yyyy-MM-dd") : "",
    };

    try {
      axios.post(`${BACKENDURL}notice/create`, updatedNotice).then((res) => {
        console.log(updatedNotice);
        fetch_notices();
        clearNotice();
      });
    } catch (error) {
      console.error("Error submitting notice:", error);
    }
  };

  const isFormComplete = () => {
    return (
      notice.notice_provider !== 0 &&
      notice.notice_date &&
      notice.expire_date &&
      notice.headline &&
      notice.notice_body &&
      notice.file
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="bg-primary flex items-center text-primary-foreground hover:bg-primary/90 rounded-lg font-bold px-4 py-2">
        <IoIosAddCircleOutline className="mr-2 text-2xl" /> Add Notice
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="mb-5">Add Notice</AlertDialogTitle>
          <form className="flex flex-col space-y-5">
            <Label>Enter notice details</Label>

            <div className="flex flex-col space-y-2">
              <Label className="font-bold">Title</Label>
              <Input
                value={notice.headline}
                onChange={(e) => handleNoticeChange("headline", e.target.value)}
                className="w-full border-2 border-input"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label className="font-bold">Description</Label>
              <textarea
                value={notice.notice_body}
                onChange={(e) =>
                  handleNoticeChange("notice_body", e.target.value)
                }
                className="flex h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="flex justify-between space-x-5">
              <div className="w-1/2 flex flex-col space-y-2">
                <Label className="font-bold">Notice Date</Label>
                <Input
                  type="date"
                  value={notice_date ? format(notice_date, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setNotice_date(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                  className="w-full"
                />
              </div>
              <div className="w-1/2 flex flex-col space-y-2">
                <Label className="font-bold">Expire Date</Label>
                <Input
                  type="date"
                  value={expire_date ? format(expire_date, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setExpire_date(
                      e.target.value ? new Date(e.target.value) : undefined
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex space-x-5">
              <div className="flex flex-col space-y-2">
                <Label className="font-bold">Upload an image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    className="w-full border-2 border-input"
                  />
                  {Img_uploadingStatus === "uploading" && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-5 w-5 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"
                        role="status"
                      ></div>
                    </div>
                  )}

                  {Img_uploadingStatus === "success" && (
                    <div className="flex items-center space-x-2">
                      <BsCheck2All className="text-green-600 w-6 h-6" />
                    </div>
                  )}
                  {Img_uploadingStatus === "error" && (
                    <div className="flex items-center space-x-2">
                      <MdOutlineErrorOutline className="text-red-600 w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="font-bold">Upload a file</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full border-2 border-input"
                  />
                  {uploadingStatus === "uploading" && (
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-5 w-5 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"
                        role="status"
                      ></div>
                    </div>
                  )}
                  {uploadingStatus === "success" && (
                    <div className="flex items-center space-x-2">
                      <BsCheck2All className="text-green-600 w-6 h-6" />
                    </div>
                  )}
                  {uploadingStatus === "error" && (
                    <div className="flex items-center space-x-2">
                      <MdOutlineErrorOutline className="text-red-600 w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <label htmlFor="terms" className="text-sm font-medium">
                Notify all members
              </label>
            </div>
          </form>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleSubmit}>
            Publish Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AddNotice;
