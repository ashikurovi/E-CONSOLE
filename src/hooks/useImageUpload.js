import { useState } from "react";
import toast from "react-hot-toast";
import { getTokens } from "./useToken";

const API_BASE_URL = 'https://squadlog-cdn.up.railway.app';

/**
 * Custom hook for uploading images to backend server
 * @returns {Object} { uploadImage, isUploading, error }
 */
const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload image to backend server
   * @param {File} file - The image file to upload
   * @returns {Promise<string|null>} The image URL or null if upload fails
   */
  const uploadImage = async (file) => {
    if (!file) {
      return null;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      setError("Invalid file type");
      return null;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must be less than 10MB");
      setError("File too large");
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create FormData with file
      const formData = new FormData();
      formData.append("file", file);

      // Get auth token
      const { accessToken } = getTokens();

      // Upload to backend server
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.url) {
        toast.success(data.message || "Image uploaded successfully");
        return data.url;
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err) {
      const errorMessage = err.message || "Failed to upload image";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
  };
};

export default useImageUpload;

