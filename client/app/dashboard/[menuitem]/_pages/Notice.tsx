"use client";
import AddNotice from "@/components/dashboardpage/notice/AddNotice";
import Notice_Card from "@/components/dashboardpage/notice/notice_card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BACKENDURL } from "@/data/urls";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Notice: React.FC = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [onlyMyNotices, setOnlyMyNotices] = useState<boolean>(false);

  const fetch_notices = () => {
    axios.get(`${BACKENDURL}notice/`).then((res) => {
      setNotices(res.data);
    });
  };

  useEffect(() => {
    fetch_notices();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const filteredNotices = notices.filter(
    (notice) =>
      notice.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.notice_body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handle_dlt = (noticeid: any) => {
    axios
      .delete(`${BACKENDURL}notice/${noticeid}`)
      .then((res) => {
        console.log(res.data);
        setNotices((prevNotices) =>
          prevNotices.filter((notice) => notice.noticeid !== noticeid)
        );
      })
      .catch((err) => {
        console.error("Error deleting notice:", err);
      });
  };

  return (
    <div className="flex flex-col items-center justify-start gap-4 space-y-2 pt-16 px-4 h-screen  ">
      <h1>Notices</h1>
      <div className="w-full flex justify-between  ">
        <Input
          placeholder="Search notices"
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <AddNotice fetch_notices={fetch_notices} />
        {/* <Button><IoIosAddCircleOutline className="h-full w-full" />  Add notice</Button> */}
      </div>
      <div className="w-full h-max grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((notice, index) => (
            <Notice_Card
              key={index}
              notice={notice}
              handle_dlt={handle_dlt}
              fetch_notices={fetch_notices}
            />
          ))
        ) : (
          <p className="text-white">No matching notices found.</p>
        )}
      </div>

      <div className="w-full flex justify-center items-center gap-2 mt-4">
        <Checkbox
          id="onlyMyNotices"
          onClick={() => {
            setOnlyMyNotices(!onlyMyNotices);
            console.log(onlyMyNotices);
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

export default Notice;
