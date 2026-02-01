import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


// components
import LanguageSwitcher from "@/components/language/LanguageSwitcher";
import ThemeToggle from "@/components/theme/ThemeToggle";
import IconButton from "../buttons/icon-button";
import {
  Bell,
  CheckCircle,
  Search,
  Menu,
  User,
  ShoppingCart,
  Truck,
  AlertCircle,
  Package,
} from "lucide-react";
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
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "@/features/notifications/notificationsApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useGlobalSearch } from "@/features/search/searchApiSlice";
import { useSearch } from "@/contexts/SearchContext";
import moment from "moment";
// ... existing code ...

const TopNavbar = ({ setIsMobileMenuOpen }) => {
  const { t } = useTranslation();
  // Fetch user data from API instead of Redux
  const { data: user } = useGetCurrentUserQuery();
  const navigate = useNavigate();

  const companyId = user?.companyId;

  // Global search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const { setIsSearching } = useSearch();

  // Global search hook
  const {
    results,
    isLoading: isSearchLoading,
    totalResults,
  } = useGlobalSearch(searchTerm, companyId);

  // Fetch all types of notifications
  const {
    data: allNotifications = [],
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useGetAllNotificationsQuery({ companyId }, { skip: !companyId });

  const {
    data: orderNotifications = [],
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useGetOrderCreatedNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const {
    data: orderStatusNotifications = [],
    isLoading: isLoadingOrderStatus,
  } = useGetOrderStatusNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const {
    data: newCustomerNotifications = [],
    isLoading: isLoadingCustomers,
  } = useGetNewCustomerNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const {
    data: lowStockNotifications = [],
    isLoading: isLoadingStock,
  } = useGetLowStockNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsAsReadMutation();

  const isLoading =
    isLoadingAll ||
    isLoadingOrders ||
    isLoadingOrderStatus ||
    isLoadingCustomers ||
    isLoadingStock;

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
    const exists = acc.find(
      (item) => (item.id || item._id) === (current.id || current._id),
    );
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
    let title = notification.subject || notification.title || t("notifications.notification");
    
    switch(notification.type) {
      // Order notifications
      case "order_created":
      case "ORDER_CREATED":
        icon = ShoppingCart;
        iconColor = "text-blue-500";
        title = notification.subject || notification.title || t("notifications.newOrderCreated");
        break;
      case "order_confirmed":
      case "ORDER_CONFIRMED":
        icon = CheckCircle;
        iconColor = "text-blue-600";
        title = notification.subject || notification.title || t("notifications.orderConfirmed");
        break;
      case "order_processing":
      case "ORDER_PROCESSING":
        icon = Package;
        iconColor = "text-yellow-500";
        title = notification.subject || notification.title || t("notifications.orderProcessing");
        break;
      case "order_shipped":
      case "ORDER_SHIPPED":
        icon = Truck;
        iconColor = "text-purple-500";
        title = notification.subject || notification.title || t("notifications.orderShipped");
        break;
      case "order_delivered":
      case "ORDER_DELIVERED":
        icon = CheckCircle;
        iconColor = "text-green-500";
        title = notification.subject || notification.title || t("notifications.orderDelivered");
        break;
      case "order_cancelled":
      case "ORDER_CANCELLED":
        icon = AlertCircle;
        iconColor = "text-red-500";
        title = notification.subject || notification.title || t("notifications.orderCancelled");
        break;
      case "order_refunded":
      case "ORDER_REFUNDED":
        icon = AlertCircle;
        iconColor = "text-orange-600";
        title = notification.subject || notification.title || t("notifications.orderRefunded");
        break;
      
      // Payment notifications
      case "payment_received":
      case "PAYMENT_RECEIVED":
        icon = CheckCircle;
        iconColor = "text-green-600";
        title = notification.subject || notification.title || t("notifications.paymentReceived");
        break;
      case "payment_failed":
      case "PAYMENT_FAILED":
        icon = AlertCircle;
        iconColor = "text-red-600";
        title = notification.subject || notification.title || t("notifications.paymentFailed");
        break;
      
      // Customer notifications
      case "new_customer":
      case "NEW_CUSTOMER":
        icon = User;
        iconColor = "text-indigo-500";
        title = notification.subject || notification.title || t("notifications.newCustomer");
        break;
      case "customer_updated":
      case "CUSTOMER_UPDATED":
        icon = User;
        iconColor = "text-blue-400";
        title = notification.subject || notification.title || t("notifications.customerUpdated");
        break;
      
      // Stock notifications
      case "low_stock":
      case "LOW_STOCK":
        icon = AlertCircle;
        iconColor = "text-orange-500";
        title = notification.subject || notification.title || t("notifications.lowStockAlert");
        break;
      case "out_of_stock":
      case "OUT_OF_STOCK":
        icon = AlertCircle;
        iconColor = "text-red-500";
        title = notification.subject || notification.title || t("notifications.outOfStock");
        break;
      
      // Product notifications
      case "product_added":
      case "PRODUCT_ADDED":
        icon = Package;
        iconColor = "text-green-500";
        title = notification.subject || notification.title || t("notifications.productAdded");
        break;
      case "product_updated":
      case "PRODUCT_UPDATED":
        icon = Package;
        iconColor = "text-blue-500";
        title = notification.subject || notification.title || t("notifications.productUpdated");
        break;
      
      // Broadcast notifications
      case "broadcast_email":
      case "BROADCAST_EMAIL":
        icon = Bell;
        iconColor = "text-indigo-500";
        title = notification.subject || notification.title || t("notifications.emailBroadcast");
        break;
      case "broadcast_sms":
      case "BROADCAST_SMS":
        icon = Bell;
        iconColor = "text-teal-500";
        title = notification.subject || notification.title || t("notifications.smsBroadcast");
        break;
      
      default:
        icon = Bell;
        iconColor = "text-gray-500";
        title = notification.subject || notification.title || t("notifications.notification");
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
      orderId: notification.orderId,
    };
  }).sort((a, b) => {
    // Sort by read status (unread first) and then by time
    if (a.read === b.read) return 0;
    return a.read ? 1 : -1;
  });



  const newNotificationCount = notifications.filter((n) => !n.read).length;

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
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
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
  }, [showSearchResults, setIsSearching]);

  // ... existing code ...

  return (
    <nav className="w-full h-16 flex items-center gap-4 px-4 lg:px-6">
      <div className="flex items-center gap-3 w-full">
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <IconButton
            icon={Menu}
            onClick={() => setIsMobileMenuOpen(true)}
            className="!bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          />
        </div>

        {/* Global Search Bar - Clean & Modern */}
        <div
          className={`flex-1 max-w-xl relative ${
            isMobileSearchOpen
              ? "flex absolute top-16 left-0 right-0 p-4 bg-white dark:bg-[#09090b] shadow-lg border-b border-gray-100 dark:border-white/5 z-50"
              : "hidden lg:flex"
          }`}
          ref={searchContainerRef}
        >
          <div className="relative w-full group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
             <input 
                type="text"
                placeholder={t("search.placeholder")}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all duration-300"
             />
          </div>

          {/* Real-time Search Results Dropdown */}
          {showSearchResults && searchTerm && searchTerm.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#09090b] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl shadow-black/5 z-50 max-h-[70vh] overflow-y-auto ring-1 ring-black/5">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {t("search.results")} ({totalResults})
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setShowSearchResults(false);
                      setIsSearching(false);
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    {t("common.clear")}
                  </button>
                </div>

                {isSearchLoading ? (
                  <div className="text-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3 opacity-50"></div>
                     <p className="text-sm text-gray-500">{t("search.searching")}</p>
                  </div>
                ) : totalResults === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("search.noResults", { term: searchTerm })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Orders Results */}
                    {results.orders.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          {t("search.orders")}
                        </h4>
                        <div className="grid gap-2">
                          {results.orders.slice(0, 5).map((o) => (
                            <div
                              key={o.id}
                              onClick={() => {
                                navigate(`/orders/${o.id}`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                    Order #{o.id}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {o.customer?.name ?? o.customerName ?? "-"}{" "}
                                    <span className="mx-1">•</span> {o.status}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          {t("search.products")}
                        </h4>
                        <div className="grid gap-2">
                          {results.products.slice(0, 5).map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                navigate(`/products/${p.id}`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                    {p.name ?? p.title ?? "-"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    SKU: {p.sku || "-"} <span className="mx-1">•</span> Stock: {p.stock || 0}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                           {t("search.customers")}
                        </h4>
                        <div className="grid gap-2">
                          {results.customers.slice(0, 5).map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                navigate(`/customers`);
                                setSearchTerm("");
                                setShowSearchResults(false);
                                setIsSearching(false);
                              }}
                              className="p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
                            >
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                                   {c.name?.charAt(0) || "U"}
                                 </div>
                                  <div>
                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 transition-colors">
                                      {c.name ?? "-"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {c.email || "-"}
                                    </p>
                                  </div>
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

        {/* Right Actions */}
        <div className="flex items-center gap-3 lg:gap-4 ml-auto">
           {/* Mobile Search Toggle */}
          <div className="lg:hidden">
            <IconButton
              icon={Search}
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="!bg-transparent text-gray-500 dark:text-gray-400"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2">
             <ThemeToggle
                variant="compact"
                className="!bg-gray-100/50 dark:!bg-white/5 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-white/10 border-0"
              />
              <LanguageSwitcher
                variant="compact"
                 className="!bg-gray-100/50 dark:!bg-white/5 !text-gray-700 dark:!text-gray-300 hover:!bg-gray-200 dark:hover:!bg-white/10 border-0"
              />
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {newNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#09090b]"></span>
              )}
            </button>
          </div>

          {/* Profile */}
          <Link to="/settings" className="flex items-center gap-3 pl-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-white/10">
              <span className="text-sm font-bold">{user?.name?.charAt(0) || "U"}</span>
            </div>
            {/* <div className="hidden lg:block text-left">
               <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-none">{user?.name || "User"}</p>
               <p className="text-[10px] text-gray-500 font-medium leading-none mt-1 uppercase tracking-wide">{user?.role || "Admin"}</p>
            </div> */}
          </Link>
        </div>
      </div>

      {/* Notifications Modal Wrapper - Keeping original logic but clean trigger */}
      <Dialog
        open={isNotificationModalOpen}
        onOpenChange={setIsNotificationModalOpen}
      >
        <DialogContent className="max-w-md sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-[#09090b] border-gray-100 dark:border-white/10">
          <DialogHeader className="p-4 border-b border-gray-100 dark:border-white/5">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <Bell className="h-4 w-4 text-blue-500" />
              {t("notifications.title")}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-12">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3 opacity-50"></div>
                 <p className="text-xs text-gray-500">{t("notifications.loading")}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-3">
                   <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t("notifications.noNotifications")}</p>
                <p className="text-xs text-gray-500 mt-1">You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = notification.icon;
                return (
                  <div
                    key={notification.id}
                    onClick={async () => {
                      if (!notification.read) {
                        try {
                          await markAsRead({ id: notification.id, companyId }).unwrap();
                        } catch (e) {
                          console.error("Failed to mark as read:", e);
                        }
                      }
                      if (notification.orderId) {
                        navigate(`/orders/${notification.orderId}`);
                        setIsNotificationModalOpen(false);
                      }
                    }}
                    className={`p-3 rounded-xl transition-all ${
                      !notification.read
                        ? "bg-blue-50/50 dark:bg-blue-500/10 hover:bg-blue-50 dark:hover:bg-blue-500/20"
                        : "hover:bg-gray-50 dark:hover:bg-white/5"
                    } cursor-pointer group relative`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${
                             !notification.read ? "bg-white dark:bg-white/10 shadow-sm" : "bg-gray-100 dark:bg-white/5"
                          } ${notification.iconColor}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm ${!notification.read ? "font-semibold text-gray-900 dark:text-white" : "font-medium text-gray-700 dark:text-gray-300"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap">{notification.time}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {notifications.length > 0 && (
             <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex gap-2">
               {newNotificationCount > 0 && (
                <button
                  onClick={() => markAllAsRead(companyId)}
                  disabled={isMarkingAll}
                  className="flex-1 text-xs font-medium py-2 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/20 transition-colors shadow-sm"
                >
                  {isMarkingAll ? t("common.processing") : t("notifications.markAllAsRead")}
                </button>
               )}
               <button
                  onClick={() => {
                    refetchAll();
                    refetchOrders();
                  }}
                  className="flex-none px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title={t("notifications.refresh")}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
               </button>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default TopNavbar;