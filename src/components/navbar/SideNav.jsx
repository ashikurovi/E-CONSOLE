// iconMap constant
import React from "react";
import { NavLink } from "react-router-dom";
import { navLinks } from "./data";
import { FileText, ShieldAlert, HelpCircle, Settings, User2, ClipboardList, Image } from "lucide-react";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";

// Icons (inline SVGs to avoid extra deps)
const BagIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M16 6a4 4 0 10-8 0H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-3zm-6 0a2 2 0 114 0H10z"></path>
  </svg>
);

const MenuIcon = (props) => (
  <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
    <path d="M4 6h16M4 12h16M4 18h16"></path>
  </svg>
);

const GridIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
  </svg>
);

const BoxIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M21 7v10l-9 4-9-4V7" />
  </svg>
);

const ListIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
    <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
  </svg>
);



const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
    <path d="M12 .587l3.668 7.431L24 9.748l-6 5.853 1.417 8.26L12 19.771l-7.417 4.09L6 15.601 0 9.748l8.332-1.73L12 .587z" />
  </svg>
);






const LogoutIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="2" {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);



// Menu config
const iconMap = {
  Dashboard: GridIcon,
  Categories: StarIcon,
  Product: BoxIcon,
  Inventory: ListIcon,
  Customers: User2,
    Order: FileText,
    OrderItems: ClipboardList,
    Banners: Image,
  "Fraud Checker": ShieldAlert,
  Settings: Settings,
  Help: HelpCircle,
  "Manage Users": User2,
  Promocodes: ClipboardList,
};

const generalSet = new Set([
  "Dashboard",
  "Categories",
  "Product",
  "Inventory",
  "Customers",
  "Order",
  "OrderItems",
  "Banners",
  "Fraud Checker",
  "Promocodes",
  
]);

const accountSet = new Set(["Settings", "Help", "Manage Users"]);

const nav = {
  general: navLinks
    .filter((item) => generalSet.has(item.title))
    .map((item) => ({
      label: item.title,
      to: item.link,
      icon: iconMap[item.title],
      badge: item.title === "Review" ? "02" : undefined,
    })),
  account: navLinks
    .filter((item) => accountSet.has(item.title))
    .map((item) => ({
      label: item.title,
      to: item.link,
      icon: iconMap[item.title],
    })),
};

function SectionTitle({ children }) {
  return (
    <div className="px-4 pt-6 pb-2 text-xs tracking-wider text-gray-400">
      {children}
    </div>
  );
}

function Item({ to, label, Icon, badge }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
         ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/60 hover:text-white"}`
      }
    >
      <Icon className="text-gray-400 group-hover:text-white" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-green-700 text-white">
          {badge}
        </span>
      )}
    </NavLink>
  );
}

export default function SideNav() {

  const result = useGetCategoriesQuery();
console.log(result);

  return (
    <aside className="sticky left-0 top-0 h-screen w-64 bg-[#0b0f14] text-gray-200 border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-green-600 text-white grid place-items-center">
            <BagIcon />
          </div>
          <span className="font-semibold">subcom</span>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MenuIcon />
        </button>
      </div>

      {/* Body */}
      <nav className="flex-1 overflow-y-auto py-2">
        <SectionTitle>GENERAL</SectionTitle>
        <div className="space-y-1">
          {nav.general.map((item) => (
            <Item
              key={item.label}
              to={item.to}
              label={item.label}
              Icon={item.icon}
              badge={item.badge}
            />
          ))}
        </div>

        <SectionTitle>ACCOUNT</SectionTitle>
        <div className="space-y-1">
          {nav.account.map((item) => (
            <Item
              key={item.label}
              to={item.to}
              label={item.label}
              Icon={item.icon}
            />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-gray-800">
        <NavLink
          to="/logout"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-xl transition-colors
             ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/60 hover:text-white"}`
          }
        >
          <LogoutIcon />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}