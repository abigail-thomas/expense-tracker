import React from "react";

// Simple confirmation body shown inside a Modal before deleting a record.
const DeleteAlert = ({ content, onDelete }) => {
  return (
    <div>
      <p className="text-sm">{content}</p>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={onDelete}
          className="text-sm font-medium text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DeleteAlert;
