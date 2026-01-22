import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGetActivityLogsQuery } from "@/features/systemuser/systemuserApiSlice";
import ReusableTable from "@/components/table/reusable-table";
import Dropdown from "@/components/dropdown/dropdown";

const ACTION_OPTIONS = [
  { label: "All Actions", value: "" },
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Permission Assign", value: "PERMISSION_ASSIGN" },
  { label: "Permission Revoke", value: "PERMISSION_REVOKE" },
  { label: "Status Change", value: "STATUS_CHANGE" },
  { label: "Password Change", value: "PASSWORD_CHANGE" },
];

const ENTITY_OPTIONS = [
  { label: "All Entities", value: "" },
  { label: "System User", value: "SYSTEM_USER" },
  { label: "Product", value: "PRODUCT" },
  { label: "Order", value: "ORDER" },
  { label: "Category", value: "CATEGORY" },
  { label: "Customer", value: "CUSTOMER" },
];

const ActivityLogsPage = () => {
  const navigate = useNavigate();
  const [selectedAction, setSelectedAction] = useState(ACTION_OPTIONS[0]);
  const [selectedEntity, setSelectedEntity] = useState(ENTITY_OPTIONS[0]);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data, isLoading } = useGetActivityLogsQuery({
    action: selectedAction.value || undefined,
    entity: selectedEntity.value || undefined,
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

  const headers = [
    { header: "Date", field: "date" },
    { header: "Action", field: "action" },
    { header: "Entity", field: "entity" },
    { header: "Description", field: "description" },
    { header: "Performed By", field: "performedBy" },
    { header: "Target User", field: "targetUser" },
  ];

  const tableData = (data?.logs || []).map((log) => ({
    date: formatDate(log.createdAt),
    action: getActionBadge(log.action),
    entity: log.entity.replace(/_/g, " "),
    description: log.description || "-",
    performedBy: log.performedBy?.name || log.performedBy?.email || "-",
    targetUser: log.targetUser ? (log.targetUser.name || log.targetUser.email || "-") : "-",
  }));

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
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
          <h3 className="text-lg font-medium">Activity Logs</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Track all employee actions and activities
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
            Filter by Action
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
            Filter by Entity
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
            Showing {offset + 1} - {Math.min(offset + limit, data.total)} of {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= data.total}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogsPage;
