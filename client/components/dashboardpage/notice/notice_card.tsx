"use client";

import EditNotice from "@/components/dashboardpage/notice/EditNotice";
import { Button } from "@/components/ui/button";
import { MdOutlineImage } from "react-icons/md";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, FileText, Trash2 } from "lucide-react";
interface NoticeData {
  noticeid: number;
  notice_provider: number;
  notice_date: string;
  expire_date: string;
  headline: string;
  notice_body: string;
  picture: string | null;
  file: string | null;
}

interface NoticeCardProps {
  notice: NoticeData;
  key: number;
  handle_dlt: (noticeid: any) => void;
  fetch_notices: () => void;
}

export default function Component({
  notice,
  handle_dlt,
  fetch_notices,
}: NoticeCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card className="w-full max-w-sm bg-gradient-to-br from-[#1F2937] to-[#111924] shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-[#9A413C] text-lg font-bold">
            {notice.headline}
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              onClick={() => {
                handle_dlt(notice.noticeid);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-100/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <EditNotice
              fetch_notices={fetch_notices}
              noticeid={notice.noticeid}
              notice_provider={notice.notice_provider}
              notice_date={notice.notice_date}
              expire_date={notice.expire_date}
              headline={notice.headline}
              notice_body={notice.notice_body}
              file={notice.file}
              picture={notice.picture}
            />
          </div>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-1 text-white" />
          {formatDate(notice.notice_date)}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2">
        <p className="text-sm text-gray-300 line-clamp-3">
          {notice.notice_body}
        </p>
      </CardContent>
      <CardContent className="py-2 flex items-center">
        <Clock className="h-4 w-4 mr-1 text-white" />
        <p className="text-xs text-muted-foreground">
          Expires: {formatDate(notice.expire_date)}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex space-x-2">
          {notice.picture && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300"
              onClick={() => window.open(notice.picture!, "_blank")}
            >
              <MdOutlineImage className="h-3 w-3 mr-1" />
              Image
            </Button>
          )}
          {notice.file && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300"
              onClick={() => window.open(notice.file!, "_blank")}
            >
              <FileText className="h-3 w-3 mr-1" />
              Document
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
