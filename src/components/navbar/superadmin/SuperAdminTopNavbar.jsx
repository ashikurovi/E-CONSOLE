import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import toast from "react-hot-toast";
import { LogOut, Bell, Menu } from "lucide-react";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";

const SuperAdminTopNavbar = ({ setIsMobileMenuOpen }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(superadminLoggedOut());
    toast.success(t("auth.loggedOut"));
    navigate("/login");
  };

  return (
    <header className="w-full">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-0.5">
              {t("superadmin.title")}
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("superadmin.controlCenter")}
            </h1>
          </div>
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

          <div className="flex items-center gap-2">
            <ThemeToggle
              variant="compact"
              className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/20 transition-all duration-300"
            />
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02] font-medium text-sm h-10"
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
