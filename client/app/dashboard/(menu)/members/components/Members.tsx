'use client';

import FindMembers from '@/app/dashboard/(menu)/members/components/members/FindMembers';
import MembersNav from '@/app/dashboard/(menu)/members/components/members/MembersNav';
import React, { useState } from 'react';
import AddMembers from './members/AddMembers';
import type { MemberDataType } from '@/data/types';

interface MembersProps {
  initialMembers?: MemberDataType[];
}

const Members: React.FC<MembersProps> = ({ initialMembers }) => {
  const [membersOption, setMembersOption] = useState<string>('find');
  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <MembersNav
        membersOption={membersOption}
        setMembersOption={setMembersOption}
      />
      {membersOption === 'find' && (
        <FindMembers initialMembers={initialMembers} />
      )}
      {membersOption === 'add' && <AddMembers />}
    </div>
  );
};


export default Members;
