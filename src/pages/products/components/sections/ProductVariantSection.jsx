import React from "react";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductVariantSection({
  variants,
  updateVariantName,
  removeVariant,
  isAddingVariant,
  setIsAddingVariant,
  newVariantName,
  setNewVariantName,
  handleAddVariant,
}) {
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          Product Variant
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Add variants like color, material, or style.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <div className="space-y-3 grid grid-cols-2 gap-5">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-300 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) =>
                    updateVariantName(variant.id, e.target.value)
                  }
                  placeholder="Variant Name"
                  className="w-full bg-transparent border-none outline-none font-medium text-slate-900 dark:text-slate-50 placeholder-slate-400 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {isAddingVariant ? (
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-indigo-600 shadow-md">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder="Variant name (e.g. Green)"
                className="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddVariant();
                  } else if (e.key === "Escape") {
                    setNewVariantName("");
                    setIsAddingVariant(false);
                  }
                }}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddVariant}
                  className="h-8 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold"
                >
                  Add
                </Button>
                <button
                  type="button"
                  onClick={() => setIsAddingVariant(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingVariant(true)}
              className="px-5 py-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 w-fit"
            >
              <Plus className="w-4 h-4" />
              Add new variant
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
