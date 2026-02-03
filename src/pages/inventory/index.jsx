import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Search,
  Plus,
  History,
  ArrowDownCircle,
  ArrowUpCircle,
  MoreHorizontal,
  ListFilter,
  ChevronDown,
  LayoutGrid,
  Package,
  AlertTriangle,
  XCircle,
  DollarSign,
  TrendingUp,
  Box,
} from "lucide-react";

import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";
import StockAdjustmentModal from "./components/StockAdjustmentModal";
import ProductHistoryModal from "./components/ProductHistoryModal";
import { exportProductsToPDF } from "@/utils/pdfExport";

const InventoryPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [stockModal, setStockModal] = useState({
    isOpen: false,
    product: null,
    type: "in",
  });
  const [historyModal, setHistoryModal] = useState({
    isOpen: false,
    product: null,
  });

  // API Queries
  const { data: products = [], isLoading } = useGetProductsQuery({
    companyId: authUser?.companyId,
  });

  // Filtering & Sorting
  const processedData = useMemo(() => {
    let data = [...products];

    // Search
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.sku?.toLowerCase().includes(lower),
      );
    }

    // Sort
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] ?? "";
        const bVal = b[sortConfig.key] ?? "";

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [products, searchTerm, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Render Helpers
  const renderPrice = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  // Stats Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const totalItems = products.length;

    // Calculate new products added this month for trend
    const newProductsThisMonth = products.filter((p) => {
      if (!p.createdAt) return false;
      const date = new Date(p.createdAt);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    }).length;

    // Approximate "previous month total" by subtracting new additions
    // Note: This doesn't account for deletions, but gives a dynamic "growth" metric
    const prevTotal = totalItems - newProductsThisMonth;
    const productGrowth =
      prevTotal > 0
        ? ((newProductsThisMonth / prevTotal) * 100).toFixed(1)
        : "0.0";

    const lowStock = products.filter(
      (p) => (p.stock || 0) <= 5 && (p.stock || 0) > 0,
    ).length;
    const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;
    const totalValue = products.reduce(
      (acc, p) => acc + (p.stock || 0) * (p.price || 0),
      0,
    );

    return [
      {
        title: "Total Products",
        value: totalItems,
        icon: Package,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        trend: `${productGrowth}%`,
        trendUp: parseFloat(productGrowth) >= 0,
        waveColor: "#6366f1", // Indigo
      },
      {
        title: "Total Inventory Value",
        value: renderPrice(totalValue),
        icon: TrendingUp,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        trend: "+12.5%", // Mocked (requires transaction history)
        trendUp: true,
        waveColor: "#10b981", // Emerald
      },
      {
        title: "Low Stock Items",
        value: lowStock,
        icon: AlertTriangle,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        trend: lowStock > 0 ? "+2.4%" : "0.0%", // Mocked
        trendUp: true,
        waveColor: "#f59e0b", // Amber
      },
      {
        title: "Out of Stock",
        value: outOfStock,
        icon: XCircle,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        trend: outOfStock > 0 ? "+4.1%" : "0.0%", // Mocked
        trendUp: false,
        waveColor: "#ef4444", // Red
      },
    ];
  }, [products]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 lg:p-8 space-y-8 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent -z-10" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* --- Header --- */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory Management
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <Box className="w-4 h-4" /> Overview
            </span>
            <span>•</span>
            <span>Manage your stock levels and valuations</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/inventory/history")}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <History className="w-4 h-4 mr-2" />
            History Log
          </Button>
          <Button
            variant="outline"
            onClick={() => exportProductsToPDF(processedData, "Inventory")}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
            onClick={() => navigate("/products/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </motion.div>

      {/* --- Stats Cards --- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className="relative bg-white dark:bg-slate-900 rounded-[24px] p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.title}
                </span>
              </div>

              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                {stat.value}
              </h3>

              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp !== false ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" : "text-red-600 bg-red-50 dark:bg-red-900/20"} px-2 py-1 rounded-full`}
                >
                  {stat.trendUp !== false ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3 rotate-180" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </div>

            {/* Wave Decoration */}
            <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150">
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                width="140"
                height="140"
              >
                <path
                  fill={stat.waveColor}
                  d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,31.7C59,41.9,47.1,49.5,35.2,55.9C23.3,62.3,11.4,67.6,-1.3,69.8C-14,72,-28.3,71.2,-41.2,65.1C-54.1,59,-65.6,47.7,-73.8,34.4C-82,21.1,-86.9,5.8,-84.6,-8.7C-82.3,-23.2,-72.8,-36.9,-61.4,-47.2C-50,-57.5,-36.7,-64.4,-23.4,-72.2C-10.1,-80,3.2,-88.7,17.2,-91.7C31.2,-94.7,46,-92,44.7,-76.4Z"
                  transform="translate(100 100)"
                />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* --- Toolbar --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        {/* Search */}
        <div className="relative w-full sm:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search products, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            <ListFilter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Sort by: Latest
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-slate-200 dark:border-slate-800"
            >
              <DropdownMenuItem
                onClick={() =>
                  setSortConfig({ key: "createdAt", direction: "desc" })
                }
              >
                Latest Added
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setSortConfig({ key: "stock", direction: "asc" })
                }
              >
                Stock: Low to High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  setSortConfig({ key: "stock", direction: "desc" })
                }
              >
                Stock: High to Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Columns
          </Button>
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
                <TableHead className="w-[50px] pl-6">
                  <Checkbox className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Product Details
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  SKU / Code
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stock Level
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pricing
                </TableHead>
                <TableHead className="h-14 font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right pr-6">
                  Actions
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
                        <Package className="w-8 h-8 opacity-50" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        No products found
                      </h3>
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((product, index) => (
                  <TableRow
                    key={product.id}
                    className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors border-slate-100 dark:border-slate-800/50"
                  >
                    <TableCell className="pl-6">
                      <Checkbox className="rounded-md border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 py-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform duration-300">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {product.unit || "Piece"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-300">
                        {product.sku || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold ${
                              (product.stock || 0) === 0
                                ? "text-red-500"
                                : (product.stock || 0) <= 5
                                  ? "text-amber-500"
                                  : "text-emerald-600"
                            }`}
                          >
                            {product.stock || 0}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            in stock
                          </span>
                        </div>
                        {/* Progress Bar for Stock Visualization */}
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (product.stock || 0) === 0
                                ? "bg-red-500"
                                : (product.stock || 0) <= 5
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{
                              width: `${Math.min(product.stock || 0, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {renderPrice(product.price)}
                        </span>
                        <span className="text-xs text-slate-400">
                          Cost:{" "}
                          {renderPrice(
                            product.costPrice || product.price * 0.8,
                          )}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-slate-200 dark:border-slate-800"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/products/${product.id}/edit`)
                              }
                            >
                              <Package className="w-4 h-4 mr-2" /> Edit Details
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                            <DropdownMenuItem
                              onClick={() =>
                                setStockModal({
                                  isOpen: true,
                                  product,
                                  type: "in",
                                })
                              }
                              className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 dark:focus:bg-emerald-900/20"
                            >
                              <ArrowDownCircle className="w-4 h-4 mr-2" /> Stock In
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setStockModal({
                                  isOpen: true,
                                  product,
                                  type: "out",
                                })
                              }
                              className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/20"
                            >
                              <ArrowUpCircle className="w-4 h-4 mr-2" /> Stock Out
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />

                            <DropdownMenuItem
                              onClick={() => navigate("/manage-users/activity-logs")}
                            >
                              <History className="w-4 h-4 mr-2" /> History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
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

      {/* --- Stock Modal --- */}
      {stockModal.isOpen && (
        <StockAdjustmentModal
          isOpen={stockModal.isOpen}
          onClose={() =>
            setStockModal({ isOpen: false, product: null, type: "in" })
          }
          product={stockModal.product}
          type={stockModal.type}
        />
      )}

      {/* --- History Modal --- */}
      {historyModal.isOpen && (
        <ProductHistoryModal
          isOpen={historyModal.isOpen}
          onClose={() => setHistoryModal({ isOpen: false, product: null })}
          product={historyModal.product}
        />
      )}
    </div>
  );
};

export default InventoryPage;
