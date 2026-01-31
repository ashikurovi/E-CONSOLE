import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, ArrowUp, ArrowDown, ArrowUpDown, Search, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TablePaginate from "./pagination";

/**
 * ReusableTable Component
 * 
 * A flexible, modern table component with client-side sorting, filtering, and pagination.
 * Designed with a clean aesthetic (minimal borders, subtle hover states).
 * 
 * Props:
 * @param {Array} data - Array of objects to display
 * @param {Array} headers - Array of header objects { header: string, field: string, sortable?: boolean }
 * @param {boolean} isLoading - Loading state
 * @param {boolean} searchable - Enable search functionality
 * @param {string} searchPlaceholder - Custom placeholder text
 */
export default function ReusableTable({ 
  data, 
  headers, 
  py, 
  total, 
  isLoading,
  searchable = true,
  searchPlaceholder,
  searchFields = null, // If null, search all string fields
}) {
  const { t } = useTranslation();
  const placeholder = searchPlaceholder ?? t("table.searchPlaceholder");
  
  // State Management
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Handle Header Click (Sorting)
  const onHeaderClick = (field) => {
    if (!field) return;
    if (sortKey === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || !searchTerm.trim()) return data;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const fieldsToSearch = searchFields || headers?.map(h => h.field).filter(Boolean) || [];
    
    return data.filter((item) => {
      return fieldsToSearch.some((field) => {
        const value = item[field];
        if (value == null) return false;
        
        // Skip complex objects (like React components)
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return false;
        }
        
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(searchLower);
      });
    });
  }, [data, searchTerm, searchFields, headers]);

  // Sorting Logic
  const sortedData = useMemo(() => {
    if (!Array.isArray(filteredData) || !sortKey) return filteredData;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === "asc" ? -1 : 1;
      if (bv == null) return sortDir === "asc" ? 1 : -1;

      const bothNumbers = typeof av === "number" && typeof bv === "number";
      if (bothNumbers) return sortDir === "asc" ? av - bv : bv - av;

      const aStr = String(av).toLowerCase();
      const bStr = String(bv).toLowerCase();
      return sortDir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    return copy;
  }, [filteredData, sortKey, sortDir]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when data/search changes
  useEffect(() => {
    if (currentPage > Math.ceil(sortedData.length / pageSize) && sortedData.length > 0) {
      setCurrentPage(1);
    }
  }, [sortedData.length, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm bg-gray-50 dark:bg-[#1a1f26] border-transparent focus:bg-white dark:focus:bg-black rounded-xl outline-none ring-1 ring-transparent focus:ring-black/10 dark:focus:ring-white/10 transition-all duration-200 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={t("table.clearSearch")}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            {/* Header */}
            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/20">
              <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
                {headers?.map((cell, index) => {
                  const alignClass = index + 1 === headers?.length ? "text-center" : "text-left";
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
                      key={index}
                      onClick={() => sortable && onHeaderClick(cell.field)}
                      className={`${alignClass} h-12 text-xs font-semibold tracking-wide text-gray-500 uppercase select-none ${
                        sortable ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" : ""
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {cell.header}
                        {SortIcon && (
                          <SortIcon
                            size={14}
                            className={`${isActive ? "text-black dark:text-white opacity-100" : "opacity-40"}`}
                          />
                        )}
                      </span>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            {/* Body */}
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex} className="border-b border-gray-100 dark:border-gray-800">
                      {headers.map((_, colIndex) => (
                        <TableCell key={colIndex} className="py-4">
                          <div className="h-5 w-full max-w-[80%] rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : paginatedData?.map((item, rowIdx) => (
                    <TableRow
                      key={rowIdx}
                      className="group border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {headers.map((header, colIdx) => (
                        <TableCell
                          key={colIdx}
                          className={`${py ? py : "py-3.5"} text-sm text-gray-700 dark:text-gray-300 ${
                            colIdx + 1 === headers?.length ? "text-center" : "text-left"
                          }`}
                        >
                          {item[header.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {/* Empty State */}
        {!isLoading && sortedData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-800/50 mb-3">
              <FolderOpen className="h-6 w-6 opacity-50" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">{t("table.noDataEntry")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && sortedData.length > 0 && (
        <div className="pt-2">
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
