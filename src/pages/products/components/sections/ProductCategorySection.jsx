import React from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "@/components/dropdown/dropdown";

export default function ProductCategorySection({
  categoryOptions,
  categoryOption,
  setCategoryOption,
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="col-span-12 lg:col-span-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
          {t("productForm.category")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {t("productForm.categoryHint")}
        </p>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <Dropdown
          name={t("productForm.category")}
          options={categoryOptions}
          setSelectedOption={setCategoryOption}
          className="w-full max-w-xs"
          triggerClassName="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:border-indigo-600 outline-none font-medium text-left flex justify-between items-center text-sm"
        >
          {categoryOption?.label || t("productForm.selectCategory")}
        </Dropdown>
      </div>
    </div>
  );
}
