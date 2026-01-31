import React, { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { ShieldX, ShieldCheck, Trash2, Info } from "lucide-react";
import Dropdown from "@/components/dropdown/dropdown";
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

const CustomersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [selectedBanDetails, setSelectedBanDetails] = useState(null);

  const SUCCESSFUL_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasSuccessfulOrders"), value: "has" },
      { label: t("customers.noSuccessfulOrders"), value: "none" },
    ],
    [t]
  );

  const CANCELLED_ORDERS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.hasCancelledOrders"), value: "has" },
      { label: t("customers.noCancelledOrders"), value: "none" },
    ],
    [t]
  );

  const STATUS_OPTIONS = useMemo(
    () => [
      { label: t("customers.all"), value: "" },
      { label: t("customers.statusActive"), value: "active" },
      { label: t("customers.statusBanned"), value: "banned" },
      { label: t("customers.statusInactive"), value: "inactive" },
    ],
    [t]
  );

  const [selectedSuccessfulOrders, setSelectedSuccessfulOrders] = useState(SUCCESSFUL_ORDERS_OPTIONS[0]);
  const [selectedCancelledOrders, setSelectedCancelledOrders] = useState(CANCELLED_ORDERS_OPTIONS[0]);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS[0]);

  const queryParams = useMemo(() => {
    const params = { companyId: authUser?.companyId };
    if (selectedSuccessfulOrders?.value) params.successfulOrders = selectedSuccessfulOrders.value;
    if (selectedCancelledOrders?.value) params.cancelledOrders = selectedCancelledOrders.value;
    if (selectedStatus?.value === "active") {
      params.isActive = "true";
      params.isBanned = "false";
    } else if (selectedStatus?.value === "banned") {
      params.isBanned = "true";
    } else if (selectedStatus?.value === "inactive") {
      params.isActive = "false";
    }
    return params;
  }, [authUser?.companyId, selectedSuccessfulOrders, selectedCancelledOrders, selectedStatus]);

  const { data: users = [], isLoading } = useGetUsersQuery(queryParams, { skip: !authUser?.companyId });
  const { data: stats } = useGetStatsQuery({ companyId: authUser?.companyId }, { skip: !authUser?.companyId });

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
      { header: t("customers.successfulOrders"), field: "successfulOrdersCount" },
      { header: t("customers.cancelledOrders"), field: "cancelledOrdersCount" },
      { header: t("common.active"), field: "isActive" },
      { header: t("customers.banned"), field: "isBanned" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const getRowClassName = useCallback(
    (row) => {
      const successCount = row.successfulOrdersCount ?? 0;
      const cancelCount = row.cancelledOrdersCount ?? 0;
      if (successCount >= 3 && cancelCount <= 1) {
        return "bg-emerald-50/80 dark:bg-emerald-950/30 border-l-4 border-l-emerald-500";
      }
      if (cancelCount >= 2) {
        return "bg-amber-50/80 dark:bg-amber-950/30 border-l-4 border-l-amber-500";
      }
      return "";
    },
    []
  );

  const tableData = useMemo(
    () =>
      users.map((u) => ({
        name: u.name ?? "-",
        email: u.email ?? "-",
        phone: u.phone ?? "-",
        totalOrdersCount: (u.successfulOrdersCount ?? 0) + (u.cancelledOrdersCount ?? 0),
        successfulOrdersCount: u.successfulOrdersCount ?? 0,
        cancelledOrdersCount: u.cancelledOrdersCount ?? 0,
        isActive: u.isActive ? t("orders.yes") : t("orders.no"),
        isBanned: u.isBanned ? t("orders.yes") : t("orders.no"),
        actions: (
          <div className="flex items-center  gap-2 justify-end">
            {u.isBanned ? (
              <Button
                variant="secondary"
                size="icon"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
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
                title={t("customers.viewBanDetails")}
              >
                <Info className="h-4 w-4" />
              </Button>
            ) : null}
            {u.isBanned ? (
              <Button
                variant="outline"
                size="icon"
                className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-400 dark:text-black dark:hover:bg-emerald-300 disabled:bg-emerald-400/70 disabled:text-white/80"
                onClick={async () => {
                  const res = await unbanUser(u.id);
                  if (res?.data) toast.success(t("customers.userUnbanned"));
                  else toast.error(res?.error?.data?.message || t("common.failed"));
                }}
                disabled={isUnbanning}
                title={t("customers.unban")}
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-500/60 disabled:text-white/70"
                onClick={async () => {
                  const reason = window.prompt("Ban reason (optional):") || undefined;
                  const res = await banUser({ id: u.id, reason });
                  if (res?.data) toast.success(t("customers.userBanned"));
                  else toast.error(res?.error?.data?.message || t("common.failed"));
                }}
                disabled={isBanning}
                title={t("customers.ban")}
              >
                <ShieldX className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-black dark:hover:bg-red-600 disabled:opacity-60"
              onClick={async () => {
                if (!window.confirm("Delete this user?")) return;
                const res = await deleteUser(u.id);
                if (res?.data || !res?.error) toast.success(t("customers.userDeleted"));
                else toast.error(res?.error?.data?.message || t("common.failed"));
              }}
              disabled={isDeleting}
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [users, deleteUser, banUser, unbanUser, isDeleting, isBanning, isUnbanning, t]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">{t("customers.title")}</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={handleExport}>
            {t("customers.exportToPdf")}
          </Button>
          <CustomerNotifications />
          <Button size="sm" onClick={() => navigate("/customers/create")}>
            {t("customers.addCustomer")}
          </Button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-4">
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("customers.totalCustomers")}</p>
            <p className="text-lg font-semibold">{stats.totalCustomers ?? 0}</p>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-emerald-500/10 dark:bg-emerald-500/20 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("customers.successOrderRatio")}</p>
            <p className="text-lg font-semibold">{stats.successOrderRatio ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-amber-500/10 dark:bg-amber-500/20 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("customers.cancelRatio")}</p>
            <p className="text-lg font-semibold">{stats.cancelRatio ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-blue-500/10 dark:bg-blue-500/20 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("customers.newCustomerRatio")}</p>
            <p className="text-lg font-semibold">{stats.newCustomerRatio ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-red-500/10 dark:bg-red-500/20 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("customers.totalBannedCustomers")}</p>
            <p className="text-lg font-semibold">{stats.totalBannedCustomers ?? 0}</p>
          </div>
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3">
            <p className="text-xs text-black/60 dark:text-white/60">{t("orders.totalOrders")}</p>
            <p className="text-lg font-semibold">{stats.totalOrders ?? 0}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("customers.filterBySuccessfulOrders")}
          </label>
          <Dropdown
            name="successfulOrders"
            options={SUCCESSFUL_ORDERS_OPTIONS}
            setSelectedOption={setSelectedSuccessfulOrders}
          >
            {selectedSuccessfulOrders?.label}
          </Dropdown>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("customers.filterByCancelledOrders")}
          </label>
          <Dropdown
            name="cancelledOrders"
            options={CANCELLED_ORDERS_OPTIONS}
            setSelectedOption={setSelectedCancelledOrders}
          >
            {selectedCancelledOrders?.label}
          </Dropdown>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("customers.filterByStatus")}
          </label>
          <Dropdown
            name="status"
            options={STATUS_OPTIONS}
            setSelectedOption={setSelectedStatus}
          >
            {selectedStatus?.label}
          </Dropdown>
        </div>
      </div>
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
            <DialogDescription className='text-center'>
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
    </div >
  );
};

export default CustomersPage;