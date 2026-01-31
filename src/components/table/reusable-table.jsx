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

export default function ReusableTable({ 
  data, 
  headers, 
  py, 
  total, 
  isLoading,
  searchable = true,
  searchPlaceholder,
  searchFields = null, // If null, search all string fields
  getRowClassName = null, // Optional: (item) => string for row styling
}) {
  const { t } = useTranslation();
  const placeholder = searchPlaceholder ?? t("table.searchPlaceholder");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const onHeaderClick = (field) => {
    if (!field) return;
    if (sortKey === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || !searchTerm.trim()) return data;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const fieldsToSearch = searchFields || headers?.map(h => h.field).filter(Boolean) || [];
    
    return data.filter((item) => {
      return fieldsToSearch.some((field) => {
        const value = item[field];
        if (value == null) return false;
        
        // Handle React elements (like action buttons) - skip them
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return false;
        }
        
        const stringValue = String(value).toLowerCase();
        return stringValue.includes(searchLower);
      });
    });
  }, [data, searchTerm, searchFields, headers]);

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

  // Paginate the sorted data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Reset to page 1 when data changes
  useEffect(() => {
    if (currentPage > Math.ceil(sortedData.length / pageSize) && sortedData.length > 0) {
      setCurrentPage(1);
    }
  }, [sortedData.length, currentPage, pageSize]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <>
      {searchable && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/50 dark:text-white/50" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 rounded-md outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:border-transparent text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                aria-label={t("table.clearSearch")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
      <div className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] shadow-sm overflow-hidden">
        <Table className="mt-0">
          <TableHeader className="sticky top-0 z-10 bg-black">
            <TableRow className="border-b border-white/20">
              {headers?.map((cell, index) => {
                const alignClass =
                  index + 1 === headers?.length ? "text-center" : "text-left";
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
                    className={`${alignClass} text-white font-semibold select-none ${
                      sortable ? "cursor-pointer hover:bg-black/80" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {cell.header}
                      {SortIcon && (
                        <SortIcon
                          size={16}
                          className={`text-white ${
                            isActive ? "opacity-100" : "opacity-70"
                          }`}
                          strokeWidth={1.75}
                        />
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex} className="border-b border-black/10 dark:border-white/10">
                    {headers.map((_, colIndex) => (
                      <TableCell key={colIndex} className="py-4 bg-white dark:bg-[#242424]">
                        <div className="h-6 w-full rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : paginatedData?.map((item, rowIdx) => {
                  const rowClass = getRowClassName?.(item) ?? "";
                  return (
                  <TableRow
                    key={rowIdx}
                    className={`border-b border-black/10 dark:border-white/10 transition-colors ${rowClass || "bg-white dark:bg-[#242424] hover:bg-black/5 dark:hover:bg-white/5"}`}
                  >
                    {headers.map((header, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={`${py ? py : "py-4"} text-black dark:text-white ${
                          colIdx + 1 === headers?.length ? "text-center" : "text-left"
                        }`}
                      >
                        {item[header.field]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
                })
              }
          </TableBody>
        </Table>
      </div>

      {!isLoading && sortedData.length > 0 && (
        <div className="mt-4">
          <TablePaginate
            total={sortedData.length}
            pageSize={pageSize}
            setPageSize={setPageSize}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}

      {!isLoading && sortedData.length === 0 && (
        <div className="center my-12 text-black/60 dark:text-white/60">
          <FolderOpen strokeWidth={1} />
          <p className="text-center mt-3">{t("table.noDataEntry")}</p>
        </div>
      )}
    </>
  );
}
