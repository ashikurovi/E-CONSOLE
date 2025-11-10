import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen } from "lucide-react";

export default function ReusableTable({ data, headers, py, total, isLoading }) {
  return (
    <>
      <Table className="mt-6">
        <TableHeader>
          <TableRow className="border-none">
            {headers?.map((cell, index) => (
              <TableHead
                key={index}
                className={`${
                  index + 1 === headers?.length ? "text-center" : "text-left"
                } text-black/30 dark:text-white/40 font-normal`}
              >
                {cell.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="border-none">
                  {headers.map((_, colIndex) => (
                    <TableCell key={colIndex} className="py-2">
                      <div className="h-6 bg-gray-300 dark:bg-white/10 bg-black/10 rounded animate-pulse w-full"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data?.map((item, index) => (
                <TableRow key={index} className="border-none">
                  {headers.map((header, index) => (
                    <TableCell
                      key={index}
                      className={`${py ? py : "py-1.5"} ${
                        index + 1 === headers?.length ? "text-center" : "text-left"
                      }`}
                    >
                      {item[header.field]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!isLoading && total === 0 && (
        <div className="center my-12">
          <FolderOpen strokeWidth={1} />
          <p className="text-center mt-3 text-black/40 dark:text-white/60">
            No Data Entry found!
          </p>
        </div>
      )}
    </>
  );
}
