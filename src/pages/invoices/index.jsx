import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Eye,
  Download,
  Filter,
  Calendar,
  MoreVertical,
  Trash2,
  Search
} from "lucide-react";
import { format } from "date-fns";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";
import StatCard from "@/components/cards/stat-card";
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

  // API Queries
  const { data: saleInvoicesData = [], isLoading } = useGetSaleInvoicesQuery({
    companyId: authUser?.companyId,
  });

  // Calculate Stats
  const stats = useMemo(() => {
    const total = saleInvoicesData.length;
    const totalAmount = saleInvoicesData.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    const paidInvoices = saleInvoicesData.filter(inv => inv.status?.toLowerCase() === 'paid');
    const paidCount = paidInvoices.length;
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    const pendingInvoices = saleInvoicesData.filter(inv => ['pending', 'unpaid', 'processing'].includes(inv.status?.toLowerCase()));
    const pendingCount = pendingInvoices.length;
    
    const overdueInvoices = saleInvoicesData.filter(inv => inv.status?.toLowerCase() === 'overdue'); // Assuming 'overdue' status exists or needs logic
    const overdueCount = overdueInvoices.length;

    return {
      total,
      totalAmount,
      paidCount,
      paidAmount,
      pendingCount,
      overdueCount
    };
  }, [saleInvoicesData]);

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Status Tabs
  const tabs = ["All", "Paid", "Pending", "Overdue", "Cancelled"];

  // Filter Data
  const filteredData = useMemo(() => {
    if (statusFilter === "All") return saleInvoicesData;
    return saleInvoicesData.filter(inv => 
      (inv.status?.toLowerCase() || "") === statusFilter.toLowerCase()
    );
  }, [saleInvoicesData, statusFilter]);

  // Map Data for Table
  const tableData = useMemo(() => {
    return filteredData.map(invoice => ({
      id: invoice.id,
      invoiceId: (
        <span 
          onClick={() => navigate(`/invoices/${invoice.id}`)}
          className="font-medium text-[#5347CE] hover:underline cursor-pointer"
        >
          {invoice.invoiceNumber || invoice.id?.substring(0, 8)}
        </span>
      ),
      date: invoice.createdAt ? format(new Date(invoice.createdAt), "MMM d, yyyy") : "-",
      customer: (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5347CE]/10 flex items-center justify-center text-[#5347CE] font-bold text-xs">
            {(invoice.customer?.name || invoice.customerName || "C").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {invoice.customer?.name || invoice.customerName || "Unknown Customer"}
          </span>
        </div>
      ),
      amount: <span className="font-semibold">{formatCurrency(invoice.totalAmount)}</span>,
      status: (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
          invoice.status?.toLowerCase() === 'paid' 
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            : invoice.status?.toLowerCase() === 'pending'
            ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
            : invoice.status?.toLowerCase() === 'cancelled'
            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
            : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
        }`}>
          {invoice.status?.toUpperCase() || "PENDING"}
        </span>
      ),
      actions: (
        <div className="flex items-center justify-end gap-2">
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-[#5347CE] hover:bg-[#5347CE]/10"
                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>

           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-green-600 hover:bg-green-50"
                  // Add download handler here
                >
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download PDF</p>
              </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        </div>
      )
    }));
  }, [filteredData, navigate]);

  const headers = [
    { header: "Invoice ID", field: "invoiceId" },
    { header: "Date", field: "date", sortable: true },
    { header: "Customer", field: "customer" },
    { header: "Amount", field: "amount", sortable: true },
    { header: "Status", field: "status" },
    { header: "Actions", field: "actions", sortable: false },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your invoices</p>
        </div>
        <Button 
          className="bg-[#5347CE] hover:bg-[#4338ca] text-white px-6 shadow-lg shadow-[#5347CE]/20"
          onClick={() => navigate("/invoices/create")}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Invoices"
          value={stats.total}
          delta="+12%"
          icon={FileText}
          tone="violet"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalAmount)}
          delta="+8.2%"
          icon={CheckCircle}
          tone="green"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingCount}
          delta="-2%"
          icon={Clock}
          tone="default" // Using default (gray/orange) or custom
        />
        <StatCard
          title="Overdue Invoices"
          value={stats.overdueCount}
          delta="+4%"
          icon={AlertCircle}
          tone="red"
        />
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
                <Button variant="outline" size="sm" className="h-9 border-gray-200 dark:border-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">This Week</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 border-gray-200 dark:border-gray-700">
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
    </div>
  );
};

export default InvoicesPage;
