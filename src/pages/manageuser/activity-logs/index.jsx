import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  LayoutGrid,
  History,
  Download,
  Calendar,
  User,
  Settings,
  Shield,
  Tag,
  ShoppingBag,
  Users,
} from "lucide-react";
import {
  useGetActivityLogsQuery,
  useGetSystemusersQuery,
} from "@/features/systemuser/systemuserApiSlice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";

const ActivityLogsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // API Queries
  const { data: systemUsersData } = useGetSystemusersQuery();
  const systemUsers = Array.isArray(systemUsersData)
    ? systemUsersData
    : systemUsersData?.data || [];

  // Options
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
    [t],
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
    [t],
  );

  const PERFORMED_BY_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers],
  );

  const TARGET_USER_OPTIONS = useMemo(
    () => [
      { label: t("activityLogs.allUsers"), value: "" },
      ...systemUsers.map((u) => ({
        label: `${u.name || u.email || "User"} (${u.email || u.id})`,
        value: String(u.id),
      })),
    ],
    [t, systemUsers],
  );

  // State
  const [selectedAction, setSelectedAction] = useState(ACTION_OPTIONS[0]);
  const [selectedEntity, setSelectedEntity] = useState(ENTITY_OPTIONS[0]);
  const [selectedPerformedBy, setSelectedPerformedBy] = useState({
    label: t("activityLogs.allUsers"),
    value: "",
  });
  const [selectedTargetUser, setSelectedTargetUser] = useState({
    label: t("activityLogs.allUsers"),
    value: "",
  });
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  // Table State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data Fetching
  const { data, isLoading } = useGetActivityLogsQuery({
    action: selectedAction.value || undefined,
    entity: selectedEntity.value || undefined,
    performedByUserId: selectedPerformedBy.value || undefined,
    targetUserId: selectedTargetUser.value || undefined,
    limit,
    offset,
  });

  // Helpers
  const getActionBadge = (action) => {
    const colors = {
      CREATE:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      UPDATE:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      DELETE:
        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
      PERMISSION_ASSIGN:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      PERMISSION_REVOKE:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      STATUS_CHANGE:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      PASSWORD_CHANGE:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      BARCODE_SCAN:
        "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${colors[action] || "bg-gray-100 text-gray-800 border-gray-200"}`}
      >
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

  // Process Data (Search & Map)
  const processedData = useMemo(() => {
    let logs = data?.logs || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      logs = logs.filter(
        (log) =>
          log.action?.toLowerCase().includes(lower) ||
          log.entity?.toLowerCase().includes(lower) ||
          log.description?.toLowerCase().includes(lower) ||
          log.performedBy?.name?.toLowerCase().includes(lower) ||
          log.performedBy?.email?.toLowerCase().includes(lower),
      );
    }

    return logs.map((log) => ({
      id: log.id,
      date: formatDate(log.createdAt),
      actionBadge: getActionBadge(log.action),
      action: log.action,
      entity: log.entity.replace(/_/g, " "),
      description: log.description || "-",
      performedBy: log.performedBy?.name || log.performedBy?.email || "-",
      targetUser: log.targetUser
        ? log.targetUser.name || log.targetUser.email || "-"
        : "-",
      raw: log,
    }));
  }, [data, searchTerm]);

  // Pagination (Client-side for the current chunk)
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* --- Header --- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/manage-users")}
            className="rounded-xl hover:bg-white dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("activityLogs.title")}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4" /> Security
              </span>
              <span>•</span>
              <span>{t("activityLogs.description")}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- Toolbar --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col xl:flex-row items-center justify-between gap-4 shadow-sm"
      >
        {/* Search */}
        <div className="relative w-full xl:max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Action Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
              >
                <span className="truncate mr-2">{selectedAction.label}</span>
                <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
            >
              <DropdownMenuLabel>
                {t("activityLogs.filterByAction")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ACTION_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => {
                    setSelectedAction(opt);
                    setOffset(0);
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Entity Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
              >
                <span className="truncate mr-2">{selectedEntity.label}</span>
                <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 dark:border-slate-800"
            >
              <DropdownMenuLabel>
                {t("activityLogs.filterByEntity")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ENTITY_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => {
                    setSelectedEntity(opt);
                    setOffset(0);
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Performed By Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
              >
                <span className="truncate mr-2">
                  {selectedPerformedBy.label}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
            >
              <DropdownMenuLabel>
                {t("activityLogs.filterByPerformedBy")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PERFORMED_BY_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => {
                    setSelectedPerformedBy(opt);
                    setOffset(0);
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Target User Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none justify-between border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl min-w-[160px]"
              >
                <span className="truncate mr-2">
                  {selectedTargetUser.label}
                </span>
                <ChevronDown className="w-4 h-4 opacity-50 flex-shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 dark:border-slate-800 max-h-[300px] overflow-y-auto"
            >
              <DropdownMenuLabel>
                {t("activityLogs.filterByTargetUser")}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TARGET_USER_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => {
                    setSelectedTargetUser(opt);
                    setOffset(0);
                  }}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* --- Table --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-800">
                <TableHead className="h-14 pl-6 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.date")}
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.action")}
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.entity")}
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.description")}
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.performedBy")}
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("activityLogs.targetUser")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-slate-100 dark:border-slate-800/50"
                  >
                    <TableCell
                      colSpan={6}
                      className="h-20 animate-pulse bg-slate-50/50 dark:bg-slate-800/20"
                    />
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <History className="w-8 h-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No logs found
                      </h3>
                      <p className="text-sm">
                        Try adjusting your filters or search terms
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((log, index) => (
                  <TableRow
                    key={log.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800/50"
                  >
                    <TableCell className="pl-6 font-medium text-slate-900 dark:text-white text-sm">
                      {log.date}
                    </TableCell>
                    <TableCell>{log.actionBadge}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                        {log.entity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-sm text-slate-600 dark:text-slate-300 max-w-xs block truncate"
                        title={log.description}
                      >
                        {log.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {log.performedBy.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {log.performedBy}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {log.targetUser}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Client-Side Pagination (for the current chunk) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <TablePaginate
            total={processedData.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </motion.div>

      {/* Server-Side Pagination (Load More) */}
      {data && data.total > limit && (
        <div className="flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t("activityLogs.showing", {
              from: offset + 1,
              to: Math.min(offset + limit, data.total),
              total: data.total,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="bg-white dark:bg-slate-900"
            >
              {t("activityLogs.previous")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= data.total}
              className="bg-white dark:bg-slate-900"
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
