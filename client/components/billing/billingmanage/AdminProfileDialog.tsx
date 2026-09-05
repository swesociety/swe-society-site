"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, ShieldCheck, User } from "lucide-react";
import type { CommitteeMembership } from "./types";

export interface AdminProfileInfo {
  fullname: string | null;
  regno: string;
  role?: string | null;
  profile_picture?: string | null;
  actionTitle?: string; // e.g. "Verified & Accepted", "Verified Transaction", "Accepted Payment"
  committee_memberships?: CommitteeMembership[];
}

interface AdminProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminInfo: AdminProfileInfo | null;
}

export const AdminProfileDialog: React.FC<AdminProfileDialogProps> = ({
  open,
  onOpenChange,
  adminInfo,
}) => {
  if (!adminInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs bg-gray-950 border-gray-800 text-white p-5 rounded-xl shadow-2xl">
        <DialogHeader className="items-center text-center pb-2 border-b border-gray-800">
          <DialogTitle className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {adminInfo.actionTitle || "Admin Auditor Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-3 pt-3">
          {adminInfo.role && (
            <div className="pt-1">
              <Badge className="bg-indigo-950 text-indigo-300 border-indigo-800 text-[11px]">
                <UserCheck className="w-3 h-3 mr-1 text-indigo-400" />
                {adminInfo.role}
              </Badge>
            </div>
          )}
          <Avatar className="w-20 h-20 border-2 border-emerald-500/60 p-1 bg-gray-900 shadow-md">
            <AvatarImage
              src={
                adminInfo.profile_picture ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              }
              className="rounded-full object-cover"
              alt={adminInfo.fullname || "Admin Avatar"}
            />
          </Avatar>
          <div className="text-center space-y-1 w-full">
            <h4 className="text-base font-bold text-white truncate">
              {adminInfo.fullname || "Administrator"}
            </h4>

            <div className="font-mono text-xs text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded inline-block border border-emerald-800">
              Reg No: {adminInfo.regno}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {adminInfo?.committee_memberships?.map((membership, index) => (
              <p
                key={`${membership.committee_name}-${membership.post_name}-${index}`}
                className="sm:px-4 px-[2px] text-center text-green-500 text-xs  font-semibold rounded-full border border-green-500"
              >
                {membership.post_name}, {membership.committee_name}
              </p>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-gray-800 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-gray-800 text-xs text-gray-300 hover:bg-gray-900 w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
