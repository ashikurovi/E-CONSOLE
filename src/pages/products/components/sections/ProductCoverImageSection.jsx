import React from "react";
import { X, Image as ImageIcon } from "lucide-react";

export default function ProductCoverImageSection({
  thumbnailFile,
  thumbnailUrl,
  setThumbnailFile,
  setThumbnailUrl,
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          Cover Image
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Upload a cover image for your product. Recommended size 1200x300.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8 space-y-3">
        <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 transition-colors group relative overflow-hidden">
          {!thumbnailFile && !thumbnailUrl ? (
            <>
              <div className="w-12 h-12 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-indigo-600 mb-1">
                Upload Cover Image
              </h3>
              <p className="text-xs text-slate-400">
                Drag and drop or click to upload
              </p>
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full group">
              <img
                src={
                  thumbnailFile
                    ? URL.createObjectURL(thumbnailFile)
                    : thumbnailUrl
                }
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setThumbnailFile(null);
                  setThumbnailUrl("");
                }}
                className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setThumbnailFile(e.target.files[0]);
                setThumbnailUrl("");
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-500">Or paste image URL:</span>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => {
              setThumbnailUrl(e.target.value);
              if (e.target.value) setThumbnailFile(null);
            }}
            placeholder="https://example.com/image.jpg"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}
