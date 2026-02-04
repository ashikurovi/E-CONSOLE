import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Trash2 } from "lucide-react";

export default function ProductFormHeader({ title, backLabel }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const defaultTitle = title || t("productForm.editProduct");
  const defaultBackLabel = backLabel || t("productForm.backToProductList");

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/products")}
            className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <div className="text-xs text-slate-500">{defaultBackLabel}</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
              {defaultTitle}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products", { state: { tab: "drafts" } })}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            {t("productForm.drafts")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/products", { state: { tab: "trash" } })}
            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t("productForm.trash")}
          </Button>
          <Button
            variant="outline"
            className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t("productForm.viewShop")}
          </Button>
        </div>
      </div>
    </div>
  );
}
