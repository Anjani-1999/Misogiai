import React from "react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Video</h2>
        <p className="mb-6 text-gray-700">
          Are you sure you want to permanently delete this video? This action
          cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold"
            onClick={onConfirm}
          >
            Delete forever
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
