import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import toast from "react-hot-toast";
import { LogOut, Bell } from "lucide-react";
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
    <header className="w-full">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-0.5">
            {t("superadmin.title")}
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("superadmin.controlCenter")}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <div className="hidden md:flex items-center px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-xs font-medium text-violet-700 dark:text-violet-300">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
            </span>
            {t("superadmin.production")}
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

          <ThemeToggle variant="ghost" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
          
          <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/20 font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t("common.logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;




