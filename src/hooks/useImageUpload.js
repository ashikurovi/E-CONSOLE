import { useState } from "react";
import toast from "react-hot-toast";

const IMGBB_API_KEY = "fb4646f769fcf0581bd72ca9c56c5f53";
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

/**
 * Custom hook for uploading images to imgBB
 * @returns {Object} { uploadImage, isUploading, error }
 */
const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Upload image to imgBB
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
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove data:image/...;base64, prefix
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to imgBB (requires URL-encoded form data)
      const formData = new URLSearchParams();
      formData.append("key", IMGBB_API_KEY);
      formData.append("image", base64);

      const response = await fetch(IMGBB_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data?.url) {
        toast.success("Image uploaded successfully");
        return data.data.url;
      } else {
        throw new Error(data.error?.message || "Upload failed");
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

