import React, { useMemo, useCallback, useState } from "react";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/user/userApiSlice";

const CustomerTableSection = ({ users, isLoading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();

  const [selectedBanDetails, setSelectedBanDetails] = useState(null);
  const [banConfirmUser, setBanConfirmUser] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [unbanConfirmUser, setUnbanConfirmUser] = useState(null);

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
                <span className="sr-only">{t("customers.openMenu")}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => navigate(`/customers/${u.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                {t("common.view")}
              </DropdownMenuItem>
              {u.phone && (
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      `/fraud?phone=${encodeURIComponent(u.phone || "")}`,
                    )
                  }
                >
                  <ShieldX className="mr-2 h-4 w-4" />
                  {t("fraud.title")}
                </DropdownMenuItem>
              )}
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
                  onClick={() => setUnbanConfirmUser(u)}
                  disabled={isUnbanning}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {t("customers.unban")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    setBanConfirmUser(u);
                    setBanReason("");
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
                  if (!window.confirm(t("customers.confirmDeleteUser"))) return;
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
      t,
      navigate,
      deleteUser,
      isDeleting,
      isBanning,
      isUnbanning,
    ],
  );

  return (
    <>
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

      <Dialog
        open={!!unbanConfirmUser}
        onOpenChange={(open) => {
          if (!open) setUnbanConfirmUser(null);
        }}
      >
        <DialogContent className="max-w-md h-[260px]">
          <DialogHeader>
            <DialogTitle>{t("customers.confirmUnbanTitle")}</DialogTitle>
            <DialogDescription>
              {t("customers.confirmUnbanDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setUnbanConfirmUser(null)}
              disabled={isUnbanning}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={async () => {
                if (!unbanConfirmUser) return;
                const res = await unbanUser(unbanConfirmUser.id);
                if (res?.data) {
                  toast.success(t("customers.userUnbanned"));
                  setUnbanConfirmUser(null);
                } else {
                  toast.error(
                    res?.error?.data?.message || t("common.failed"),
                  );
                }
              }}
              disabled={isUnbanning}
            >
              {t("customers.unban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!banConfirmUser}
        onOpenChange={(open) => {
          if (!open) setBanConfirmUser(null);
        }}
      >
        <DialogContent className="max-w-md h-[340px]">
          <DialogHeader>
            <DialogTitle>{t("customers.confirmBanTitle")}</DialogTitle>
            <DialogDescription>
              {t("customers.confirmBanDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold text-black/60 dark:text-white/60">
              {t("customers.banReasonOptionalLabel")}
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              rows={3}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t("customers.banReasonOptionalPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setBanConfirmUser(null)}
              disabled={isBanning}
            >
              {t("common.cancel")}
            </Button>
            <Button
              className="text-amber-600 border-amber-500"
              variant="outline"
              onClick={async () => {
                if (!banConfirmUser) return;
                const res = await banUser({
                  id: banConfirmUser.id,
                  reason: banReason || undefined,
                });
                if (res?.data) {
                  toast.success(t("customers.userBanned"));
                  setBanConfirmUser(null);
                  setBanReason("");
                } else {
                  toast.error(
                    res?.error?.data?.message || t("common.failed"),
                  );
                }
              }}
              disabled={isBanning}
            >
              {t("customers.ban")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerTableSection;

