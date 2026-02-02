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
} from "date-fns";
import {
  Plus,
  Download,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  RotateCcw,
  LayoutGrid,
  ListFilter,
  Package,
  AlertCircle,
  TrendingUp,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  useGetProductsQuery,
  useGetDraftProductsQuery,
  useGetTrashedProductsQuery,
  useDeleteProductMutation,
  useToggleProductActiveMutation,
  useRecoverProductMutation,
  usePublishDraftMutation,
  usePermanentDeleteProductMutation,
} from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";

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
import { exportProductsToPDF } from "@/utils/pdfExport";

const ProductsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [activeTab, setActiveTab] = useState("published"); // 'published', 'drafts', 'trash'
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [period, setPeriod] = useState("weekly");

  // API Queries
  const { data: publishedProducts = [], isLoading: isLoadingPublished } =
    useGetProductsQuery({ companyId: authUser?.companyId });
  const { data: draftProducts = [], isLoading: isLoadingDrafts } =
    useGetDraftProductsQuery({ companyId: authUser?.companyId });
  const { data: trashedProducts = [], isLoading: isLoadingTrash } =
    useGetTrashedProductsQuery({ companyId: authUser?.companyId });
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: authUser?.companyId,
  });

  // Mutations
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleActive, { isLoading: isToggling }] =
    useToggleProductActiveMutation();
  const [recoverProduct, { isLoading: isRecovering }] =
    useRecoverProductMutation();
  const [publishDraft, { isLoading: isPublishing }] = usePublishDraftMutation();
  const [permanentDeleteProduct, { isLoading: isPermanentlyDeleting }] =
    usePermanentDeleteProductMutation();

  // Modals Data
  const [modalState, setModalState] = useState({ type: null, product: null });
  const closeModal = () => setModalState({ type: null, product: null });

  // Data Aggregation
  const currentData = useMemo(() => {
    switch (activeTab) {
      case "drafts":
        return draftProducts;
      case "trash":
        return trashedProducts;
      default:
        return publishedProducts;
    }
  }, [activeTab, publishedProducts, draftProducts, trashedProducts]);

  const isLoading =
    activeTab === "drafts"
      ? isLoadingDrafts
      : activeTab === "trash"
        ? isLoadingTrash
        : isLoadingPublished;

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

    // 1. Total Products (Growth based on createdAt)
    const totalProducts = publishedProducts.length;
    const createdThisMonth = publishedProducts.filter(
      (p) => p.createdAt && new Date(p.createdAt) >= currentMonthStart,
    ).length;
    const createdLastMonth = publishedProducts.filter(
      (p) =>
        p.createdAt &&
        isWithinInterval(new Date(p.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const productTrend = calculateTrend(createdThisMonth, createdLastMonth);

    // 2. Total Inventory Value (Value of new products added)
    const totalValue = publishedProducts.reduce(
      (sum, p) => sum + (p.price || 0) * (p.stock || 0),
      0,
    );
    const valueAddedThisMonth = publishedProducts
      .filter((p) => p.createdAt && new Date(p.createdAt) >= currentMonthStart)
      .reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    const valueAddedLastMonth = publishedProducts
      .filter(
        (p) =>
          p.createdAt &&
          isWithinInterval(new Date(p.createdAt), {
            start: lastMonthStart,
            end: lastMonthEnd,
          }),
      )
      .reduce((sum, p) => sum + (p.price || 0) * (p.stock || 0), 0);
    const valueTrend = calculateTrend(valueAddedThisMonth, valueAddedLastMonth);

    // 3. Low Stock (Based on products updated recently to low stock)
    const lowStockProducts = publishedProducts.filter(
      (p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0,
    );
    const lowStock = lowStockProducts.length;
    const lowStockUpdatedThisMonth = lowStockProducts.filter(
      (p) => p.updatedAt && new Date(p.updatedAt) >= currentMonthStart,
    ).length;
    const lowStockUpdatedLastMonth = lowStockProducts.filter(
      (p) =>
        p.updatedAt &&
        isWithinInterval(new Date(p.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const lowStockTrend = calculateTrend(
      lowStockUpdatedThisMonth,
      lowStockUpdatedLastMonth,
    );

    // 4. Out of Stock (Based on products updated recently to out of stock)
    const outOfStockProducts = publishedProducts.filter(
      (p) => (p.stock || 0) === 0,
    );
    const outOfStock = outOfStockProducts.length;
    const outOfStockUpdatedThisMonth = outOfStockProducts.filter(
      (p) => p.updatedAt && new Date(p.updatedAt) >= currentMonthStart,
    ).length;
    const outOfStockUpdatedLastMonth = outOfStockProducts.filter(
      (p) =>
        p.updatedAt &&
        isWithinInterval(new Date(p.updatedAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    ).length;
    const outOfStockTrend = calculateTrend(
      outOfStockUpdatedThisMonth,
      outOfStockUpdatedLastMonth,
    );

    return [
      {
        label: "Total Products",
        value: totalProducts,
        trend: `${productTrend > 0 ? "+" : ""}${productTrend.toFixed(1)}%`,
        trendDir: productTrend >= 0 ? "up" : "down",
        trendColor: productTrend >= 0 ? "green" : "red",
        icon: Package,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        wave: "text-indigo-500",
      },
      {
        label: "Total Inventory Value",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(totalValue),
        trend: `${valueTrend > 0 ? "+" : ""}${valueTrend.toFixed(1)}%`,
        trendDir: valueTrend >= 0 ? "up" : "down",
        trendColor: valueTrend >= 0 ? "green" : "red",
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: "Low Stock Items",
        value: lowStock,
        trend: `${lowStockTrend > 0 ? "+" : ""}${lowStockTrend.toFixed(1)}%`,
        trendDir: lowStockTrend >= 0 ? "up" : "down",
        trendColor: lowStockTrend > 0 ? "red" : "green", // Increasing low stock is bad (red)
        icon: AlertCircle,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: "Out of Stock",
        value: outOfStock,
        trend: `${outOfStockTrend > 0 ? "+" : ""}${outOfStockTrend.toFixed(1)}%`,
        trendDir: outOfStockTrend >= 0 ? "up" : "down",
        trendColor: outOfStockTrend > 0 ? "red" : "green", // Increasing out of stock is bad (red)
        icon: Archive,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        wave: "text-red-500",
      },
    ];
  }, [publishedProducts]);

  // Filtering & Sorting
  const processedData = useMemo(() => {
    let data = [...currentData];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.sku?.toLowerCase().includes(lower) ||
          p.category?.name?.toLowerCase().includes(lower),
      );
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [currentData, searchTerm, sortConfig]);

  // Handlers
  const handleToggleStatus = async (product) => {
    try {
      await toggleActive({
        id: product.id,
        active: !product.isActive,
      }).unwrap();
      toast.success(
        product.isActive
          ? t("products.productDeactivated")
          : t("products.productActivated"),
      );
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  const handleAction = async (action, product) => {
    try {
      if (action === "delete") {
        await deleteProduct(product.id).unwrap();
        toast.success(t("products.productMovedToTrash"));
      } else if (action === "recover") {
        await recoverProduct(product.id).unwrap();
        toast.success(t("products.productRecovered"));
      } else if (action === "permanentDelete") {
        await permanentDeleteProduct(product.id).unwrap();
        toast.success(t("products.productPermanentlyDeleted"));
      } else if (action === "publish") {
        await publishDraft(product.id).unwrap();
        toast.success(t("products.productPublished"));
      }
      closeModal();
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  const renderPrice = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  // Columns Configuration for ReusableTable
  const columns = [
    {
      header: "Code",
      field: "sku",
      render: (row) => (
        <span className="font-medium text-gray-600 dark:text-gray-300">
          {row.sku || "—"}
        </span>
      ),
    },
    {
      header: "Product",
      field: "name",
      render: (row) => {
        const cleanThumbnail = row.thumbnail?.replace(/`/g, "").trim();
        const imageUrl =
          cleanThumbnail || row.images?.[0]?.url || row.images?.[0];
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={row.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-gray-400">IMG</span>
              )}
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {row.name}
            </span>
          </div>
        );
      },
    },
    {
      header: "Category",
      field: "category",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.category?.name || "—"}
        </span>
      ),
    },
    {
      header: "Unit",
      field: "unit",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.unit || "Piece"}
        </span>
      ),
    },
    {
      header: "Quantity",
      field: "stock",
      render: (row) => (
        <span
          className={`font-semibold ${
            (row.stock || 0) <= 5
              ? "text-red-600"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {row.stock || 0}
        </span>
      ),
    },
    {
      header: "Selling Price",
      field: "price",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {renderPrice(row.price)}
        </span>
      ),
    },
    {
      header: "Purchase Price",
      field: "costPrice",
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.costPrice ? renderPrice(row.costPrice) : "—"}
        </span>
      ),
    },
    ...(activeTab === "published"
      ? [
          {
            header: "Status",
            field: "isActive",
            render: (row) => (
              <div className="flex justify-center">
                <Switch
                  checked={row.isActive}
                  onCheckedChange={() => handleToggleStatus(row)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            ),
          },
        ]
      : []),
    {
      header: "Actions",
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
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/products/${row.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/products/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {activeTab === "trash" ? (
              <>
                <DropdownMenuItem
                  onClick={() =>
                    setModalState({ type: "recover", product: row })
                  }
                >
                  <RotateCcw className="mr-2 h-4 w-4 text-green-600" /> Recover
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    setModalState({ type: "permanentDelete", product: row })
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete
                  Permanently
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => setModalState({ type: "delete", product: row })}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Product{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Inventory
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            Manage your product catalog, track inventory levels, and organize
            your stock efficiently.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => exportProductsToPDF(processedData, "Products")}
            className="h-14 px-6 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            {t("Export")}
          </Button>
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/products/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">{t("products.addProduct")}</span>
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
            {["published", "drafts", "trash"].map((tab) => (
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

          {/* Search & Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-gray-50 dark:bg-black/20 border-gray-200 dark:border-gray-800 focus:ring-indigo-500"
              />
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Reusable Table */}
        <ReusableTable
          columns={columns}
          data={processedData}
          isLoading={isLoading}
          totalItems={processedData.length}
          itemsPerPage={pageSize}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          searchPlaceholder="Search products..."
        />
      </div>

      {/* --- Modals --- */}
      {modalState.type === "delete" && (
        <DeleteModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => handleAction("delete", modalState.product)}
          title={t("products.moveToTrash")}
          description={t("products.moveToTrashDesc")}
          itemName={modalState.product?.name}
          isLoading={isDeleting}
        />
      )}
      {modalState.type === "recover" && (
        <ConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => handleAction("recover", modalState.product)}
          title={t("products.recoverProduct")}
          description={t("products.recoverProductDesc")}
          itemName={modalState.product?.name}
          isLoading={isRecovering}
          type="success"
          confirmText="Recover"
        />
      )}
      {modalState.type === "permanentDelete" && (
        <ConfirmModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => handleAction("permanentDelete", modalState.product)}
          title="Permanent Delete"
          description="This action cannot be undone."
          itemName={modalState.product?.name}
          isLoading={isPermanentlyDeleting}
          type="danger"
          confirmText="Delete Permanently"
        />
      )}
    </div>
  );
};

export default ProductsPage;
