import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FolderOpen,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TablePaginate from "./pagination";

/**
 * ReusableTable Component
 * Modern, client-side sortable, filterable and paginated table
 *
 * @param {Array} data - Array of row objects
 * @param {Array} headers - [{ header: string, field: string, sortable?: boolean }]
 * @param {boolean} isLoading - Show skeleton loading state
 * @param {boolean} searchable - Show search input (default: true)
 * @param {string} searchPlaceholder - Custom placeholder
 * @param {string[]} searchFields - Limit search to specific fields (optional)
 * @param {(item) => string} getRowClassName - Optional row class generator
 * @param {string} py - Optional custom padding-y class for cells (e.g. "py-5")
 */
export default function ReusableTable({
  data = [],
  headers = [],
  isLoading = false,
  searchable = true,
  searchPlaceholder,
  searchFields = null,
  getRowClassName = null,
  py, // optional custom py class
  total, // currently unused – maybe for server pagination later?
}) {
  const { t } = useTranslation();
  const placeholder =
    searchPlaceholder ?? t("table.searchPlaceholder") ?? "Search...";

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting handler
  const onHeaderClick = (field) => {
    if (!field) return;
    if (sortKey === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  // Filtered data (search)
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase().trim();
    const fields = searchFields || headers.map((h) => h.field).filter(Boolean);

    return data.filter((item) =>
      fields.some((field) => {
        const value = item[field];
        if (value == null) return false;
        // Skip complex objects / components
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          return false;
        }
        return String(value).toLowerCase().includes(searchLower);
      }),
    );
  }, [data, searchTerm, searchFields, headers]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    const copy = [...filteredData];

    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === "asc" ? -1 : 1;
      if (bv == null) return sortDir === "asc" ? 1 : -1;

      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }

      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      return sortDir === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return copy;
  }, [filteredData, sortKey, sortDir]);

  // Paginated slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when data or search changes significantly
  useEffect(() => {
    const maxPage = Math.ceil(sortedData.length / pageSize) || 1;
    if (currentPage > maxPage) {
      setCurrentPage(1);
    }
  }, [sortedData.length, pageSize, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const showPagination = !isLoading && sortedData.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/60 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/40 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table wrapper */}
      <div className="rounded-2xl border border-white/40 dark:border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl overflow-hidden relative">
        {/* Glass overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/5 hover:bg-gray-50/60 dark:hover:bg-white/10 border-b border-gray-200/60 dark:border-white/10">
                {headers.map((cell, idx) => {
                  const isLast = idx === headers.length - 1;
                  const isActive = sortKey === cell.field;
                  const sortable = cell.sortable !== false;

                  const SortIcon = !sortable
                    ? null
                    : isActive
                      ? sortDir === "asc"
                        ? ArrowUp
                        : ArrowDown
                      : ArrowUpDown;

                  return (
                    <TableHead
                      key={cell.field || idx}
                      onClick={() => sortable && onHeaderClick(cell.field)}
                      className={`h-12 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 select-none ${
                        sortable
                          ? "cursor-pointer hover:text-gray-900 dark:hover:text-white"
                          : ""
                      } ${isLast ? "text-center" : "text-left"}`}
                    >
                      <div className="inline-flex items-center gap-1.5">
                        {cell.header}
                        {SortIcon && (
                          <SortIcon
                            size={14}
                            className={isActive ? "opacity-100 text-primary" : "opacity-40"}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow
                    key={i}
                    className="border-b border-gray-100/50 dark:border-white/5"
                  >
                    {headers.map((_, j) => (
                      <TableCell key={j} className="py-4">
                        <div className="h-5 w-full max-w-[180px] bg-gray-200/50 dark:bg-white/5 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={headers.length}
                    className="h-40 text-center text-gray-500 dark:text-gray-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FolderOpen className="w-8 h-8 opacity-20" />
                      <p>
                        {searchTerm
                          ? (t("table.noResults") ?? "No results found")
                          : (t("table.empty") ?? "No data available")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, rowIdx) => {
                  const rowClass = getRowClassName?.(item) ?? "";
                  return (
                    <TableRow
                      key={rowIdx}
                      className={`border-b border-gray-100/50 dark:border-white/5 transition-colors text-gray-700 dark:text-gray-200 ${rowClass} hover:bg-white/40 dark:hover:bg-white/5`}
                    >
                      {headers.map((header, colIdx) => {
                        const isLast = colIdx === headers.length - 1;
                        return (
                          <TableCell
                            key={colIdx}
                            className={`${py || "py-4"} px-4 text-sm font-medium ${
                              isLast ? "text-center" : "text-left"
                            }`}
                          >
                            {item[header.field] ?? "—"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="pt-3">
          <TablePaginate
            total={sortedData.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
