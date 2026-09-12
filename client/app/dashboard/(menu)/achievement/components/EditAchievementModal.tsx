'use client';

import React from 'react';
import BaseAchievementModal, {
  AchievementFormData,
} from './BaseAchievementModal';

interface AchievementFormProps {
  onClose: () => void;
  onAchievementEdited: () => void;
  formDatass: AchievementFormData;
}

const EditAchievementModal: React.FC<AchievementFormProps> = ({
  onClose,
  onAchievementEdited,
  formDatass,
}) => {
  return (
    <BaseAchievementModal
      mode="edit"
      initialData={formDatass}
      onClose={onClose}
      onSuccess={onAchievementEdited}
    />
  );
};

export default EditAchievementModal;
