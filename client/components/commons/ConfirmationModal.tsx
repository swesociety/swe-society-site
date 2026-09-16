import React from 'react';

interface ConfirmationModalProps {
  title: string;
  subtitle: string;
  confirmButtonTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  subtitle,
  confirmButtonTitle,
  onConfirm,
  onCancel,
  disabled = false,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black p-8 text-center rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-red-600">{title}</h2>
        <p className="text-gray-400 mt-2">{subtitle}</p>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disabled}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmButtonTitle}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
