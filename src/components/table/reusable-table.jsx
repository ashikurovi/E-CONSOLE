import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import TablePaginate from "./pagination";

export default function ReusableTable({ data, headers, py, total, isLoading }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const onHeaderClick = (field) => {
    if (!field) return;
    if (sortKey === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(field);
      setSortDir("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!Array.isArray(data) || !sortKey) return data;
    const copy = [...data];
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
  }, [data, sortKey, sortDir]);

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

  return (
    <>
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
              : paginatedData?.map((item, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    className="border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
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
                ))}
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
          <p className="text-center mt-3">No Data Entry found!</p>
        </div>
      )}
    </>
  );
}
