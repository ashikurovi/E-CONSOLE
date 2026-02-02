import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  MoreVertical,
  Trash2,
  Search,
  MoreHorizontal,
} from "lucide-react";
import {
  format,
  startOfMonth,
  subMonths,
  endOfMonth,
  isWithinInterval,
} from "date-fns";
import { motion } from "framer-motion";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InvoicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [statusFilter, setStatusFilter] = useState("All");

  // Hardcoded Mock Data (as requested)
  const mockInvoices = [
    {
      id: "21",
      createdAt: "2026-02-01",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 10,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "20",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "pending",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "unfulfilled",
    },
    {
      id: "19",
      createdAt: "2026-01-31",
      customer: { name: "Aftab Farhan" },
      status: "pending",
      totalAmount: 50,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "unfulfilled",
    },
    {
      id: "18",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "17",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "16",
      createdAt: "2026-01-31",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "15",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "14",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "13",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "12",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
    {
      id: "11",
      createdAt: "2026-01-30",
      customer: { name: "MST HASINA BEGUM" },
      status: "paid",
      totalAmount: 1,
      deliveryStatus: "N/A",
      items: 1,
      fulfillmentStatus: "fulfilled",
    },
  ];

  // API Queries (Using mock data if API is empty or loading for now to satisfy "hard code" request, or just merging)
  // For now, let's prioritize the mock data for the TABLE display as requested, but keep stats real if possible.
  // Actually, let's just use mockData for the table source to be safe.

  const { data: apiInvoices = [], isLoading } = useGetSaleInvoicesQuery({
    companyId: authUser?.companyId,
  });

  const displayData = mockInvoices; // Force mock data for table as requested

  // Calculate Stats with Trends (Keep this dynamic based on API if available, else mock?)
  // The user said "Invoices pages table hard code data set now table please start"
  // This likely refers to the TABLE data. I'll use API data for stats if available, otherwise it might look weird.
  // Let's use apiInvoices for stats calculation to keep the "dynamic features" from previous turn working if data exists.
  const saleInvoicesData = apiInvoices.length > 0 ? apiInvoices : [];

  // Calculate Stats with Trends
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    const thisMonthInvoices = saleInvoicesData.filter(
      (inv) => inv.createdAt && new Date(inv.createdAt) >= currentMonthStart,
    );

    const lastMonthInvoices = saleInvoicesData.filter(
      (inv) =>
        inv.createdAt &&
        isWithinInterval(new Date(inv.createdAt), {
          start: lastMonthStart,
          end: lastMonthEnd,
        }),
    );

    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // 1. Total Invoices
    const total = saleInvoicesData.length;
    const totalTrend = calculateTrend(
      thisMonthInvoices.length,
      lastMonthInvoices.length,
    );

    // 2. Total Revenue
    const totalAmount = saleInvoicesData.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const thisMonthRevenue = thisMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const lastMonthRevenue = lastMonthInvoices.reduce(
      (sum, inv) => sum + (Number(inv.totalAmount) || 0),
      0,
    );
    const revenueTrend = calculateTrend(thisMonthRevenue, lastMonthRevenue);

    // 3. Pending Invoices
    const pendingInvoices = saleInvoicesData.filter((inv) =>
      ["pending", "unpaid", "processing"].includes(inv.status?.toLowerCase()),
    );
    const pendingCount = pendingInvoices.length;
    const thisMonthPending = thisMonthInvoices.filter((inv) =>
      ["pending", "unpaid", "processing"].includes(inv.status?.toLowerCase()),
    ).length;
    const lastMonthPending = lastMonthInvoices.filter((inv) =>
      ["pending", "unpaid", "processing"].includes(inv.status?.toLowerCase()),
    ).length;
    const pendingTrend = calculateTrend(thisMonthPending, lastMonthPending);

    // 4. Overdue Invoices
    const overdueInvoices = saleInvoicesData.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    );
    const overdueCount = overdueInvoices.length;
    const thisMonthOverdue = thisMonthInvoices.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    ).length;
    const lastMonthOverdue = lastMonthInvoices.filter(
      (inv) => inv.status?.toLowerCase() === "overdue",
    ).length;
    const overdueTrend = calculateTrend(thisMonthOverdue, lastMonthOverdue);

    return [
      {
        label: "Total Invoices",
        value: total,
        trend: `${totalTrend > 0 ? "+" : ""}${totalTrend.toFixed(1)}%`,
        trendDir: totalTrend >= 0 ? "up" : "down",
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        wave: "text-blue-500",
      },
      {
        label: "Total Revenue",
        value: new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "BDT",
          minimumFractionDigits: 0,
        }).format(totalAmount),
        trend: `${revenueTrend > 0 ? "+" : ""}${revenueTrend.toFixed(1)}%`,
        trendDir: revenueTrend >= 0 ? "up" : "down",
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        wave: "text-emerald-500",
      },
      {
        label: "Pending Invoices",
        value: pendingCount,
        trend: `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}%`,
        trendDir: pendingTrend >= 0 ? "up" : "down", // Generally more pending is bad, but keeping direction consistent with math for now
        icon: Clock,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        wave: "text-orange-500",
      },
      {
        label: "Overdue Invoices",
        value: overdueCount,
        trend: `${overdueTrend > 0 ? "+" : ""}${overdueTrend.toFixed(1)}%`,
        trendDir: overdueTrend >= 0 ? "up" : "down", // More overdue is bad
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20",
        wave: "text-red-500",
      },
    ];
  }, [saleInvoicesData]);

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Status Tabs
  const tabs = ["All", "Paid", "Pending", "Overdue", "Cancelled"];

  // Filter Data
  const filteredData = useMemo(() => {
    if (statusFilter === "All") return displayData;
    return displayData.filter(
      (inv) => (inv.status?.toLowerCase() || "") === statusFilter.toLowerCase(),
    );
  }, [displayData, statusFilter]);

  // Map Data for Table
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
          className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 w-fit ${
            invoice.status?.toLowerCase() === "paid"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${invoice.status?.toLowerCase() === "paid" ? "bg-emerald-500" : "bg-orange-500"}`}
          ></span>
          {invoice.status?.toLowerCase() === "paid" ? "Success" : "Pending"}
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
          {invoice.items || 1} items
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
              <MoreHorizontal className="h-4 w-4" />
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
            <DropdownMenuItem className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }));
  }, [filteredData, navigate]);

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

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-2">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Sale{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              Invoices
            </span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            Manage your sales invoices, track payments, and monitor revenue
            streams efficiently.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1"
            onClick={() => navigate("/invoices/create")}
          >
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-lg">New Invoice</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
            className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
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
                    stat.trendDir === "up"
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

      {/* Tabs & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-50 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? "bg-white dark:bg-[#2c3036] text-[#5347CE] shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-gray-200 dark:border-gray-700"
            >
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">This Week</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 border-gray-200 dark:border-gray-700"
            >
              <Filter className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm">Filter</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={tableData}
        headers={headers}
        isLoading={isLoading}
        searchPlaceholder="Search invoices..."
        py="py-4"
      />

      {/* Delete Confirmation Modal */}
      {/* <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              <span className="font-bold text-gray-900 dark:text-white">
                #{invoiceToDelete?.id}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                console.log("Deleting invoice:", invoiceToDelete?.id);
                setDeleteModalOpen(false);
              }}
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
};

export default InvoicesPage;
