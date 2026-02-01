import React, { useState, useEffect, useMemo } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useTranslation } from "react-i18next";
import { navSections } from "./data";
import { hasPermission } from "@/constants/feature-permission";
import { userLoggedOut } from "@/features/auth/authSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

// Custom Bag Icon Component
const BagIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    {...props}
  >
    <path d="M16 6a4 4 0 10-8 0H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-3zm-6 0a2 2 0 114 0H10z"></path>
  </svg>
);

/**
 * Filter navigation items based on user permissions
 * @param {Object} user - The current user object
 * @returns {Array} - Filtered navigation sections
 */
const getFilteredNav = (user) => {
  return navSections
    .map((section) => ({
      id: section.id,
      title: section.title,
      tKey: section.tKey,
      items: section.items
        .filter((item) => hasPermission(user, item.permission))
        .map((item) => ({
          label: item.title,
          tKey: item.tKey,
          to: item.link,
          icon: item.icon, // Use the icon directly from the data
          badge: item.title === "Review" ? "02" : undefined,
        })),
    }))
    .filter((section) => section.items.length > 0);
};

import { ChevronDown, ChevronRight, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

/**
 * Collapsible Section Component
 */
function CollapsibleSection({ section, isCollapsed, t }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // Auto-expand if any child is active
  useEffect(() => {
    const isChildActive = section.items.some((item) =>
      location.pathname.startsWith(item.to),
    );
    if (isChildActive) setIsOpen(true);
  }, [location.pathname, section.items]);

  const toggleSection = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="mb-4 px-4">
      {/* Section Header */}
      {!isCollapsed && (
        <div
          onClick={toggleSection}
          className="flex items-center justify-between px-2 py-1.5 cursor-pointer group mb-1 select-none"
        >
          <span className="text-[11px] font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors">
            {section.tKey ? t(section.tKey) : section.title}
          </span>
          {isOpen ? (
            <ChevronDown
              size={12}
              className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
            />
          ) : (
            <ChevronRight
              size={12}
              className="text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"
            />
          )}
        </div>
      )}

      {/* Collapsed Sidebar Header (Tooltip-like or minimal) */}
      {isCollapsed && (
        <div className="h-px bg-black/5 dark:bg-white/5 mx-2 my-2" title={section.title} />
      )}

      {/* Items List */}
      <div
        className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${
          !isCollapsed && !isOpen
            ? "max-h-0 opacity-0"
            : "max-h-[800px] opacity-100"
        }`}
      >
        {section.items.map((item, index) => (
          <Item
            key={index}
            to={item.to}
            label={item.label}
            tKey={item.tKey}
            Icon={item.icon}
            badge={item.badge}
            isCollapsed={isCollapsed}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Navigation Item Component
 * Renders individual links in the sidebar
 */
function Item({ to, label, tKey, Icon, badge, isCollapsed, t }) {
  return (
    <NavLink
      to={to}
      end
      title={isCollapsed ? label : ""}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 ${isCollapsed ? "justify-center h-10 w-10 mx-auto rounded-xl" : "px-3 py-2.5 mx-3 rounded-xl"} transition-all duration-300
         ${
           isActive
             ? "bg-black/90 dark:bg-white/90 text-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/5 backdrop-blur-md"
             : "text-gray-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
         }`
      }
    >
      {Icon && (
        <Icon
          strokeWidth={1.5}
          className={`flex-shrink-0 transition-colors duration-200 ${isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"} ${
             !isCollapsed && "group-hover:scale-110 transition-transform"
          }`}
        />
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 text-[13px] font-medium tracking-wide truncate">
            {tKey ? t(tKey) : label}
          </span>
          {badge && (
            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm ${
              "bg-white/20 text-current"
            }`}>
              {badge}
            </span>
          )}
        </>
      )}

      {/* Active Indicator for Collapsed State */}
      {isCollapsed && (
        <NavLink to={to} className={({ isActive }) => isActive ? "absolute top-0 right-0 w-2.5 h-2.5 bg-black dark:bg-white border-2 border-white dark:border-black rounded-full" : "hidden"} />
      )}
    </NavLink>
  );
}

/**
 * SideNav Component
 * Main sidebar navigation component
 */
export default function SideNav({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Fetch user data
  const { data: user } = useGetCurrentUserQuery();

  const handleLogout = () => {
    dispatch(userLoggedOut());
    navigate("/login");
  };

  // Pre-fetch categories (optional, keeping existing logic)
  useGetCategoriesQuery();

  // Get filtered navigation based on permissions
  const nav = useMemo(() => getFilteredNav(user), [user]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-[100] lg:sticky lg:top-0 h-screen 
        ${isCollapsed ? "w-[80px]" : "w-[280px]"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        bg-white/80 dark:bg-black/80 backdrop-blur-2xl
        text-gray-500 dark:text-zinc-400 
        border-r border-black/5 dark:border-white/5
        flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-2xl lg:shadow-none`}
      >
        {/* Header (Logo & Toggle) */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-6 h-24 border-b border-black/5 dark:border-white/5`}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <Link
                to="/"
                className="flex items-center justify-center transform transition-transform hover:scale-105"
              >
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt={user?.companyName || "Logo"}
                    className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-gray-200 dark:ring-white/10"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black grid place-items-center shadow-sm">
                    <BagIcon width="20" height="20" />
                  </div>
                )}
              </Link>
              <button
                onClick={toggleSidebar}
                title={t("common.expandSidebar")}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/"
                className="flex items-center gap-3 min-w-0 flex-1 group"
              >
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt={user?.companyName || "Logo"}
                    className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform ring-1 ring-gray-200 dark:ring-white/10"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
                    <BagIcon width="20" height="20" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-gray-900 dark:text-white truncate leading-tight tracking-tight">
                    {user?.companyName || t("common.company")}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                    Console
                  </span>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                title={t("common.collapseSidebar")}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>



        {/* Navigation Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-2">
          <nav className="flex flex-col gap-2">
            {nav.map((section) => (
              <CollapsibleSection
                key={section.id}
                section={section}
                isCollapsed={isCollapsed}
                t={t}
              />
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-2 border-t border-black/5 dark:border-white/5">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all ${
              isCollapsed ? "justify-center" : ""
            }`}
            title={isCollapsed ? t("common.logout") : ""}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-[13px] font-medium tracking-wide">
                {t("common.logout")}
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
