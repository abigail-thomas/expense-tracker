import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

// Upload an image file to the backend and return { imageUrl }.
const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD_IMAGE, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default uploadImage;
