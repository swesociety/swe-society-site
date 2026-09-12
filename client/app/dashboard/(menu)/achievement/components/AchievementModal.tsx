'use client';

import React from 'react';
import BaseAchievementModal from './BaseAchievementModal';

interface AchievementFormProps {
  onClose: () => void;
  onAchievementAdded: () => void;
}

const AchievementModal: React.FC<AchievementFormProps> = ({
  onClose,
  onAchievementAdded,
}) => {
  return (
    <BaseAchievementModal
      mode="add"
      onClose={onClose}
      onSuccess={onAchievementAdded}
    />
  );
};

export default AchievementModal;
