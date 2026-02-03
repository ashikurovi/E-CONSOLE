import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  ShieldX,
  ShieldCheck,
  Trash2,
  Info,
  Eye,
  MoreHorizontal,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Upload,
  Download,
  Zap,
  UserPlus,
  Ban,
  ShoppingBag,
  Mail,
  MessageSquare,
} from "lucide-react";
import Dropdown from "@/components/dropdown/dropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/user/userApiSlice";
import { useGetStatsQuery } from "@/features/dashboard/dashboardApiSlice";
import { useNavigate } from "react-router-dom";
import CustomerNotifications from "./components/CustomerNotifications";
import { exportCustomersToPDF } from "@/utils/pdfExport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import ProductsStatCard from "@/pages/products/components/list/ProductsStatCard";

const CustomersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [selectedBanDetails, setSelectedBanDetails] = useState(null);

  const calculateTrend = useCallback((data, dateField) => {
    if (!data?.length) return { value: "0.0%", dir: "right", color: "gray" };

    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    let currentCount = 0;
    let lastCount = 0;

    data.forEach((item) => {
      if (!item[dateField]) return;
      const date = new Date(item[dateField]);
      if (
        isWithinInterval(date, {
          start: currentMonthStart,
          end: currentMonthEnd,
        })
      ) {
        currentCount++;
      } else if (
        isWithinInterval(date, { start: lastMonthStart, end: lastMonthEnd })
      ) {
        lastCount++;
      }
    });

    if (lastCount === 0) {
      return currentCount > 0
        ? { value: "+100%", dir: "up", color: "green" }
        : { value: "0.0%", dir: "right", color: "gray" };
    }

    const diff = ((currentCount - lastCount) / lastCount) * 100;
    const dir = diff > 0 ? "up" : diff < 0 ? "down" : "right";
    const color = diff >= 0 ? "green" : "red";

    return {
      value: `${diff > 0 ? "+" : ""}${diff.toFixed(1)}%`,
      dir,
      color,
    };
  }, []);

  const SUCCESSFUL_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasSuccessfulOrders"), value: "has" },
      { label: t("customers.noSuccessfulOrders"), value: "none" },
    ],
    [t],
  );

  const CANCELLED_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasCancelledOrders"), value: "has" },
      { label: t("customers.noCancelledOrders"), value: "none" },
    ],
    [t],
  );

  const STATUS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.statusActive"), value: "active" },
      { label: t("customers.statusBanned"), value: "banned" },
      { label: t("customers.statusInactive"), value: "inactive" },
    ],
    [t],
  );

  const [selectedSuccessfulOrders, setSelectedSuccessfulOrders] = useState(
    SUCCESSFUL_ORDERS_OPTIONS[0],
  );
  const [selectedCancelledOrders, setSelectedCancelledOrders] = useState(
    CANCELLED_ORDERS_OPTIONS[0],
  );
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

  const queryParams = useMemo(() => {
    const params = { companyId: authUser?.companyId };
    if (selectedSuccessfulOrders?.value)
      params.successfulOrders = selectedSuccessfulOrders.value;
    if (selectedCancelledOrders?.value)
      params.cancelledOrders = selectedCancelledOrders.value;
    if (selectedStatus?.value === "active") {
      params.isActive = "true";
      params.isBanned = "false";
    } else if (selectedStatus?.value === "banned") {
      params.isBanned = "true";
    } else if (selectedStatus?.value === "inactive") {
      params.isActive = "false";
    }
    return params;
  }, [
    authUser?.companyId,
    selectedSuccessfulOrders,
    selectedCancelledOrders,
    selectedStatus,
  ]);

  const { data: users = [], isLoading } = useGetUsersQuery(queryParams, {
    skip: !authUser?.companyId,
  });
  const { data: stats } = useGetStatsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const userTrend = useMemo(
    () => calculateTrend(users, "createdAt"),
    [users, calculateTrend],
  );
  const bannedTrend = useMemo(
    () =>
      calculateTrend(
        users.filter((u) => u.isBanned),
        "bannedAt",
      ),
    [users, calculateTrend],
  );

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: t("customers.totalCustomers"),
        value: stats.totalCustomers ?? 0,
        trend: userTrend.value,
        trendDir: userTrend.dir,
        trendColor: userTrend.color === "green" ? "green" : "red",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
        wave: "text-blue-500",
      },
      {
        label: t("customers.successOrderRatio"),
        value: `${stats.successOrderRatio ?? 0}%`,
        trend: "+5.2%", // Static for now as no order history
        trendDir: "up",
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        wave: "text-emerald-500",
      },
      {
        label: t("customers.cancelRatio"),
        value: `${stats.cancelRatio ?? 0}%`,
        trend: "-2.1%", // Static for now
        trendDir: "down",
        trendColor: "green", // Lower is better for cancel ratio
        icon: XCircle,
        color: "text-amber-600",
        bg: "bg-amber-100",
        wave: "text-amber-500",
      },
      {
        label: t("customers.newCustomerRatio"),
        value: `${stats.newCustomerRatio ?? 0}%`,
        trend: "+8.4%", // Static
        trendDir: "up",
        icon: UserPlus,
        color: "text-violet-600",
        bg: "bg-violet-100",
        wave: "text-violet-500",
      },
      {
        label: t("customers.totalBannedCustomers"),
        value: stats.totalBannedCustomers ?? 0,
        trend: bannedTrend.value,
        trendDir: bannedTrend.dir,
        trendColor: bannedTrend.color === "green" ? "green" : "red",
        icon: Ban,
        color: "text-red-600",
        bg: "bg-red-100",
        wave: "text-red-500",
      },
      {
        label: t("orders.totalOrders"),
        value: stats.totalOrders ?? 0,
        trend: "+15.3%", // Static
        trendDir: "up",
        icon: ShoppingBag,
        color: "text-indigo-600",
        bg: "bg-indigo-100",
        wave: "text-indigo-500",
      },
    ];
  }, [stats, t, userTrend, bannedTrend]);

  const handleExport = () => {
    if (!users?.length) {
      toast.error(t("customers.noCustomersExport"));
      return;
    }

    exportCustomersToPDF(users, t("customers.title"));
  };

  const headers = useMemo(
    () => [
      { header: t("common.name"), field: "name" },
      { header: t("customers.email"), field: "email" },
      { header: t("customers.phone"), field: "phone" },
      { header: t("orders.totalOrders"), field: "totalOrdersCount" },
      {
        header: t("customers.successfulOrders"),
        field: "successfulOrdersCount",
      },
      { header: t("customers.cancelledOrders"), field: "cancelledOrdersCount" },
      { header: t("common.active"), field: "isActive" },
      { header: t("customers.banned"), field: "isBanned" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t],
  );

  const getRowClassName = useCallback((row) => {
    const successCount = row.successfulOrdersCount ?? 0;
    const cancelCount = row.cancelledOrdersCount ?? 0;
    if (successCount >= 3 && cancelCount <= 1) {
      return "bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-l-emerald-500";
    }
    if (cancelCount >= 2) {
      return "bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-amber-500";
    }
    return "";
  }, []);

  const tableData = useMemo(
    () =>
      users.map((u) => ({
        name: u.name ?? "-",
        email: u.email ?? "-",
        phone: u.phone ?? "-",
        totalOrdersCount:
          (u.successfulOrdersCount ?? 0) + (u.cancelledOrdersCount ?? 0),
        successfulOrdersCount: u.successfulOrdersCount ?? 0,
        cancelledOrdersCount: u.cancelledOrdersCount ?? 0,
        isActive: u.isActive ? t("orders.yes") : t("orders.no"),
        isBanned: u.isBanned ? t("orders.yes") : t("orders.no"),
        actions: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/customers/${u.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("common.view")}
              </DropdownMenuItem>
              {u.isBanned && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBanDetails({
                      name: u.name ?? "-",
                      email: u.email ?? "-",
                      reason: u.banReason || t("customers.noReasonProvided"),
                      bannedAt: u.bannedAt
                        ? new Date(u.bannedAt).toLocaleString()
                        : t("customers.notAvailable"),
                    });
                  }}
                >
                  <Info className="mr-2 h-4 w-4" />
                  {t("customers.viewBanDetails")}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {u.isBanned ? (
                <DropdownMenuItem
                  onClick={async () => {
                    const res = await unbanUser(u.id);
                    if (res?.data) toast.success(t("customers.userUnbanned"));
                    else
                      toast.error(
                        res?.error?.data?.message || t("common.failed"),
                      );
                  }}
                  disabled={isUnbanning}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {t("customers.unban")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={async () => {
                    const reason =
                      window.prompt("Ban reason (optional):") || undefined;
                    const res = await banUser({ id: u.id, reason });
                    if (res?.data) toast.success(t("customers.userBanned"));
                    else
                      toast.error(
                        res?.error?.data?.message || t("common.failed"),
                      );
                  }}
                  disabled={isBanning}
                  className="text-amber-600 focus:text-amber-600"
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  {t("customers.ban")}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={async () => {
                  if (!window.confirm("Delete this user?")) return;
                  const res = await deleteUser(u.id);
                  if (res?.data || !res?.error)
                    toast.success(t("customers.userDeleted"));
                  else
                    toast.error(
                      res?.error?.data?.message || t("common.failed"),
                    );
                }}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      })),
    [
      users,
      deleteUser,
      banUser,
      unbanUser,
      isDeleting,
      isBanning,
      isUnbanning,
      t,
    ],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Customer{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Database
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            Manage your customer base, track their orders, and organize your
            relationships efficiently.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <Button
            variant="outline"
            onClick={handleExport}
            className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            {t("customers.exportToPdf")}
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.success("Email Broadcast feature coming soon!")
            }
            className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Mail className="w-5 h-5" />
            {t("customers.emailBroadcast") || "Email"}
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("SMS Broadcast feature coming soon!")}
            className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <MessageSquare className="w-5 h-5" />
            {t("customers.smsBroadcast") || "SMS"}
          </Button>
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/customers/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">{t("customers.addCustomer")}</span>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
        {statCards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <ProductsStatCard key={index} stat={stat} index={index} />
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
              {t("customers.filterBySuccessfulOrders")}
            </label>
            <select
              value={selectedSuccessfulOrders.value}
              onChange={(e) => {
                const selected = SUCCESSFUL_ORDERS_OPTIONS.find(
                  (opt) => opt.value === e.target.value,
                );
                setSelectedSuccessfulOrders(selected);
              }}
              className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SUCCESSFUL_ORDERS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
              {t("customers.filterByCancelledOrders")}
            </label>
            <select
              value={selectedCancelledOrders.value}
              onChange={(e) => {
                const selected = CANCELLED_ORDERS_OPTIONS.find(
                  (opt) => opt.value === e.target.value,
                );
                setSelectedCancelledOrders(selected);
              }}
              className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {CANCELLED_ORDERS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
              {t("customers.filterByStatus")}
            </label>
            <select
              value={selectedStatus.value}
              onChange={(e) => {
                const selected = STATUS_OPTIONS.find(
                  (opt) => opt.value === e.target.value,
                );
                setSelectedStatus(selected);
              }}
              className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <CustomerNotifications />
        <ReusableTable
          data={tableData}
          headers={headers}
          total={users.length}
          isLoading={isLoading}
          py="py-2"
          getRowClassName={getRowClassName}
        />
        <Dialog
          open={!!selectedBanDetails}
          onOpenChange={(open) => {
            if (!open) setSelectedBanDetails(null);
          }}
        >
          <DialogContent className="max-w-md h-[400px] ">
            <DialogHeader>
              <DialogTitle>{t("customers.banDetails")}</DialogTitle>
              <DialogDescription className="text-center">
                {t("customers.banDetailsDesc")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2 ">
              <div>
                <p className="text-xs uppercase text-black/50 dark:text-white/50">
                  {t("orders.customer")}
                </p>
                <p className="font-medium">
                  {selectedBanDetails?.name} ({selectedBanDetails?.email})
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-black/50 dark:text-white/50">
                  {t("customers.reason")}
                </p>
                <p className="font-medium whitespace-pre-wrap">
                  {selectedBanDetails?.reason}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-black/50 dark:text-white/50">
                  {t("customers.bannedAt")}
                </p>
                <p className="font-medium">{selectedBanDetails?.bannedAt}</p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-black dark:hover:bg-red-600"
                onClick={() => setSelectedBanDetails(null)}
              >
                {t("customers.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomersPage;
