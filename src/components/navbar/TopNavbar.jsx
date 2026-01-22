import React, { useEffect, useState, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

// components
import NavLogo from "../logo/nav-logo";
import IconButton from "../buttons/icon-button";
import SidebarMenu from "./SidebarMenu";
// ... existing code ...
import SearchBar from "@/components/input/search-bar";
import { Bell, Settings, HelpCircle, User, Package, ShoppingCart, Truck, AlertCircle, CheckCircle, Search, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useGetOrderCreatedNotificationsQuery, 
  useGetAllNotificationsQuery,
  useGetOrderStatusNotificationsQuery,
  useGetNewCustomerNotificationsQuery,
  useGetLowStockNotificationsQuery,
} from "@/features/notifications/notificationsApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useGlobalSearch } from "@/features/search/searchApiSlice";
import { useSearch } from "@/contexts/SearchContext";
import moment from "moment";
// ... existing code ...

const TopNavbar = () => {
  // Fetch user data from API instead of Redux
  const { data: user, isLoading: isLoadingUser } = useGetCurrentUserQuery();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const companyId = user?.companyId;
  const userId = user?._id;
  
  // Global search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { setIsSearching } = useSearch();
  
  // Global search hook
  const { results, isLoading: isSearchLoading, totalResults } = useGlobalSearch(
    searchTerm,
    companyId
  );
  
  // Fetch all types of notifications
  const { data: allNotifications = [], isLoading: isLoadingAll, refetch: refetchAll } = useGetAllNotificationsQuery(
    { companyId },
    { skip: !companyId }
  );
  
  const { data: orderNotifications = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useGetOrderCreatedNotificationsQuery(companyId, {
    skip: !companyId,
  });
  
  const { data: orderStatusNotifications = [], isLoading: isLoadingOrderStatus, refetch: refetchOrderStatus } = useGetOrderStatusNotificationsQuery(companyId, {
    skip: !companyId,
  });
  
  const { data: newCustomerNotifications = [], isLoading: isLoadingCustomers, refetch: refetchCustomers } = useGetNewCustomerNotificationsQuery(companyId, {
    skip: !companyId,
  });
  
  const { data: lowStockNotifications = [], isLoading: isLoadingStock, refetch: refetchStock } = useGetLowStockNotificationsQuery(companyId, {
    skip: !companyId,
  });
  
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  const isLoading = isLoadingAll || isLoadingOrders || isLoadingOrderStatus || isLoadingCustomers || isLoadingStock;

  // Combine notifications from all sources
  const combinedNotifications = [
    ...allNotifications, 
    ...orderNotifications, 
    ...orderStatusNotifications,
    ...newCustomerNotifications,
    ...lowStockNotifications,
  ];
  
  // Remove duplicates based on id
  const uniqueNotifications = combinedNotifications.reduce((acc, current) => {
    const exists = acc.find(item => (item.id || item._id) === (current.id || current._id));
    if (!exists) {
      return acc.concat([current]);
    }
    return acc;
  }, []);
  
  // Transform API notifications to match UI format
  const notifications = uniqueNotifications.map((notification) => {
    // Determine icon and color based on notification type (matching backend enum)
    let icon = Bell;
    let iconColor = "text-gray-500";
    let title = notification.subject || notification.title || "Notification";
    
    switch(notification.type) {
      // Order notifications
      case "order_created":
      case "ORDER_CREATED":
        icon = ShoppingCart;
        iconColor = "text-blue-500";
        title = notification.subject || notification.title || "New Order Created";
        break;
      case "order_confirmed":
      case "ORDER_CONFIRMED":
        icon = CheckCircle;
        iconColor = "text-blue-600";
        title = notification.subject || notification.title || "Order Confirmed";
        break;
      case "order_processing":
      case "ORDER_PROCESSING":
        icon = Package;
        iconColor = "text-yellow-500";
        title = notification.subject || notification.title || "Order Processing";
        break;
      case "order_shipped":
      case "ORDER_SHIPPED":
        icon = Truck;
        iconColor = "text-purple-500";
        title = notification.subject || notification.title || "Order Shipped";
        break;
      case "order_delivered":
      case "ORDER_DELIVERED":
        icon = CheckCircle;
        iconColor = "text-green-500";
        title = notification.subject || notification.title || "Order Delivered";
        break;
      case "order_cancelled":
      case "ORDER_CANCELLED":
        icon = AlertCircle;
        iconColor = "text-red-500";
        title = notification.subject || notification.title || "Order Cancelled";
        break;
      case "order_refunded":
      case "ORDER_REFUNDED":
        icon = AlertCircle;
        iconColor = "text-orange-600";
        title = notification.subject || notification.title || "Order Refunded";
        break;
      
      // Payment notifications
      case "payment_received":
      case "PAYMENT_RECEIVED":
        icon = CheckCircle;
        iconColor = "text-green-600";
        title = notification.subject || notification.title || "Payment Received";
        break;
      case "payment_failed":
      case "PAYMENT_FAILED":
        icon = AlertCircle;
        iconColor = "text-red-600";
        title = notification.subject || notification.title || "Payment Failed";
        break;
      
      // Customer notifications
      case "new_customer":
      case "NEW_CUSTOMER":
        icon = User;
        iconColor = "text-indigo-500";
        title = notification.subject || notification.title || "New Customer";
        break;
      case "customer_updated":
      case "CUSTOMER_UPDATED":
        icon = User;
        iconColor = "text-blue-400";
        title = notification.subject || notification.title || "Customer Updated";
        break;
      
      // Stock notifications
      case "low_stock":
      case "LOW_STOCK":
        icon = AlertCircle;
        iconColor = "text-orange-500";
        title = notification.subject || notification.title || "Low Stock Alert";
        break;
      case "out_of_stock":
      case "OUT_OF_STOCK":
        icon = AlertCircle;
        iconColor = "text-red-500";
        title = notification.subject || notification.title || "Out of Stock";
        break;
      
      // Product notifications
      case "product_added":
      case "PRODUCT_ADDED":
        icon = Package;
        iconColor = "text-green-500";
        title = notification.subject || notification.title || "Product Added";
        break;
      case "product_updated":
      case "PRODUCT_UPDATED":
        icon = Package;
        iconColor = "text-blue-500";
        title = notification.subject || notification.title || "Product Updated";
        break;
      
      // Broadcast notifications
      case "broadcast_email":
      case "BROADCAST_EMAIL":
        icon = Bell;
        iconColor = "text-indigo-500";
        title = notification.subject || notification.title || "Email Broadcast";
        break;
      case "broadcast_sms":
      case "BROADCAST_SMS":
        icon = Bell;
        iconColor = "text-teal-500";
        title = notification.subject || notification.title || "SMS Broadcast";
        break;
      
      default:
        icon = Bell;
        iconColor = "text-gray-500";
        title = notification.subject || notification.title || "Notification";
    }
    
    return {
      id: notification.id || notification._id,
      type: notification.type || "general",
      title: title,
      message: notification.message || `Notification message`,
      time: notification.createdAt 
        ? moment(notification.createdAt).fromNow()
        : "Just now",
      icon: icon,
      iconColor: iconColor,
      read: notification.isRead || false,
    };
  }).sort((a, b) => {
    // Sort by read status (unread first) and then by time
    if (a.read === b.read) return 0;
    return a.read ? 1 : -1;
  });

  const newNotificationCount = notifications.filter(n => !n.read).length;

  // Handle search input change - show results in real-time
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value && value.trim().length >= 2) {
      setShowSearchResults(true);
      setIsSearching(true);
    } else {
      setShowSearchResults(false);
      setIsSearching(false);
    }
  };

  // Close search results when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSearchResults, setIsSearching]);


  // ... existing code ...

  return (
    <nav className="dark:bg-[#242424] bg-white  lg:p-3  p-1 mb-5 z-50 sticky lg:static top-0">
      <div className="flbx py-2 gap-3">
        {/* <div className="fl gap-4 pl-2">
    
          <NavLogo />
        </div> */}

        <div className="flex-1 w-[500px] lg:flex hidden relative" ref={searchContainerRef}>
          <SearchBar 
            placeholder="Search orders, products, customers..." 
            searchValue={searchTerm}
            setSearhValue={handleSearchChange}
          />
          
          {/* Real-time Search Results Dropdown */}
          {showSearchResults && searchTerm && searchTerm.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 rounded-lg shadow-lg z-50 max-h-[70vh] overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white">
                    Search Results ({totalResults})
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setShowSearchResults(false);
                      setIsSearching(false);
                    }}
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                </div>
                
                {isSearchLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-gray-500 dark:text-gray-400">Searching...</p>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No results found for "{searchTerm}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Orders Results */}
                    {results.orders.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Orders ({results.orders.length})
                        </h4>
                        <div className="space-y-2">
                          {results.orders.slice(0, 5).map((o) => (
                            <div
                              key={o.id}
                              onClick={() => {
                                navigate(`/orders/${o.id}`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-black dark:text-white">
                                    Order #{o.id}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {o.customer?.name ?? o.customerName ?? "-"} • {o.status}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                  ${Number(o.totalAmount || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Products Results */}
                    {results.products.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Products ({results.products.length})
                        </h4>
                        <div className="space-y-2">
                          {results.products.slice(0, 5).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                navigate(`/products/${p.id}`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-black dark:text-white">
                                    {p.name ?? p.title ?? "-"}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    SKU: {p.sku || "-"} • Stock: {p.stock || 0}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-black dark:text-white">
                                  ${Number(p.price || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Customers Results */}
                    {results.customers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Customers ({results.customers.length})
                        </h4>
                        <div className="space-y-2">
                          {results.customers.slice(0, 5).map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                navigate(`/customers`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                            >
                              <div>
                                <p className="font-medium text-black dark:text-white">
                                  {c.name ?? "-"}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {c.email || "-"} • {c.phone || "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
                  // Refetch to get latest notifications from all sources
                  refetchAll();
                  refetchOrders();
                  refetchOrderStatus();
                  refetchCustomers();
                  refetchStock();
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