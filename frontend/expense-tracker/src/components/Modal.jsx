import React from "react";
import { LuX } from "react-icons/lu";

// Generic centered modal dialog.
const Modal = ({ children, isOpen, onClose, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full bg-black/20 overflow-y-auto overflow-x-hidden">
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-gray-200 rounded-t">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer"
            >
              <LuX className="text-lg" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-5 space-y-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
