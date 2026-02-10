import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerNotifications from "./CustomerNotifications";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

const CustomerHeader = ({ onExport }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useGetCurrentUserQuery();

  const canCreateCustomer = hasPermission(user, FeaturePermission.CUSTOMERS);

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
          {t("customers.pageTitlePrefix")}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
            {t("customers.pageTitleHighlight")}
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
          {t("customers.pageSubtitle")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher variant="compact" />

        <Button
          variant="outline"
          onClick={onExport}
          className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          {t("customers.exportToPdf")}
        </Button>

        <CustomerNotifications />

        {canCreateCustomer && (
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/customers/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">{t("customers.addCustomer")}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default CustomerHeader;

