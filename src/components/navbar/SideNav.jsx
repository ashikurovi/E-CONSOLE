import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { userLoggedOut } from "@/features/auth/authSlice";
import { apiSlice } from "@/features/api/apiSlice";
import toast from "react-hot-toast";
import { navSections } from "./data";
import { hasPermission } from "@/constants/feature-permission";
import SearchBar from "@/components/input/search-bar";
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

// Custom Menu Icon Component
const MenuIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    {...props}
  >
    <path d="M4 6h16M4 12h16M4 18h16"></path>
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

import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Collapsible Section Component
 */
function CollapsibleSection({ section, isCollapsed, t }) {
  const [isOpen, setIsOpen] = useState(true);

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
    <div className="mb-2">
      {/* Section Header */}
      {!isCollapsed && (
        <div
          onClick={toggleSection}
          className="flex items-center justify-between px-4 py-2 cursor-pointer group hover:bg-white/5 rounded-lg transition-colors mb-1"
        >
          <span className="text-xs font-bold tracking-wider text-gray-500 uppercase group-hover:text-gray-300 transition-colors">
            {section.tKey ? t(section.tKey) : section.title}
          </span>
          {isOpen ? (
            <ChevronDown
              size={14}
              className="text-gray-500 group-hover:text-gray-300 transition-colors"
            />
          ) : (
            <ChevronRight
              size={14}
              className="text-gray-500 group-hover:text-gray-300 transition-colors"
            />
          )}
        </div>
      )}

      {/* Collapsed Sidebar Header (Tooltip-like or minimal) */}
      {isCollapsed && (
        <div className="h-px bg-white/5 mx-4 my-2" title={section.title} />
      )}

      {/* Items List */}
      <div
        className={`flex flex-col gap-1 transition-all duration-300 ease-in-out overflow-hidden ${
          !isCollapsed && !isOpen
            ? "max-h-0 opacity-0"
            : "max-h-[500px] opacity-100"
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
        `group relative flex items-center gap-3 ${isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-4 py-3 mx-2"} rounded-xl transition-all duration-200 ease-in-out
         ${
           isActive
             ? "bg-white/10 text-white shadow-lg shadow-black/10"
             : "text-gray-400 hover:bg-white/5 hover:text-white"
         }`
      }
    >
      {Icon && (
        <Icon
          className={`flex-shrink-0 transition-colors duration-200 ${isCollapsed ? "w-5 h-5" : "w-5 h-5"}`}
        />
      )}

      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium tracking-wide truncate">
            {tKey ? t(tKey) : label}
          </span>
          {badge && (
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-sm shadow-blue-500/50">
              {badge}
            </span>
          )}
        </>
      )}

      {/* Active Indicator for Collapsed State */}
      {isCollapsed && badge && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 border-2 border-[#09090b] rounded-full"></span>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user data
  const { data: user } = useGetCurrentUserQuery();

  // Pre-fetch categories (optional, keeping existing logic)
  useGetCategoriesQuery();

  // Get filtered navigation based on permissions
  const nav = useMemo(() => getFilteredNav(user), [user]);

  // Sidebar search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Filter navigation items based on search term
  const filteredNavItems = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      return [];
    }

    const searchLower = searchTerm.toLowerCase().trim();
    const results = [];

    nav.forEach((section) => {
      section.items.forEach((item) => {
        const labelMatch = item.label.toLowerCase().includes(searchLower);
        if (labelMatch) {
          results.push({
            ...item,
            sectionTitle: section.title,
            sectionTKey: section.tKey,
          });
        }
      });
    });

    return results;
  }, [nav, searchTerm]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle search input change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && value.trim().length >= 1) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSearchResults]);

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
        ${isCollapsed ? "w-20" : "w-[280px]"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
        bg-[#09090b]
        text-gray-400 
        border-r border-white/5 
        flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-2xl lg:shadow-none`}
      >
        {/* Header (Logo & Toggle) */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-6 h-24 border-b border-white/5`}
        >
          {isCollapsed ? (
            <Link
              to="/"
              className="flex items-center justify-center transform transition-transform hover:scale-105"
            >
              {user?.companyLogo ? (
                <img
                  src={user.companyLogo}
                  alt={user?.companyName || "Logo"}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm ring-1 ring-white/10"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center shadow-sm">
                  <BagIcon width="20" height="20" />
                </div>
              )}
            </Link>
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
                    className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform ring-1 ring-white/10"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white text-black grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
                    <BagIcon width="20" height="20" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-white truncate leading-tight tracking-tight">
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
                className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <MenuIcon width="20" height="20" />
              </button>
            </>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-5 py-6 relative" ref={searchContainerRef}>
            <SearchBar
              placeholder={t("nav.searchMenuItems")}
              searchValue={searchTerm}
              setSearhValue={handleSearchChange}
              className="bg-white/5 text-gray-200 placeholder:text-gray-600 border-transparent focus:bg-white/10 transition-all duration-200"
            />

            {/* Real-time Search Results */}
            {showSearchResults &&
              searchTerm &&
              searchTerm.trim().length >= 1 && (
                <div className="absolute top-full left-5 right-5 mt-2 bg-[#1a1f26] border border-white/10 rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto overflow-x-hidden">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 px-2">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t("nav.menuItems")} ({filteredNavItems.length})
                      </h3>
                    </div>

                    {filteredNavItems.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {filteredNavItems.map((item, index) => (
                          <Link
                            key={index}
                            to={item.to}
                            onClick={() => {
                              setSearchTerm("");
                              setShowSearchResults(false);
                              if (window.innerWidth < 1024)
                                setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg group transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                              {item.icon && <item.icon size={16} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {item.sectionTitle}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-500 text-sm">
                        {t("common.noResultsFound")}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

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

        {/* Footer / User Profile Snippet (Optional - can add here if needed) */}
        {/* <div className="p-4 border-t border-gray-100 dark:border-gray-800/50">
            ...
        </div> */}
      </aside>
    </>
  );
}
