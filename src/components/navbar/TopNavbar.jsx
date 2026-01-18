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
import { Bell, Settings, HelpCircle, User, Package, ShoppingCart, Truck, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetOrderCreatedNotificationsQuery } from "@/features/notifications/notificationsApiSlice";
import moment from "moment";
// ... existing code ...

const TopNavbar = () => {
  const { user } = useSelector((state) => state?.auth);
  const { pathname } = useLocation();

  const companyId = user?.companyId;
  const { data: orderNotifications = [], isLoading, refetch } = useGetOrderCreatedNotificationsQuery(companyId, {
    skip: !companyId, // Skip the query if companyId is not available
  });
  const userId = user?._id;
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Transform API notifications to match UI format
  const notifications = orderNotifications.map((notification) => ({
    id: notification.id || notification._id,
    type: "order",
    title: notification.title || "New Order Created",
    message: notification.message || `Order has been created successfully`,
    time: notification.createdAt 
      ? moment(notification.createdAt).fromNow()
      : "Just now",
    icon: ShoppingCart,
    iconColor: "text-blue-500",
    read: notification.isRead || false,
  }));

  const newNotificationCount = notifications.filter(n => !n.read).length;

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
          <Link to="/help">      <IconButton icon={HelpCircle} />  </Link>
      
          {/* <IconButton icon={Settings} /> */}
          <div className="relative">
            <div onClick={() => setIsNotificationModalOpen(true)} className="cursor-pointer">
              <IconButton type="icon" icon={Bell} />
            </div>
            {newNotificationCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-primary h-6 w-6 center rounded-full text-xs font-medium text-white">
                {newNotificationCount}
              </span>
            )}
          </div>
          <Link to="/settings">     <div className="h-9 w-9 rounded-full bg-black/5 dark:bg-white/10 center overflow-hidden">
            <User className="h-5 w-5 opacity-70" />
          </div> </Link>
      
        </div>
      </div>

      {/* Notifications Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 justify-center">
              <Bell className="h-5 w-5" />
              Notifications
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.read
                        ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800"
                        : "bg-white dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700"
                    } hover:shadow-md cursor-pointer`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${notification.iconColor}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {notifications.length > 0 && (
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  // Refetch to get latest notifications
                  refetch();
                }}
                className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors font-medium"
              >
                Refresh notifications
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default TopNavbar;