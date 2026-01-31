import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetActivityLogsQuery, useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import ReusableTable from "@/components/table/reusable-table";
import Dropdown from "@/components/dropdown/dropdown";

const ActivityLogsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: systemUsersData } = useGetSystemusersQuery();
  const systemUsers = Array.isArray(systemUsersData) ? systemUsersData : systemUsersData?.data || [];

  const ACTION_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allActions"), value: "" },
      { label: t("activityLogs.create"), value: "CREATE" },
      { label: t("activityLogs.update"), value: "UPDATE" },
      { label: t("activityLogs.delete"), value: "DELETE" },
      { label: t("activityLogs.permissionAssign"), value: "PERMISSION_ASSIGN" },
      { label: t("activityLogs.permissionRevoke"), value: "PERMISSION_REVOKE" },
      { label: t("activityLogs.statusChange"), value: "STATUS_CHANGE" },
      { label: t("activityLogs.passwordChange"), value: "PASSWORD_CHANGE" },
      { label: t("activityLogs.barcodeScan"), value: "BARCODE_SCAN" },
    ],
    [t]
  );

  const ENTITY_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allEntities"), value: "" },
      { label: t("activityLogs.systemUser"), value: "SYSTEM_USER" },
      { label: t("activityLogs.product"), value: "PRODUCT" },
      { label: t("activityLogs.order"), value: "ORDER" },
      { label: t("activityLogs.category"), value: "CATEGORY" },
      { label: t("activityLogs.customer"), value: "CUSTOMER" },
    ],
    [t]
  );

  const PERFORMED_BY_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers]
  );

  const TARGET_USER_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers]
  );

  const [selectedAction, setSelectedAction] = useState(ACTION_OPTIONS[0]);
  const [selectedEntity, setSelectedEntity] = useState(ENTITY_OPTIONS[0]);
  const [selectedPerformedBy, setSelectedPerformedBy] = useState({ label: t("activityLogs.allUsers"), value: "" });
  const [selectedTargetUser, setSelectedTargetUser] = useState({ label: t("activityLogs.allUsers"), value: "" });
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useGetActivityLogsQuery({
    action: selectedAction.value || undefined,
    entity: selectedEntity.value || undefined,
    performedByUserId: selectedPerformedBy.value || undefined,
    targetUserId: selectedTargetUser.value || undefined,
    limit,
    offset,
  });

  const getActionBadge = (action) => {
    const colors = {
      CREATE: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      PERMISSION_ASSIGN: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      PERMISSION_REVOKE: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      STATUS_CHANGE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      PASSWORD_CHANGE: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[action] || "bg-gray-100 text-gray-800"}`}>
        {action.replace(/_/g, " ")}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const headers = useMemo(
    () => [
      { header: t("activityLogs.date"), field: "date" },
      { header: t("activityLogs.action"), field: "action" },
      { header: t("activityLogs.entity"), field: "entity" },
      { header: t("activityLogs.description"), field: "description" },
      { header: t("activityLogs.performedBy"), field: "performedBy" },
      { header: t("activityLogs.targetUser"), field: "targetUser" },
    ],
    [t]
  );

  const tableData = (data?.logs || []).map((log) => ({
    date: formatDate(log.createdAt),
    action: getActionBadge(log.action),
    entity: log.entity.replace(/_/g, " "),
    description: (
      <span className="px-2 py-1 rounded bg-amber-100/80 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 font-medium text-sm">
        {log.description || "-"}
      </span>
    ),
    performedBy: log.performedBy?.name || log.performedBy?.email || "-",
    targetUser: log.targetUser ? (log.targetUser.name || log.targetUser.email || "-") : "-",
  }));

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium">{t("activityLogs.title")}</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("activityLogs.description")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("activityLogs.filterByAction")}
          </label>
          <Dropdown
            name="action"
            options={ACTION_OPTIONS}
            setSelectedOption={(opt) => {
              setSelectedAction(opt);
              setOffset(0);
            }}
          >
            {selectedAction?.label}
          </Dropdown>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("activityLogs.filterByEntity")}
          </label>
          <Dropdown
            name="entity"
            options={ENTITY_OPTIONS}
            setSelectedOption={(opt) => {
              setSelectedEntity(opt);
              setOffset(0);
            }}
          >
            {selectedEntity?.label}
          </Dropdown>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("activityLogs.filterByPerformedBy")}
          </label>
          <Dropdown
            name="performedBy"
            options={PERFORMED_BY_OPTIONS}
            setSelectedOption={(opt) => {
              setSelectedPerformedBy(opt);
              setOffset(0);
            }}
          >
            {selectedPerformedBy?.label}
          </Dropdown>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            {t("activityLogs.filterByTargetUser")}
          </label>
          <Dropdown
            name="targetUser"
            options={TARGET_USER_OPTIONS}
            setSelectedOption={(opt) => {
              setSelectedTargetUser(opt);
              setOffset(0);
            }}
          >
            {selectedTargetUser?.label}
          </Dropdown>
        </div>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={data?.total || 0}
        isLoading={isLoading}
        py="py-2"
      />

      {data && data.total > limit && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-black/60 dark:text-white/60">
            {t("activityLogs.showing", { from: offset + 1, to: Math.min(offset + limit, data.total), total: data.total })}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              {t("activityLogs.previous")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= data.total}
            >
              {t("activityLogs.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
