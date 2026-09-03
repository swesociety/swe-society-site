"use client";
import { Button } from "@/components/ui/button";
import { UserPlus, UserRoundSearch } from "lucide-react";
import React from "react";

interface MembersNavProps {
  membersOption: string;
  setMembersOption: React.Dispatch<React.SetStateAction<string>>;
}

const MembersNav: React.FC<MembersNavProps> = ({
  membersOption,
  setMembersOption,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={membersOption === "find" ? "default" : "outline"}
        onClick={() => setMembersOption("find")}
      >
        <UserRoundSearch />
        <p className="hidden sm:contents">Members</p>
      </Button>
      <Button
        variant={membersOption === "add" ? "default" : "outline"}
        onClick={() => setMembersOption("add")}
      >
        <UserPlus />
        <p className="hidden sm:contents">Add Members</p>
      </Button>
    </div>
  );
};

export default MembersNav;
