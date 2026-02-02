import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Edit3, Download, Trash2, MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { downloadSaleInvoicePDF } from "@/utils/saleInvoicePDF";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amount || 0);
};

const headers = [
  { header: "ID", field: "id", sortable: true },
  { header: "CREATED", field: "created", sortable: true },
  { header: "CUSTOMER", field: "customer" },
  { header: "PAID", field: "paid", sortable: true },
  { header: "TOTAL", field: "total", sortable: true },
  { header: "ORDERS.DELIVERY", field: "delivery" },
  { header: "ITEMS", field: "items" },
  { header: "STATUS", field: "status" },
  { header: "ACTIONS", field: "actions", sortable: false },
];

export default function InvoicesTable({
  filteredData,
  authUser,
  isLoading,
  onDeleteClick,
}) {
  const navigate = useNavigate();

  const tableData = useMemo(() => {
    return filteredData.map((invoice) => ({
      id: (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          #{invoice.id}
        </span>
      ),
      created: invoice.createdAt
        ? format(new Date(invoice.createdAt), "d MMM yyyy")
        : "-",
      customer: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5347CE]/10 flex items-center justify-center text-[#5347CE] font-bold text-xs">
            {(invoice.customer?.name || "C").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {invoice.customer?.name || "Unknown Customer"}
          </span>
        </div>
      ),
      paid: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit capitalize ${
            invoice.status?.toLowerCase() === "paid"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : invoice.status?.toLowerCase() === "overdue"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                : invoice.status?.toLowerCase() === "cancelled"
                  ? "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                  : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              invoice.status?.toLowerCase() === "paid"
                ? "bg-emerald-500"
                : invoice.status?.toLowerCase() === "overdue"
                  ? "bg-red-500"
                  : invoice.status?.toLowerCase() === "cancelled"
                    ? "bg-gray-500"
                    : "bg-orange-500"
            }`}
          ></span>
          {(() => {
            const s = (invoice.status || "pending").toString();
            return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
          })()}
        </span>
      ),
      total: (
        <span className="font-bold text-gray-900 dark:text-gray-100">
          {formatCurrency(invoice.totalAmount)}
        </span>
      ),
      delivery: (
        <span className="text-gray-500 text-sm font-medium">
          {invoice.deliveryStatus || "N/A"}
        </span>
      ),
      items: (
        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
          {(Array.isArray(invoice.items) ? invoice.items?.length : invoice.items) || 1} items
        </span>
      ),
      status: (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
            invoice.fulfillmentStatus?.toLowerCase() === "fulfilled"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${invoice.fulfillmentStatus?.toLowerCase() === "fulfilled" ? "bg-emerald-500" : "bg-red-500"}`}
          ></span>
          {invoice.fulfillmentStatus?.toLowerCase() === "fulfilled"
            ? "Fulfilled"
            : "Unfulfilled"}
        </span>
      ),
      actions: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/${invoice.id}`)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                try {
                  const companyInfo = {
                    companyName: authUser?.companyName,
                    branchLocation: authUser?.branchLocation,
                  };
                  downloadSaleInvoicePDF(invoice, companyInfo);
                  toast.success("Invoice downloaded");
                } catch (err) {
                  toast.error("Failed to download PDF");
                }
              }}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={() => onDeleteClick(invoice)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }));
  }, [filteredData, authUser, onDeleteClick]);

  return (
    <ReusableTable
      data={tableData}
      headers={headers}
      isLoading={isLoading}
      searchPlaceholder="Search invoices..."
      py="py-4"
    />
  );
}
