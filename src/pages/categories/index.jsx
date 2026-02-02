import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
  format,
} from "date-fns";
import {
  Plus,
  Download,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  CheckCircle,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Archive,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} from "@/features/category/categoryApiSlice";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ReusableTable from "@/components/table/reusable-table";

// Modals
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

const CategoriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'active', 'disabled'
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    category: null,
  });

  // API Queries
  const { data: categories = [], isLoading } = useGetCategoriesQuery({
    companyId: authUser?.companyId,
  });

  // Mutations
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] =
    useToggleCategoryActiveMutation();

  // Data Filtering
  const filteredData = useMemo(() => {
    let data = [...categories];

    // Filter by Tab
    if (activeTab === "active") {
      data = data.filter((c) => c.isActive);
    } else if (activeTab === "disabled") {
      data = data.filter((c) => !c.isActive);
    }

    // Filter by Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (c) =>
          c.name?.toLowerCase().includes(lower) ||
          c.slug?.toLowerCase().includes(lower) ||
          c.parent?.name?.toLowerCase().includes(lower),
      );
    }

    return data;
  }, [categories, activeTab, searchTerm]);

  // Stats Calculation
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // 1. Total Categories
    const totalCategories = categories.length;
    const createdThisMonth = categories.filter(
      (c) => c.createdAt && new Date(c.createdAt) >= currentMonthStart,
    ).length;
    const createdLastMonth = categories.filter(
      (c) =>
        c.createdAt &&
        isWithinInterval(new Date(c.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const totalTrend = calculateTrend(createdThisMonth, createdLastMonth);

    // 2. Active Categories
    const activeCategories = categories.filter((c) => c.isActive).length;
    const activeThisMonth = categories.filter(
      (c) =>
        c.isActive && c.updatedAt && new Date(c.updatedAt) >= currentMonthStart,
    ).length;
    const activeLastMonth = categories.filter(
      (c) =>
        c.isActive &&
        c.updatedAt &&
        isWithinInterval(new Date(c.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const activeTrend = calculateTrend(activeThisMonth, activeLastMonth);

    // 3. Disabled Categories
    const disabledCategories = categories.filter((c) => !c.isActive).length;
    const disabledTrend = 0; // Simplified for now

    // 4. Subcategories (Has Parent)
    const subCategories = categories.filter((c) => c.parent).length;
    const subTrend = 0; // Simplified

    return [
      {
        label: t("dashboard.totalCategories") || "Total Categories",
        value: totalCategories,
        trend: `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`,
        trendDir: totalTrend >= 0 ? "up" : "down",
        trendColor: totalTrend >= 0 ? "green" : "red",
        icon: FolderTree,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        label: t("dashboard.activeCategories") || "Active Categories",
        value: activeCategories,
        trend: `${activeTrend > 0 ? "+" : ""}${activeTrend.toFixed(1)}%`,
        trendDir: activeTrend >= 0 ? "up" : "down",
        trendColor: activeTrend >= 0 ? "green" : "red",
        icon: CheckCircle,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: "Disabled Categories",
        value: disabledCategories,
        trend: "0.0%",
        trendDir: "up",
        trendColor: "red",
        icon: Archive,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: "Subcategories",
        value: subCategories,
        trend: "0.0%",
        trendDir: "up",
        trendColor: "green",
        icon: TrendingUp,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      },
    ];
  }, [categories, t]);

  // Handlers
  const handleToggleStatus = async (category) => {
    try {
      await toggleActive({
        id: category.id,
        active: !category.isActive,
      }).unwrap();
      toast.success(
        category.isActive
          ? t("modal.categoryUpdated", { status: t("common.disabled") })
          : t("modal.categoryUpdated", { status: t("common.enabled") }),
      );
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  // Columns Configuration
  const headers = useMemo(
    () => [
      {
        header: t("common.name"),
        field: "name",
        render: (row) => {
          // Clean photo URL if it contains backticks or extra spaces
          const cleanPhoto = row.photo?.replace(/`/g, "").trim();

          return (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                {cleanPhoto ? (
                  <img
                    src={cleanPhoto}
                    alt={row.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-gray-400">IMG</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {row.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {row.slug}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        header: t("common.parent"),
        field: "parentName",
        render: (row) => (
          <span className="text-gray-600 dark:text-gray-400">
            {row.parent?.name || "—"}
          </span>
        ),
      },
      {
        header: t("common.date") || "Date",
        field: "createdAt",
        render: (row) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {row.createdAt
                ? format(new Date(row.createdAt), "MMM dd, yyyy")
                : "—"}
            </span>
            <span className="text-xs text-gray-500">
              {row.createdAt ? format(new Date(row.createdAt), "hh:mm a") : ""}
            </span>
          </div>
        ),
      },
      {
        header: t("common.status"),
        field: "status",
        render: (row) => (
          <div className="flex items-center">
            <Switch
              checked={row.isActive}
              onCheckedChange={() => handleToggleStatus(row)}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        ),
      },
      {
        header: t("common.actions"),
        field: "actions",
        render: (row) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/categories/${row.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" /> {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setToggleModal({ isOpen: true, category: row })}
              >
                {row.isActive ? (
                  <>
                    <Archive className="mr-2 h-4 w-4 text-orange-600" />{" "}
                    {t("common.disable")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />{" "}
                    {t("common.enable")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteModal({ isOpen: true, category: row })}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [t, navigate],
  );

  return (
    <div className="p-6 lg:p-0 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Category{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Management
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            Organize your products with categories and subcategories for better
            navigation.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/categories/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">
              {t("common.add")} {t("nav.categories")}
            </span>
          </Button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>

              <div className="flex items-center gap-2">
                <span
                  className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md
                  ${
                    (stat.trendColor ||
                      (stat.trendDir === "up" ? "green" : "red")) === "green"
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }
                `}
                >
                  {stat.trendDir === "up" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  vs last month
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div
              className={`absolute bottom-0 right-0 w-24 h-16 opacity-20 ${stat.wave}`}
            >
              <svg
                viewBox="0 0 100 60"
                fill="currentColor"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- Table Container --- */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        {/* Tabs & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {["all", "active", "disabled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder={t("common.search")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          data={filteredData}
          headers={headers}
          total={filteredData.length}
          isLoading={isLoading}
          py="py-4"
          searchable={false}
        />
      </div>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!deleteModal.category) return;
          const res = await deleteCategory(deleteModal.category.id);
          if (res?.data) {
            toast.success(t("modal.categoryDeleted"));
            setDeleteModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryDeleteFailed"));
          }
        }}
        title={t("modal.deleteCategory")}
        description={t("modal.deleteCategoryDesc")}
        itemName={deleteModal.category?.name}
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!toggleModal.category) return;
          const res = await toggleActive({ id: toggleModal.category.id });
          if (res?.data) {
            toast.success(
              t("modal.categoryUpdated", {
                status: toggleModal.category?.isActive
                  ? t("common.disabled")
                  : t("common.enabled"),
              }),
            );
            setToggleModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryUpdateFailed"));
          }
        }}
        title={
          toggleModal.category?.isActive
            ? t("modal.disableCategory")
            : t("modal.enableCategory")
        }
        description={
          toggleModal.category?.isActive
            ? t("modal.disableCategoryDesc")
            : t("modal.enableCategoryDesc")
        }
        itemName={`${
          toggleModal.category?.isActive
            ? t("common.disable")
            : t("common.enable")
        } "${toggleModal.category?.name}"?`}
        isLoading={isToggling}
        type={toggleModal.category?.isActive ? "warning" : "success"}
        confirmText={
          toggleModal.category?.isActive
            ? t("common.disable")
            : t("common.enable")
        }
      />
    </div>
  );
};

export default CategoriesPage;
