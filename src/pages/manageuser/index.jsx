import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Shield } from "lucide-react";
import {
  useGetSystemusersQuery,
  useDeleteSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { useNavigate } from "react-router-dom";

const ManageUsersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [deleteSystemuser, { isLoading: isDeleting }] = useDeleteSystemuserMutation();
  const headers = useMemo(
    () => [
      { header: t("manageUsers.company"), field: "companyName" },
      { header: t("manageUsers.email"), field: "email" },
      { header: t("manageUsers.phone"), field: "phone" },
      { header: t("manageUsers.role"), field: "role" },
      { header: t("manageUsers.permissions"), field: "permissions" },
      { header: t("manageUsers.active"), field: "isActive" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const getRoleBadge = (role) => {
    const roleLabels = {
      SUPER_ADMIN: t("manageUsers.superAdmin"),
      SYSTEM_OWNER: t("manageUsers.systemOwner"),
      EMPLOYEE: t("manageUsers.employee"),
    };
    const roleColors = {
      SUPER_ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      SYSTEM_OWNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      EMPLOYEE: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${roleColors[role] || roleColors.EMPLOYEE}`}>
        {roleLabels[role] || role || t("manageUsers.employee")}
      </span>
    );
  };

  // Only show SYSTEM_OWNER role users
  const filteredUsers = useMemo(
    () => users.filter((u) => u.role === "SYSTEM_OWNER"),
    [users]
  );

  const tableData = useMemo(
    () =>
      filteredUsers.map((u) => ({
        companyName: u.companyName ?? "-",
        email: u.email ?? "-",
        phone: u.phone ?? "-",
        role: getRoleBadge(u.role),
        permissions: (
          <span className="text-xs text-black/60 dark:text-white/60">
            {(u.permissions?.length || 0) !== 1
              ? t("manageUsers.permissionCountPlural", { count: u.permissions?.length || 0 })
              : t("manageUsers.permissionCount", { count: u.permissions?.length || 0 })}
          </span>
        ),
        isActive: u.isActive ? t("common.yes") : t("common.no"),
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/manage-users/permissions/${u.id}`)}
              title={t("manageUsers.managePermissions")}
              className="bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
            >
              <Shield className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/manage-users/edit/${u.id}`)}
              title={t("common.edit")}
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (!window.confirm(t("manageUsers.deleteConfirm", { email: u.email }))) return;
                const res = await deleteSystemuser(u.id);
                if (res?.data || !res?.error) toast.success(t("manageUsers.userDeleted"));
                else toast.error(res?.error?.data?.message || t("manageUsers.deleteFailed"));
              }}
              disabled={isDeleting}
              title={t("common.delete")}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
      [filteredUsers, deleteSystemuser, isDeleting, t]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{t("manageUsers.title")}</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate("/manage-users/activity-logs")}>
            {t("manageUsers.activityLogs")}
          </Button>
          <Button size="sm" onClick={() => navigate("/manage-users/create")}>
            {t("manageUsers.newSystemUser")}
          </Button>
        </div>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={filteredUsers.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default ManageUsersPage;