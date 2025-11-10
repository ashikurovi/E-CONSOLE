import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

// components
import NavLogo from "../logo/nav-logo";
import IconButton from "../buttons/icon-button";
import SidebarMenu from "./SidebarMenu";
// ... existing code ...
import SearchBar from "@/components/input/search-bar";
import { Bell, Settings, HelpCircle, User } from "lucide-react";
// ... existing code ...

const TopNavbar = () => {
  const { user } = useSelector((state) => state?.auth);
  const { pathname } = useLocation();

  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const userId = user?._id;

  // ... existing code ...

  return (
    <nav className="dark:bg-[#242424] bg-white  lg:p-3  p-1 mb-5 z-50 sticky lg:static top-0">
      <div className="flbx py-2 gap-3">
        {/* <div className="fl gap-4 pl-2">
    
          <NavLogo />
        </div> */}

        <div className="flex-1 lg:flex hidden max-w-[720px]">
          <SearchBar placeholder="Search" />
        </div>

        <div className="fl lg:gap-3 gap-2 pr-2">
          <IconButton icon={HelpCircle} />
          <IconButton icon={Settings} />
          <div className="relative">
            <IconButton type="icon" icon={Bell} />
            {newNotificationCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-primary h-6 w-6 center rounded-full text-xs font-medium text-white">
                {newNotificationCount}
              </span>
            )}
          </div>
          <div className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/10 center overflow-hidden">
            <User className="h-5 w-5 opacity-70" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;