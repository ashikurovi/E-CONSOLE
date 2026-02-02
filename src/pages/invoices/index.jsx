import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MoreVertical,
  Search,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";
import InvoiceStatCard from "./components/InvoiceStatCard";
import ConversionHistoryChart from "./components/ConversionHistoryChart";
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
    
    // Calculate basic stats for the cards
    // Note: Real apps would get trends from backend. Here we simulate or calculate if possible.
    const paidInvoices = saleInvoicesData.filter(inv => inv.status?.toLowerCase() === 'paid');
    const paidCount = paidInvoices.length;
    const paidAmount = paidInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    const pendingInvoices = saleInvoicesData.filter(inv => ['pending', 'unpaid', 'processing'].includes(inv.status?.toLowerCase()));
    const pendingCount = pendingInvoices.length;
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    const scheduledCount = saleInvoicesData.filter(inv => inv.status?.toLowerCase() === 'scheduled').length;
    
    return {
      total,
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount,
      scheduledCount,
    };
  }, [saleInvoicesData]);

  // Format Currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Status Tabs
  const tabs = ["All", "Draft", "Scheduled", "Paid"];

  // Filter Data
  const filteredData = useMemo(() => {
    if (statusFilter === "All") return saleInvoicesData;
    const apiStatus = statusFilter === "Draft" ? "pending" : statusFilter.toLowerCase(); 
    return saleInvoicesData.filter(inv => 
      (inv.status?.toLowerCase() || "").includes(apiStatus) || 
      (statusFilter === "Draft" && inv.status?.toLowerCase() === "unpaid")
    );
  }, [saleInvoicesData, statusFilter]);

  // Map Data for Table
  const tableData = useMemo(() => {
    return filteredData.map(invoice => ({
      id: invoice.id,
      invoiceId: (
        <span 
          onClick={() => navigate(`/invoices/${invoice.id}`)}
          className="font-medium text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
        >
          #{(invoice.invoiceNumber || invoice.id?.substring(0, 6)).toUpperCase()}
        </span>
      ),
      date: invoice.createdAt ? format(new Date(invoice.createdAt), "d MMMM yyyy") : "-",
      customer: (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${invoice.customer?.name || invoice.customerName}`} 
                alt="avatar"
                className="w-full h-full object-cover"
              />
           </div>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {invoice.customer?.name || invoice.customerName || "Sophia Wagner"}
          </span>
        </div>
      ),
      amount: <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(invoice.totalAmount)}</span>,
      status: (
        <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold border ${
          invoice.status?.toLowerCase() === 'paid' 
            ? 'bg-emerald-50 text-emerald-500 border-emerald-100'
            : invoice.status?.toLowerCase() === 'scheduled'
            ? 'bg-red-50 text-red-400 border-red-100' 
            : 'bg-blue-50 text-blue-500 border-blue-100' 
        }`}>
          {invoice.status ? (invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)) : "Unpaid"}
        </span>
      ),
      paymentType: <span className="text-gray-500 font-medium">Private</span>,
      actions: (
        <div className="flex items-center justify-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <MoreVertical className="w-4 h-4" />
            </Button>
        </div>
      )
    }));
  }, [filteredData, navigate]);

  const headers = [
    { header: "Number", field: "invoiceId" },
    { header: "Date", field: "date", sortable: true },
    { header: "Customer", field: "customer" },
    { header: "Status", field: "status" },
    { header: "Amount", field: "amount", sortable: true },
    { header: "Payment type", field: "paymentType" },
    { header: "", field: "actions", sortable: false },
  ];

  // Mock Sparkline Data (Smoothed for visual appeal)
  const sparkData1 = Array.from({length: 10}, (_, i) => ({ value: 20 + Math.random() * 30 + (i*2) })); // Trending up
  const sparkData2 = Array.from({length: 10}, (_, i) => ({ value: 30 + Math.random() * 20 + Math.sin(i)*10 }));
  const sparkData3 = Array.from({length: 10}, (_, i) => ({ value: 10 + Math.random() * 40 + (i*3) }));
  const sparkData4 = Array.from({length: 10}, (_, i) => ({ value: 40 + Math.random() * 30 + Math.cos(i)*10 }));

  return (
    <div className="md:p-8 p-4 space-y-8 bg-[#FFFBF5]/50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Invoices breakdown</h1>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: 2x2 Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InvoiceStatCard 
                 title="All invoices"
                 value={stats.total} 
                 comparisonText="Week comparison"
                 data={sparkData1}
                 color="#10B981" // Green
              />
              <InvoiceStatCard 
                 title="Scheduled"
                 value={stats.total} // Placeholder
                 comparisonText="Month comparison"
                 data={sparkData2}
                 color="#F87171" // Red
              />
              <InvoiceStatCard 
                 title="Unpaid"
                 value={formatCurrency(stats.pendingAmount)}
                 comparisonText="Month comparison"
                 data={sparkData3}
                 color="#3B82F6" // Blue
              />
               <InvoiceStatCard 
                 title="Paid"
                 value={formatCurrency(stats.paidAmount)}
                 comparisonText="Week comparison"
                 data={sparkData4}
                 color="#F59E0B" // Yellow
              />
          </div>

          {/* Right: Conversion History */}
          <div className="w-full h-full">
              <ConversionHistoryChart />
          </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6">
        {/* Tabs */}
        <div className="flex items-center gap-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`text-sm font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? "text-gray-900 dark:text-white border-b-2 border-black dark:border-white pb-1"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
             <div className="hidden md:block">
                 <Button variant="ghost" className="text-gray-500 font-medium text-sm hover:bg-transparent hover:text-gray-900 px-0">
                     <span className="bg-[#EAD39C] hover:bg-[#D4B970] transition-colors rounded-lg p-1.5 mr-2 text-white shadow-sm">
                         <Search className="w-4 h-4"/>
                     </span> 
                 </Button>
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-400 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                 <span>Short:</span>
                 <span className="text-gray-900 dark:text-white font-bold cursor-pointer">A-Z</span>
             </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-transparent">
          <ReusableTable
            data={tableData}
            headers={headers}
            isLoading={isLoading}
            searchable={false} 
            py="py-6" 
          />
      </div>
    </div>
  );
};

export default InvoicesPage;
