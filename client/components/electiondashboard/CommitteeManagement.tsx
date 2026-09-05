"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { useToast } from "../ui/use-toast";
import CommitteeMembers from "./CommitteeMembers";
import CommitteePosts from "./CommitteePosts";
import ExecutiveCommittees from "./ExecutiveCommittees";
import {
  CommitteeData,
  ExecutiveCommittee,
  getCommitteeData,
  getExecutiveCommittees,
} from "./actions";

const emptyCommitteeData: CommitteeData = {
  posts: [],
  members: [],
  users: [],
  elections: [],
};

const CommitteeManagement = () => {
  const [committeeData, setCommitteeData] =
    useState<CommitteeData>(emptyCommitteeData);
  const [executiveCommittees, setExecutiveCommittees] = useState<
    ExecutiveCommittee[]
  >([]);
  const hasLoadedData = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const loadCommitteeData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [committeeDataResponse, executiveCommitteesResponse] =
        await Promise.all([getCommitteeData(), getExecutiveCommittees()]);
      setCommitteeData(committeeDataResponse);
      setExecutiveCommittees(executiveCommitteesResponse);
    } catch (error: any) {
      toast({
        title: "Could not load committee data",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadData = useCallback(async () => {
    startTransition(() => {
      void loadCommitteeData();
    });
  }, [loadCommitteeData]);

  useEffect(() => {
    if (hasLoadedData.current) return;
    hasLoadedData.current = true;
    void loadData();
  }, [loadData]);

  const showLoading = isLoading || isPending;

  return (
    <div className="relative w-full space-y-8 p-4">
      {showLoading && (
        <div className="absolute inset-0 z-40 flex min-h-[420px] items-center justify-center bg-black/60 backdrop-blur-[1px]">
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-5 py-3 text-sm text-gray-200 shadow-xl">
            <RefreshCw className="h-4 w-4 animate-spin text-red-400" />
            Loading committee data...
          </div>
        </div>
      )}
      <ExecutiveCommittees
        committees={executiveCommittees}
        onRefresh={loadData}
      />
      <CommitteePosts posts={committeeData.posts} onRefresh={loadData} />
      <CommitteeMembers
        members={committeeData.members}
        posts={committeeData.posts}
        users={committeeData.users}
        elections={committeeData.elections}
        executiveCommittees={executiveCommittees}
        onRefresh={loadData}
      />
    </div>
  );
};

export default CommitteeManagement;
