'use client';

import CommitteeMembers from './CommitteeMembers';
import CommitteePosts from './CommitteePosts';
import ExecutiveCommittees from './ExecutiveCommittees';
import type { CommitteeData, ExecutiveCommittee } from '../actions';

const emptyCommitteeData: CommitteeData = {
  posts: [],
  members: [],
  users: [],
  elections: [],
};

interface CommitteeManagementProps {
  committeeData?: CommitteeData;
  executiveCommittees?: ExecutiveCommittee[];
  onRefresh?: () => void | Promise<void>;
}

const CommitteeManagement = ({
  committeeData = emptyCommitteeData,
  executiveCommittees = [],
  onRefresh = () => {},
}: CommitteeManagementProps) => {
  const posts = committeeData?.posts ?? [];
  const members = committeeData?.members ?? [];
  const users = committeeData?.users ?? [];
  const elections = committeeData?.elections ?? [];
  const committees = executiveCommittees ?? [];

  const handleRefresh = async (): Promise<void> => {
    await onRefresh();
  };

  return (
    <div className="relative w-full space-y-8 p-4">
      <ExecutiveCommittees
        committees={committees}
        onRefresh={handleRefresh}
      />
      <CommitteePosts posts={posts} onRefresh={handleRefresh} />
      <CommitteeMembers
        members={members}
        posts={posts}
        users={users}
        elections={elections}
        executiveCommittees={committees}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default CommitteeManagement;



