import React from "react";

export default function ProductNameSection({ register, errors }) {
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          Product Name<span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Add product title that buyers would likely use to search.
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <input
          {...register("name")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all"
          placeholder="Product name..."
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>
    </div>
  );
}
