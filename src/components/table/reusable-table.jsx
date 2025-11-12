import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

export default function ReusableTable({ data, headers, py, total, isLoading }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

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

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table className="mt-0">
          <TableHeader className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 bg-white/70 dark:bg-neutral-900/70">
            <TableRow className="border-b">
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
                    className={`${alignClass} text-black/70 dark:text-white/80 font-medium select-none ${
                      sortable ? "cursor-pointer" : ""
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {cell.header}
                      {SortIcon && (
                        <SortIcon
                          size={16}
                          className={`text-muted-foreground ${
                            isActive ? "opacity-100" : "opacity-60"
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
                  <TableRow key={rowIndex} className="border-none">
                    {headers.map((_, colIndex) => (
                      <TableCell key={colIndex} className="py-2">
                        <div className="h-6 w-full rounded-md bg-black/10 dark:bg-white/10 animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : sortedData?.map((item, rowIdx) => (
                  <TableRow
                    key={rowIdx}
                    className="border-none odd:bg-muted/30 hover:bg-muted/50"
                  >
                    {headers.map((header, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={`${py ? py : "py-2"} ${
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

      {!isLoading && total === 0 && (
        <div className="center my-12 text-muted-foreground">
          <FolderOpen strokeWidth={1} />
          <p className="text-center mt-3">No Data Entry found!</p>
        </div>
      )}
    </>
  );
}
