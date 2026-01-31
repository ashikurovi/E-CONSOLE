import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  Users,
  Headset,
  LayoutDashboard,
  Package,
  FileText,
  Palette,
  Shield,
  UserCircle,
} from "lucide-react";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";

const SuperAdminSideNav = () => {
  const { t } = useTranslation();
  const items = [
    {
      labelKey: "superadmin.overview",
      to: "/superadmin",
      Icon: LayoutDashboard,
    },
    {
      labelKey: "superadmin.earnings",
      to: "/superadmin/earnings",
      Icon: DollarSign,
    },
    {
      labelKey: "superadmin.ourCustomers",
      to: "/superadmin/customers",
      Icon: Users,
    },
    {
      labelKey: "superadmin.packages",
      to: "/superadmin/packages",
      Icon: Package,
    },
    { labelKey: "superadmin.themes", to: "/superadmin/themes", Icon: Palette },
    {
      labelKey: "superadmin.invoices",
      to: "/superadmin/invoices",
      Icon: FileText,
    },
    {
      labelKey: "superadmin.support",
      to: "/superadmin/support",
      Icon: Headset,
    },
    {
      labelKey: "superadmin.superAdmins",
      to: "/superadmin/superadmins",
      Icon: Shield,
    },
    {
      labelKey: "superadmin.myProfile",
      to: "/superadmin/profile",
      Icon: UserCircle,
    },
  ];

  return (
    <aside className="sticky left-0 top-0 h-screen w-64 bg-white dark:bg-slate-950 text-gray-800 dark:text-gray-100 border-r border-gray-200 dark:border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-emerald-500 text-white grid place-items-center text-xs font-bold">
            SA
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">
              {t("superadmin.title")}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-slate-400">
              {t("superadmin.globalControl")}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-4 pb-2 text-[11px] tracking-wide text-gray-500 dark:text-slate-400 uppercase">
          {t("superadmin.mainSections")}
        </div>
        <div className="space-y-1 px-2">
          {items.map(({ labelKey, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                 ${isActive ? "bg-gray-200 dark:bg-slate-800 text-gray-900 dark:text-white" : "text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-gray-900 dark:hover:text-white"}`
              }
            >
              <Icon className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span>{t(labelKey)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800">
        <LanguageSwitcher variant="compact" />
      </div>
    </aside>
  );
};

export default SuperAdminSideNav;
