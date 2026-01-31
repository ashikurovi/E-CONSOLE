import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";

const SuperAdminTopNavbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(superadminLoggedOut());
    toast.success(t("auth.loggedOut"));
    navigate("/superadmin/login");
  };

  return (
    <header className="w-full bg-white/80 dark:bg-[#121212]/80 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
            {t("superadmin.title")}
          </span>
          <span className="text-sm font-semibold">{t("superadmin.controlCenter")}</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle variant="compact" />
          <LanguageSwitcher variant="compact" />
          <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
            <span className="hidden sm:inline">{t("superadmin.environment")}:</span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {t("superadmin.production")}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("common.logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;




