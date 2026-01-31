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

/**
 * Section Title Component
 * Renders the section header (e.g., "MAIN", "ORDER MANAGEMENT")
 */
function SectionTitle({ children, isCollapsed, tKey, t }) {
  if (isCollapsed) return null;
  return (
    <div className="px-4 pt-6 pb-2 text-[11px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase transition-all duration-300">
      {tKey ? t(tKey) : children}
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
        `group relative flex items-center gap-3 ${isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-4 py-2.5 mx-2"} rounded-xl transition-all duration-200 ease-in-out
         ${
           isActive
             ? "bg-black text-white dark:bg-white dark:text-black shadow-lg shadow-black/5 dark:shadow-white/5"
             : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1f26] hover:text-gray-900 dark:hover:text-white"
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
            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
              {badge}
            </span>
          )}
        </>
      )}

      {/* Active Indicator for Collapsed State */}
      {isCollapsed && badge && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0b0f14] rounded-full"></span>
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
        bg-white dark:bg-black
        text-gray-800 dark:text-gray-200 
        border-r border-gray-100 dark:border-gray-800/50 
        flex flex-col transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] shadow-xl lg:shadow-none`}
      >
        {/* Header (Logo & Toggle) */}
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-6 h-20 border-b border-gray-100 dark:border-gray-800/50`}
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
                  className="w-10 h-10 rounded-xl object-cover shadow-sm"
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
                    className="w-9 h-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black grid place-items-center shadow-sm group-hover:scale-105 transition-transform">
                    <BagIcon width="18" height="18" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-bold text-base truncate leading-tight">
                    {user?.companyName || t("common.company")}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                    Console
                  </span>
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                title={t("common.collapseSidebar")}
                className="text-gray-400 hover:text-black dark:hover:text-white p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <MenuIcon width="20" height="20" />
              </button>
            </>
          )}
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="px-5 py-4 relative" ref={searchContainerRef}>
            <SearchBar
              placeholder={t("nav.searchMenuItems")}
              searchValue={searchTerm}
              setSearhValue={handleSearchChange}
              className="bg-gray-50 dark:bg-[#151921] border-transparent focus:bg-white dark:focus:bg-black transition-all duration-200"
            />

            {/* Real-time Search Results */}
            {showSearchResults &&
              searchTerm &&
              searchTerm.trim().length >= 1 && (
                <div className="absolute top-full left-5 right-5 mt-2 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-700 rounded-xl shadow-2xl z-50 max-h-[60vh] overflow-y-auto overflow-x-hidden">
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
                            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors"
                          >
                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors">
                              {item.icon && <item.icon size={16} />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white">
                                {item.label}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {item.sectionTitle}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-gray-400 text-sm">
                        {t("common.noResultsFound")}
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Navigation Items - Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          <nav className="flex flex-col gap-1 px-0">
            {nav.map((section) => (
              <div key={section.id} className="mb-2">
                <SectionTitle
                  isCollapsed={isCollapsed}
                  tKey={section.tKey}
                  t={t}
                >
                  {section.title}
                </SectionTitle>
                <div className="flex flex-col gap-0.5">
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
