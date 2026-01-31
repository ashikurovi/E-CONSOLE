import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  Bell,
  ShoppingCart,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
  User,
  Filter,
  RefreshCw,
  Check,
  Clock,
} from "lucide-react";
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

const NotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  // Fetch user data from API instead of Redux
  const { data: user } = useGetCurrentUserQuery();
  const companyId = user?.companyId;

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
    refetch: refetchOrderStatus,
  } = useGetOrderStatusNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const {
    data: newCustomerNotifications = [],
    isLoading: isLoadingCustomers,
    refetch: refetchCustomers,
  } = useGetNewCustomerNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const {
    data: lowStockNotifications = [],
    isLoading: isLoadingStock,
    refetch: refetchStock,
  } = useGetLowStockNotificationsQuery(companyId, {
    skip: !companyId,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsAsReadMutation();

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
  const notifications = uniqueNotifications
    .map((notification) => {
      // Determine icon and color based on notification type (matching backend enum)
      let icon = Bell;
      let iconColor = "text-gray-500";
      let bgGradient =
        "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900";
      let title =
        notification.subject ||
        notification.title ||
        t("notifications.notification");

      switch (notification.type) {
        // Order notifications
        case "order_created":
        case "ORDER_CREATED":
          icon = ShoppingCart;
          iconColor = "text-blue-500";
          bgGradient =
            "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newOrderCreated");
          break;
        case "order_confirmed":
        case "ORDER_CONFIRMED":
          icon = CheckCircle;
          iconColor = "text-blue-600";
          bgGradient =
            "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderConfirmed");
          break;
        case "order_processing":
        case "ORDER_PROCESSING":
          icon = Package;
          iconColor = "text-yellow-500";
          bgGradient =
            "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderProcessing");
          break;
        case "order_shipped":
        case "ORDER_SHIPPED":
          icon = Truck;
          iconColor = "text-purple-500";
          bgGradient =
            "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderShipped");
          break;
        case "order_delivered":
        case "ORDER_DELIVERED":
          icon = CheckCircle;
          iconColor = "text-green-500";
          bgGradient =
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderDelivered");
          break;
        case "order_cancelled":
        case "ORDER_CANCELLED":
          icon = AlertCircle;
          iconColor = "text-red-500";
          bgGradient =
            "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderCancelled");
          break;
        case "order_refunded":
        case "ORDER_REFUNDED":
          icon = AlertCircle;
          iconColor = "text-orange-600";
          bgGradient =
            "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.orderRefunded");
          break;

        // Payment notifications
        case "payment_received":
        case "PAYMENT_RECEIVED":
          icon = CheckCircle;
          iconColor = "text-green-600";
          bgGradient =
            "from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.paymentReceived");
          break;
        case "payment_failed":
        case "PAYMENT_FAILED":
          icon = AlertCircle;
          iconColor = "text-red-600";
          bgGradient =
            "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.paymentFailed");
          break;

        // Customer notifications
        case "new_customer":
        case "NEW_CUSTOMER":
          icon = User;
          iconColor = "text-indigo-500";
          bgGradient =
            "from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.newCustomer");
          break;
        case "customer_updated":
        case "CUSTOMER_UPDATED":
          icon = User;
          iconColor = "text-blue-400";
          bgGradient =
            "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.customerUpdated");
          break;

        // Stock notifications
        case "low_stock":
        case "LOW_STOCK":
          icon = AlertCircle;
          iconColor = "text-orange-500";
          bgGradient =
            "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.lowStockAlert");
          break;
        case "out_of_stock":
        case "OUT_OF_STOCK":
          icon = AlertCircle;
          iconColor = "text-red-500";
          bgGradient =
            "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.outOfStock");
          break;

        // Product notifications
        case "product_added":
        case "PRODUCT_ADDED":
          icon = Package;
          iconColor = "text-green-500";
          bgGradient =
            "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.productAdded");
          break;
        case "product_updated":
        case "PRODUCT_UPDATED":
          icon = Package;
          iconColor = "text-blue-500";
          bgGradient =
            "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.productUpdated");
          break;

        // Broadcast notifications
        case "broadcast_email":
        case "BROADCAST_EMAIL":
          icon = Bell;
          iconColor = "text-indigo-500";
          bgGradient =
            "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.emailBroadcast");
          break;
        case "broadcast_sms":
        case "BROADCAST_SMS":
          icon = Bell;
          iconColor = "text-teal-500";
          bgGradient =
            "from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.smsBroadcast");
          break;

        default:
          icon = Bell;
          iconColor = "text-gray-500";
          bgGradient =
            "from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800";
          title =
            notification.subject ||
            notification.title ||
            t("notifications.notification");
      }

      return {
        id: notification.id || notification._id,
        type: notification.type || "general",
        title: title,
        message: notification.message || `Notification message`,
        time: notification.createdAt
          ? moment(notification.createdAt).fromNow()
          : "Just now",
        rawTime: notification.createdAt || new Date(),
        icon: icon,
        iconColor: iconColor,
        bgGradient: bgGradient,
        read: notification.isRead || false,
        orderId: notification.orderId,
      };
    })
    .sort((a, b) => {
      // Sort by time (newest first)
      return new Date(b.rawTime) - new Date(a.rawTime);
    });

  const newNotificationCount = notifications.filter((n) => !n.read).length;

  // Filter Logic
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "orders")
      return (
        n.type.toLowerCase().includes("order") ||
        n.type.toLowerCase().includes("payment")
      );
    if (activeFilter === "customers")
      return n.type.toLowerCase().includes("customer");
    if (activeFilter === "stock")
      return (
        n.type.toLowerCase().includes("stock") ||
        n.type.toLowerCase().includes("product")
      );
    return true;
  });

  // Group by Date
  const groupedNotifications = filteredNotifications.reduce(
    (groups, notification) => {
      const date = moment(notification.rawTime);
      const today = moment().startOf("day");
      const yesterday = moment().subtract(1, "days").startOf("day");

      let groupKey = "Earlier";
      if (date.isSame(today, "d")) groupKey = "Today";
      else if (date.isSame(yesterday, "d")) groupKey = "Yesterday";

      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(notification);
      return groups;
    },
    {},
  );

  // Group order for display
  const groupOrder = ["Today", "Yesterday", "Earlier"];

  const handleRefresh = () => {
    refetchAll();
    refetchOrders();
    refetchOrderStatus();
    refetchCustomers();
    refetchStock();
  };

  const filters = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "orders", label: "Orders" },
    { id: "customers", label: "Customers" },
    { id: "stock", label: "Stock & Products" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("notifications.title")}
            </h1>
            {newNotificationCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {newNotificationCount} New
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Stay updated with your store's latest activities
          </p>
        </div>

        <div className="flex items-center gap-3">
          {newNotificationCount > 0 && (
            <button
              onClick={() => markAllAsRead(companyId)}
              disabled={isMarkingAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
            >
              <Check className="h-4 w-4" />
              {isMarkingAll
                ? t("common.processing")
                : t("notifications.markAllAsRead")}
            </button>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("notifications.refresh")}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`
              whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${
                activeFilter === filter.id
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md transform scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-8 min-h-[400px]">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 animate-pulse">
              {t("notifications.loading")}
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Bell className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No notifications found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {activeFilter === "all"
                ? t("notifications.noNotifications")
                : `You don't have any ${activeFilter} notifications at the moment.`}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                View all notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map((group) => {
              const groupNotifications = groupedNotifications[group];
              if (!groupNotifications || groupNotifications.length === 0)
                return null;

              return (
                <div key={group} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group}
                    </h2>
                    <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800"></div>
                  </div>

                  <div className="grid gap-3">
                    {groupNotifications.map((notification) => {
                      const IconComponent = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          onClick={async () => {
                            if (!notification.read) {
                              try {
                                await markAsRead({
                                  id: notification.id,
                                  companyId,
                                }).unwrap();
                              } catch (e) {
                                console.error("Failed to mark as read:", e);
                              }
                            }
                            if (notification.orderId) {
                              navigate(`/orders/${notification.orderId}`);
                            }
                          }}
                          className={`
                            group relative overflow-hidden p-4 rounded-xl transition-all duration-300 border
                            ${
                              !notification.read
                                ? "bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-900/50 shadow-sm hover:shadow-md"
                                : "bg-gray-50/50 dark:bg-gray-900/20 border-transparent hover:bg-white dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                            }
                            cursor-pointer
                          `}
                        >
                          {/* Unread Indicator */}
                          {!notification.read && (
                            <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 animate-pulse"></div>
                          )}

                          <div className="flex gap-4">
                            {/* Icon Box */}
                            <div
                              className={`
                              flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center
                              bg-gradient-to-br ${notification.bgGradient}
                              shadow-inner
                            `}
                            >
                              <IconComponent
                                className={`h-6 w-6 ${notification.iconColor}`}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-start justify-between gap-4 pr-6">
                                <h4
                                  className={`
                                  text-base font-semibold leading-tight mb-1
                                  ${!notification.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}
                                `}
                                >
                                  {notification.title}
                                </h4>
                              </div>

                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2 line-clamp-2">
                                {notification.message}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                                  <Clock className="h-3 w-3" />
                                  {notification.time}
                                </span>
                                {notification.orderId && (
                                  <span className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                                    <ShoppingCart className="h-3 w-3" />
                                    Order #{notification.orderId}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
