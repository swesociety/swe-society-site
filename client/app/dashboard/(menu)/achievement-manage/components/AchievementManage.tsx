'use client';

import AchievementComponent from '@/app/dashboard/(menu)/achievement/components/AchievementCard';
import React, { useState } from 'react';
import AchievementModal from '@/app/dashboard/(menu)/achievement/components/AchievementModal';
import type { Achievement } from '@/app/dashboard/(menu)/achievement/types';

interface AchievementManageProps {
  initialAchievements: Achievement[];
}

const AchievementManage: React.FC<AchievementManageProps> = ({
  initialAchievements,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAchievementAdded = () => {
    setIsModalOpen(false);
    typeof window !== 'undefined' && window.location.reload();
  };

  return (
    <div className="flex flex-col items-center space-y-2 pt-16 h-screen">
      <div className="w-full mt-4">
        <div className="text-3xl text-center font-bold">Achievements</div>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-700 rounded-lg px-4 mr-2 text-white py-2"
        >
          + Add Achievement
        </button>
      </div>
      <AchievementComponent achievements={initialAchievements} isAdmin={true} />
      {isModalOpen && (
        <AchievementModal
          onClose={() => setIsModalOpen(false)}
          onAchievementAdded={handleAchievementAdded}
        />
      )}
    </div>
  );
};

export default AchievementManage;
