import React from "react";
import { NavLink } from "react-router-dom";
import { DollarSign, Users, Headset, ClipboardList, LayoutDashboard } from "lucide-react";

const SuperAdminSideNav = () => {
  const items = [
    { label: "Overview", to: "/superadmin", Icon: LayoutDashboard },
    { label: "Earnings", to: "/superadmin/earnings", Icon: DollarSign },
    { label: "Our Customers", to: "/superadmin/customers", Icon: Users },
    { label: "Support", to: "/superadmin/support", Icon: Headset },
    { label: "Service Requests", to: "/superadmin/service-requests", Icon: ClipboardList },
  ];

  return (
    <aside className="sticky left-0 top-0 h-screen w-64 bg-slate-950 text-gray-100 border-r border-slate-800 flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-emerald-500 text-white grid place-items-center text-xs font-bold">
            SA
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Super Admin</span>
            <span className="text-[11px] text-slate-400">Global Control</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-4 pb-2 text-[11px] tracking-wide text-slate-400 uppercase">
          Main sections
        </div>
        <div className="space-y-1 px-2">
          {items.map(({ label, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                 ${isActive ? "bg-slate-800 text-white" : "text-slate-200 hover:bg-slate-900 hover:text-white"}`
              }
            >
              <Icon className="w-4 h-4 text-slate-400" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default SuperAdminSideNav;


