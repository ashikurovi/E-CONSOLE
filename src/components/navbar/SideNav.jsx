// iconMap constant
import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userLoggedOut } from "@/features/auth/authSlice";
import { apiSlice } from "@/features/api/apiSlice";
import toast from "react-hot-toast";
import { navSections } from "./data";
import { 
  FileText, 
  ShieldAlert, 
  HelpCircle, 
  Settings, 
  User2, 
  ClipboardList, 
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
  Zap
} from "lucide-react";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { hasPermission } from "@/constants/feature-permission";

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
  OrderItems: ClipboardList,
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
    items: section.items
      .filter((item) => hasPermission(user, item.permission))
      .map((item) => ({
        label: item.title,
        to: item.link,
        icon: item.icon || iconMap[item.title],
        badge: item.title === "Review" ? "02" : undefined,
      })),
  })).filter((section) => section.items.length > 0);
};

function SectionTitle({ children, isCollapsed }) {
  if (isCollapsed) return null;
  return (
    <div className="px-4 pt-6 pb-2 text-xs tracking-wider text-gray-400">
      {children}
    </div>
  );
}

function Item({ to, label, Icon, badge, isCollapsed }) {
  return (
    <NavLink
      to={to}
      title={isCollapsed ? label : ""}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 ${isCollapsed ? 'px-4 justify-center' : 'px-4'} py-2 rounded-xl transition-colors
         ${isActive ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/60 hover:text-white"}`
      }
    >
      <Icon className="text-gray-400 group-hover:text-white flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const result = useGetCategoriesQuery();
  console.log(result);

  const nav = getFilteredNav(user);

  const handleLogout = () => {
    dispatch(userLoggedOut());
    dispatch(apiSlice.util.resetApiState());
    toast.success("Logged out successfully");
    navigate("/sign-in");
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sticky left-0 top-0 h-screen ${isCollapsed ? 'w-20' : 'w-64'} bg-[#0b0f14] text-gray-200 border-r border-gray-800 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-4 h-14 border-b border-gray-800`}>
        {isCollapsed ? (
          <Link to="/" className="flex items-center justify-center">
            {user?.companyLogo ? (
              <img
                src={user.companyLogo}
                alt={user?.companyName || "Company Logo"}
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
                    alt={user?.companyName || "Company Logo"}
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
                  {user?.companyName || "Company"}
                </span>
              </div>
            </Link>
            <button 
              onClick={toggleSidebar}
              title="Collapse sidebar"
              className="bg-black text-white hover:bg-black/90 flex-shrink-0 p-1 rounded transition-transform hover:scale-110"
            >
              <MenuIcon />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <nav className="flex-1 overflow-y-auto py-2">
        {nav.map((section) => (
          <div key={section.id} className="mb-6">
            <SectionTitle isCollapsed={isCollapsed}>{section.title}</SectionTitle>
            <div className="space-y-1">
              {section.items.map((item) => (
                <Item
                  key={item.label}
                  to={item.to}
                  label={item.label}
                  Icon={item.icon}
                  badge={item.badge}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-4 py-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
          className={`w-full flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''} px-4 py-2 rounded-xl transition-colors text-gray-300 hover:bg-gray-800/60 hover:text-white`}
        >
          <LogoutIcon />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Floating toggle button for collapsed state */}
      {isCollapsed && (
        <button
          onClick={toggleSidebar}
          title="Expand sidebar"
          className="absolute -right-3 top-20 w-6 h-12 bg-gray-800 hover:bg-gray-700 rounded-r-md flex items-center justify-center transition-colors border border-l-0 border-gray-700 shadow-lg"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-gray-400 hover:text-white">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}
    </aside>
  );
}