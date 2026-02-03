import React from "react";
import { X, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductImagesSection({
  imageFiles,
  setImageFiles,
  imageUrlInput,
  setImageUrlInput,
  removeImage,
}) {
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
          Product Images <Info className="w-4 h-4 text-slate-400" />
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Make your fashion products look more attractive with 3:4 size photos.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-32 h-32 border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors relative shrink-0 group">
              <div className="w-8 h-8 mb-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-indigo-600">
                Upload File
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files?.length) {
                    const newFiles = Array.from(e.target.files).map((file) => ({
                      file,
                      url: "",
                      alt: "",
                      isPrimary: false,
                    }));
                    setImageFiles((prev) => [...prev, ...newFiles]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-[200px] flex gap-2 items-center">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Or paste image URL..."
                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm text-slate-900 dark:text-slate-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && imageUrlInput?.trim()) {
                    e.preventDefault();
                    setImageFiles((prev) => [
                      ...prev,
                      {
                        url: imageUrlInput.trim(),
                        alt: "",
                        isPrimary: false,
                        file: null,
                      },
                    ]);
                    setImageUrlInput("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (imageUrlInput?.trim()) {
                    setImageFiles((prev) => [
                      ...prev,
                      {
                        url: imageUrlInput.trim(),
                        alt: "",
                        isPrimary: false,
                        file: null,
                      },
                    ]);
                    setImageUrlInput("");
                  }
                }}
                disabled={!imageUrlInput?.trim()}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {imageFiles.map(
              (img, i) =>
                (img.file || img.url) && (
                  <div
                    key={i}
                    className="w-32 h-32 bg-slate-100 rounded-xl relative group overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0"
                  >
                    <img
                      src={
                        img.file ? URL.createObjectURL(img.file) : img.url
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
