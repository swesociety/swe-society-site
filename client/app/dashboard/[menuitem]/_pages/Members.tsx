"use client";
import AddMembers from "@/components/dashboardpage/members/AddMembers";
import FindMembers from "@/components/dashboardpage/members/FindMembers";
import MembersNav from "@/components/dashboardpage/members/MembersNav";
import React, { useState } from "react";

const Members: React.FC = () => {
  const [membersOption, setMembersOption] = useState<string>("find");
  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <MembersNav
        membersOption={membersOption}
        setMembersOption={setMembersOption}
      />
      {membersOption === "find" && <FindMembers />}
      {membersOption === "add" && <AddMembers />}
    </div>
  );
};

export default Members;
