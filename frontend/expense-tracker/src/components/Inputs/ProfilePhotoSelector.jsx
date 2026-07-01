import React, { useRef, useState } from "react";
import { LuUser, LuUpload, LuTrash } from "react-icons/lu";

// Lets the user pick / preview / remove a profile photo.
// `initialPreview` shows an already-saved photo URL when no new file is picked.
const ProfilePhotoSelector = ({ setImage, initialPreview = null }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Show the freshly picked file if there is one, else the existing saved photo.
  const displayUrl = previewUrl || initialPreview;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onChooseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!displayUrl ? (
        <div className="w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative">
          <LuUser className="text-4xl text-primary" />
          <button
            type="button"
            onClick={onChooseFile}
            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
          >
            <LuUpload />
          </button>
        </div>
      ) : (
        <div className="relative">
          <img
            src={displayUrl}
            alt="profile preview"
            onClick={onChooseFile}
            title="Click to change photo"
            className="w-20 h-20 rounded-full object-cover cursor-pointer"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1 cursor-pointer"
          >
            <LuTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoSelector;
