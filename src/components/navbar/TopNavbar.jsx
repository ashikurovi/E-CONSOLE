import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

// components
import NavLogo from "../logo/nav-logo";
import IconButton from "../buttons/icon-button";
import SidebarMenu from "./SidebarMenu";

// data
import { navLinks } from "./data";

// const socket = io(import.meta.env.VITE_BACKEND_URL || "", {
//   autoConnect: false,
// });

const TopNavbar = () => {
  const { user } = useSelector((state) => state?.auth);
  const { pathname } = useLocation();

  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const userId = user?._id;

  // const { data: notificationData } = useGetNotificationHistoryQuery();

  // useEffect(() => {
  //   if (!userId) return;
  //   socket.connect();
  //   socket.emit("join", userId);

  //   socket.on("new_notification", (notification) => {
  //     setNotifications((prev) => [notification, ...prev]);
  //     setNewNotificationCount(newNotificationCount + 1);
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, [userId]);

  // const unReadCount = notificationData?.data?.meta?.totalUnread || 0;

  // useEffect(() => {
  //   if (notificationData?.data?.notifications) {
  //     setNotifications(notificationData?.data?.notifications);
  //   }
  //   if (unReadCount) {
  //     setNewNotificationCount(unReadCount);
  //   }
  // }, [notificationData]);
  // const isActive = (link) =>
  //   link === "/" ? link === pathname : pathname.includes(link);

  return (
    <nav className="dark:bg-[#242424] bg-white lg:rounded-full lg:p-3 p-1 mb-5 z-50 sticky lg:static top-0">
      <div className="flbx gap-3">
        <div className="fl gap-4 pl-2">
          <SidebarMenu />
          <NavLogo />
        </div>

        <div className="lg:flex hidden h-[60px] fl gap-2 p-2 rounded-full bg-bg50 dark:bg-white/5 dark:hover:bg-white/10 hover:bg-gray-100 tr">
          {navLinks?.map(({ title, link }, index) => (
            <Link
              key={index}
              to={link}
              // className={`py-3 px-4 rounded-full ${
              //   isActive(link)
              //     ? "text-primary font-semibold"
              //     : "hover:text-primary/20"
              // }`}
            >
              {title}
            </Link>
          ))}
        </div>

        <div className="fl lg:gap-4 gap-2">
          {/* <IconButton icon={Search} /> */}
          {/* <NotificationDropdown data={notifications} unReadCount={unReadCount}>
            <div className="relative">
              <IconButton type="icon" icon={Bell} />
              {newNotificationCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-primary h-6 w-6 center rounded-full text-xs font-medium text-white">
                  {newNotificationCount}
                </span>
              )}
            </div>
          </NotificationDropdown> */}
          {/* <ProfileDropdown /> */}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
