import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
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
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";
import StockAdjustmentModal from "./components/StockAdjustmentModal";
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

  return (
    <div className="min-h-screen bg-[#f7f8f9] dark:bg-[#0b0f14] p-4 lg:p-8 space-y-6">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span>Manage your stock inventory</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => exportProductsToPDF(processedData, "Inventory")}
            className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
            onClick={() => navigate("/products/create")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Inventory
          </Button>
        </div>
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ListFilter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              >
                Sort by: Latest
                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  setSortConfig({ key: "createdAt", direction: "desc" })
                }
              >
                Latest
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
            className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Column
          </Button>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/5">
              <TableRow>
                <TableHead className="w-[40px] pl-4">
                  <Checkbox />
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Product/Service
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Code
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Unit
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Quantity
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Selling Price
                </TableHead>
                <TableHead className="font-semibold text-gray-900 dark:text-white">
                  Purchase Price
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-900 dark:text-white pr-4">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell
                      colSpan={8}
                      className="h-16 animate-pulse bg-gray-50/50 dark:bg-white/5"
                    />
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-gray-500"
                  >
                    No inventory found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((product) => (
                  <TableRow
                    key={product.id}
                    className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="pl-4">
                      <Checkbox />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">
                              IMG
                            </span>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-600 dark:text-gray-300">
                      {product.sku || "—"}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {product.unit || "Piece"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-semibold ${
                          (product.stock || 0) <= 5
                            ? "text-red-600"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {product.stock || 0}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {renderPrice(product.price)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {renderPrice(product.costPrice || product.price * 0.8)}
                    </TableCell>

                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-purple-600 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold"
                          onClick={() =>
                            navigate(
                              `/manage-users/activity-logs?entityId=${product.id}`,
                            )
                          }
                        >
                          <History className="w-3 h-3 mr-1" /> History
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-xs font-semibold"
                          onClick={() =>
                            setStockModal({ isOpen: true, product, type: "in" })
                          }
                        >
                          <ArrowDownCircle className="w-3 h-3 mr-1" /> Stock In
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-xs font-semibold"
                          onClick={() =>
                            setStockModal({
                              isOpen: true,
                              product,
                              type: "out",
                            })
                          }
                        >
                          <ArrowUpCircle className="w-3 h-3 mr-1" /> Stock Out
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <TablePaginate
            total={processedData.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      </div>

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
    </div>
  );
};

export default InventoryPage;
