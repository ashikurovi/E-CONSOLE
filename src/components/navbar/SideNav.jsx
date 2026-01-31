// iconMap constant
import React, { useState, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { userLoggedOut } from "@/features/auth/authSlice";
import { apiSlice } from "@/features/api/apiSlice";
import toast from "react-hot-toast";
import { navSections } from "./data";
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import { 
  FileText, 
  ShieldAlert, 
  HelpCircle, 
  Settings, 
  User2, 
  Image, 
  Shield, 
  FileCheck, 
  Receipt, 
  Truck, 
  Crown,
  LayoutGrid,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Tag,
  UserCog,
  ScrollText,
  FileSliders,
  Zap,
  Search
} from "lucide-react";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission } from "@/constants/feature-permission";
import SearchBar from "@/components/input/search-bar";

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
  Dashboard: LayoutGrid,
  Categories: StarIcon,
  Product: Package,
  "Flash Sell": Zap,
  Inventory: Warehouse,
  Customers: Users,
  Order: ShoppingCart,
  Banners: Image,
  "Fraud Checker": ShieldAlert,
  "Upgrade Plan": Crown,
  Settings: Settings,
  Help: HelpCircle,
  "Manage Users": UserCog,
  Promocodes: Tag,
  "Privacy Policy": Shield,
  "Terms & Conditions": FileCheck,
  "Refund Policy": Receipt,
  "Steadfast Courier": Truck,
  "Pathao Courier": FileSliders,
};

const getFilteredNav = (user) => {
  return navSections.map((section) => ({
    id: section.id,
    title: section.title,
    tKey: section.tKey,
    items: section.items
      .filter((item) => hasPermission(user, item.permission))
      .map((item) => ({
        label: item.title,
        tKey: item.tKey,
        to: item.link,
        icon: item.icon || iconMap[item.title],
        badge: item.title === "Review" ? "02" : undefined,
      })),
  })).filter((section) => section.items.length > 0);
};

function SectionTitle({ children, isCollapsed, tKey, t }) {
  if (isCollapsed) return null;
  return (
    <div className="px-4 pt-6 pb-2 text-xs tracking-wider text-gray-500 dark:text-gray-400">
      {tKey ? t(tKey) : children}
    </div>
  );
}

function Item({ to, label, tKey, Icon, badge, isCollapsed, t }) {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : ""}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 ${isCollapsed ? 'px-4 justify-center' : 'px-4'} py-2.5 mx-2 rounded-xl transition-all duration-200
         ${isActive ? "bg-white text-black font-semibold shadow-md" : "text-gray-500 hover:text-white hover:bg-white/10"}`
      }
    >
      <Icon className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{tKey ? t(tKey) : label}</span>
          {badge && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-green-700 text-white">
              {badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && badge && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
      )}
    </NavLink>
  );
}

export default function SideNav() {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const result = useGetCategoriesQuery();
  console.log(result);

  const nav = getFilteredNav(user);
  
  // Sidebar route search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef(null);

  // Filter navigation items based on search term
  const filteredNavItems = React.useMemo(() => {
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

  const handleLogout = () => {
    dispatch(userLoggedOut());
    dispatch(apiSlice.util.resetApiState());
    toast.success(t("auth.loggedOut"));
    navigate("/sign-in");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle search input change - show results in real-time
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && value.trim().length >= 1) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
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
    <aside className={`sticky left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-black text-gray-400 flex flex-col transition-all duration-300 shadow-2xl z-50`}>
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 h-14 border-b border-gray-200 dark:border-gray-800`}>
        {isCollapsed ? (
          <Link to="/" className="flex items-center justify-center">
            {user?.companyLogo ? (
              <img
                src={user.companyLogo}
                alt={user?.companyName || t("common.companyLogo")}
                className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-md bg-green-600 text-white grid place-items-center flex-shrink-0">
                <BagIcon />
              </div>
            )}
          </Link>
        ) : (
          <>
            <Link to="/">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt={user?.companyName || t("common.companyLogo")}
                    className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-green-600 text-white grid place-items-center flex-shrink-0">
                    <BagIcon />
                  </div>
                )}
                <span className="font-semibold truncate">
                  {user?.companyName || t("common.company")}
                </span>
              </div>
            </Link>
            <button 
              onClick={toggleSidebar}
              title={t("common.collapseSidebar")}
              className="bg-gray-800 dark:bg-black text-white hover:bg-gray-700 dark:hover:bg-black/90 flex-shrink-0 p-1 rounded transition-transform hover:scale-110"
            >
              <MenuIcon />
            </button>
          </>
        )}
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 relative" ref={searchContainerRef}>
          <SearchBar 
            placeholder={t("nav.searchMenuItems")} 
            searchValue={searchTerm}
            setSearhValue={handleSearchChange}
          />
          
          {/* Real-time Search Results Dropdown */}
          {showSearchResults && searchTerm && searchTerm.trim().length >= 1 && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white dark:bg-[#0b0f14] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {t("nav.menuItems")} ({filteredNavItems.length})
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setShowSearchResults(false);
                    }}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {t("common.clear")}
                  </button>
                </div>
                
                {filteredNavItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-10 w-10 mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {t("nav.noMenuItemsFound", { term: searchTerm })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNavItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <div
                          key={`${item.sectionTitle}-${item.label}`}
                          onClick={() => {
                            navigate(item.to);
                            setSearchTerm("");
                            setShowSearchResults(false);
                          }}
                          className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-pointer transition-colors flex items-center gap-3"
                        >
                          <IconComponent className="text-gray-400 flex-shrink-0" size={18} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                              {item.tKey ? t(item.tKey) : item.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {item.sectionTKey ? t(item.sectionTKey) : item.sectionTitle}
                            </p>
                          </div>
                          {item.badge && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-green-700 text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body */}
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map((section) => (
          <div key={section.id} className="mb-6">
            <SectionTitle isCollapsed={isCollapsed} tKey={section.tKey} t={t}>{section.title}</SectionTitle>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Item
                  key={item.label}
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
      {/* Go Pro Card */}
      {!isCollapsed && (
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Crown size={60} />
             </div>
             <div className="relative z-10">
                 <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center mb-3">
                    <Crown size={20} />
                 </div>
                 <h4 className="text-white font-bold text-lg mb-1">Go Pro</h4>
                 <p className="text-gray-400 text-xs mb-3">Upgrade your plan to go professional</p>
                 <Link to="/upgrade-plan" className="block text-center bg-white text-black font-semibold py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors">
                    Upgrade Now
                 </Link>
             </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
        <div className="px-2">
          <LanguageSwitcher variant="compact" />
        </div>
        <button
          onClick={handleLogout}
          title={isCollapsed ? t("common.logout") : ""}
          className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-xl transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white`}
        >
          <LogoutIcon />
          {!isCollapsed && <span>{t("common.logout")}</span>}
        </button>
      </div>

      {/* Floating toggle button for collapsed stat d QW D1 22rdQWD qweeQW e */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          title={t("common.expandSidebar")}
          className="absolute -right-3 top-20 w-6 h-12 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-r-md flex items-center justify-center transition-colors border border-l-0 border-gray-300 dark:border-gray-700 shadow-lg"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </aside>
  );
}