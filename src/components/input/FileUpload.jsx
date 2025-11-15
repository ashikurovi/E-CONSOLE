import React, { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

const FileUpload = ({
  placeholder = "Choose a file",
  label,
  className,
  register,
  name,
  accept = "image/*",
  onChange,
  value,
}) => {
  const [preview, setPreview] = useState(value || null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  // Update preview when value prop changes (for editing)
  useEffect(() => {
    if (value && typeof value === "string") {
      setPreview(value);
    } else if (!value) {
      setPreview(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Call onChange if provided
      if (onChange) {
        onChange(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-black/50 dark:text-white/50 text-sm ml-1">
          {label}
        </label>
      )}
      
      <div className="space-y-2">
        {/* File Input */}
        <div className="relative">
          <input
            type="file"
            accept={accept}
            ref={fileInputRef}
            {...(register ? register(name) : {})}
            onChange={handleFileChange}
            className="hidden"
            id={`file-upload-${name}`}
          />
          <label
            htmlFor={`file-upload-${name}`}
            className="flex items-center gap-2 cursor-pointer border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus-within:border-green-300/50 dark:focus-within:border-green-300/50 dark:text-white/90 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <Upload className="h-4 w-4 text-black/50 dark:text-white/50" />
            <span className="text-black/70 dark:text-white/70 flex-1">
              {fileName || placeholder}
            </span>
          </label>
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 h-8 w-8"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {fileName && (
              <div className="p-2 bg-black/5 dark:bg-white/5 text-xs text-black/70 dark:text-white/70">
                {fileName}
              </div>
            )}
          </div>
        )}

        {!preview && (
          <div className="flex items-center justify-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-md p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-12 w-12 text-black/30 dark:text-white/30" />
              <p className="text-sm text-black/50 dark:text-white/50">
                No image selected
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

