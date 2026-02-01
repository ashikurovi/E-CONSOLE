import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Download, 
  Search, 
  Plus,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  ListFilter,
  ChevronDown,
  LayoutGrid,
  Filter
} from "lucide-react";
import { format } from "date-fns";

import { useGetOrdersQuery, useGetOrderStatsQuery } from "@/features/order/orderApiSlice";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TablePaginate from "@/components/table/pagination";
import { exportProductsToPDF } from "@/utils/pdfExport"; // Reuse PDF export or generic

// -- Stat Card Component --
const StatCard = ({ title, value, percentage, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white dark:bg-[#1a1f26] rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${percentage?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
        <span>{percentage}</span>
        <span className="text-gray-400 font-normal">from last month</span>
      </div>
    </div>
    <div className={`p-3 rounded-full ${bgClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const InvoicesPage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState("All");

  // API Queries
  const { data: saleInvoicesData = [], isLoading } = useGetSaleInvoicesQuery({ companyId: authUser?.companyId });
  const { data: stats } = useGetOrderStatsQuery({ companyId: authUser?.companyId });

  // Status Tabs
  const tabs = ["All", "Paid", "Overdue", "Pending", "Cancelled", "Unpaid"];

  // Helper to map Order Status -> Invoice Status
  const getInvoiceStatus = (orderStatus) => {
      switch(orderStatus?.toLowerCase()) {
          case 'delivered': return 'Paid';
          case 'cancelled': return 'Cancelled';
          case 'pending': return 'Pending';
          case 'processing': return 'Pending';
          case 'returned': return 'Refunded';
          default: return 'Unpaid';
      }
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
          case 'Overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
          case 'Pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
          case 'Unpaid': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
          case 'Cancelled': return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
          case 'Refunded': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
          default: return 'bg-gray-100 text-gray-700';
      }
  };

  // Processing Data
  const processedData = useMemo(() => {
    let data = saleInvoicesData.map(invoice => ({
        id: invoice.id,
        invoiceId: invoice.invoiceNumber,
        customer: invoice.customer?.name || invoice.customerName || 'Customer',
        avatar: null,
        createdOn: invoice.createdAt,
        amount: invoice.totalAmount || 0,
        paid: invoice.status === 'paid' ? invoice.totalAmount : 0,
        status: invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || 'Pending',
        paymentMode: invoice.paymentMethod || 'Cash',
        dueDate: invoice.dueDate || new Date(new Date(invoice.createdAt).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }));

    if (statusFilter !== "All") {
        data = data.filter(item => item.status === statusFilter);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      data = data.filter(item => 
        item.invoiceId.toLowerCase().includes(lower) || 
        item.customer.toLowerCase().includes(lower)
      );
    }

    return data;
  }, [orders, searchTerm, statusFilter]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, currentPage, pageSize]);

  // Currency Formatter
  const formatCurrency = (amt) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'BDT' }).format(amt);

  // Status Stats Calculation (Mocked from list or API stats if detailed enough)
  const totalAmount = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const paidAmount = processedData.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.paid, 0);
  const pendingAmount = processedData.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = processedData.filter(i => i.status === 'Overdue').reduce((sum, i) => sum + i.amount, 0); // Mock logic for overdue

  return (
    <div className="min-h-screen bg-[#f7f8f9] dark:bg-[#0b0f14] p-4 lg:p-8 space-y-6">
      
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
           <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <span className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0b0f14] bg-gray-200" />
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0b0f14] bg-gray-300" />
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#0b0f14] bg-gray-400" />
              </span>
              <span>Manage your invoices</span>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
              <Download className="w-4 h-4 mr-2" />
              Export
           </Button>
            <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white" onClick={() => navigate("/invoices/create")}>
               <Plus className="w-4 h-4 mr-2" />
               New Invoice
            </Button>
        </div>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Invoices" 
            value={formatCurrency(totalAmount)} 
            percentage="+5.62%" 
            icon={FileText} 
            colorClass="text-[#7c3aed]" 
            bgClass="bg-[#7c3aed]/10" 
          />
          <StatCard 
            title="Paid Invoices" 
            value={formatCurrency(paidAmount)} 
            percentage="+11.4%" 
            icon={CheckCircle} 
            colorClass="text-green-600" 
            bgClass="bg-green-50 dark:bg-green-900/20" 
          />
          <StatCard 
            title="Pending Invoices" 
            value={formatCurrency(pendingAmount)} 
            percentage="-8.52%" 
            icon={Clock} 
            colorClass="text-yellow-600" 
            bgClass="bg-yellow-50 dark:bg-yellow-900/20" 
          />
          <StatCard 
            title="Overdue Invoices" 
            value={formatCurrency(overdueAmount)} 
            percentage="+7.45%" 
            icon={AlertCircle} 
            colorClass="text-red-600" 
            bgClass="bg-red-50 dark:bg-red-900/20" 
          />
      </div>

      {/* --- Tabs --- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
         {tabs.map(tab => (
             <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    statusFilter === tab 
                    ? "text-[#7c3aed]" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
             >
                {tab}
                {statusFilter === tab && (
                    <span className="absolute bottom-[-5px] left-0 w-full h-[2px] bg-[#7c3aed] rounded-t-full" />
                )}
             </button>
         ))}
      </div>

      {/* --- Toolbar --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
         <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
         </div>

         <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button variant="outline" className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
               <Filter className="w-4 h-4 mr-2" />
               Filter
            </Button>
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                     Sort by: Latest
                     <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuItem>Latest</DropdownMenuItem>
                  <DropdownMenuItem>Oldest</DropdownMenuItem>
                  <DropdownMenuItem>Amount: High to Low</DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
               <LayoutGrid className="w-4 h-4 mr-2" />
               Column
            </Button>
         </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <Table>
               <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                  <TableRow>
                     <TableHead className="w-[40px] pl-4"><Checkbox /></TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">ID</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Customer</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Created On</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Amount</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Paid</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Status</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Payment Mode</TableHead>
                     <TableHead className="font-semibold text-gray-900 dark:text-white">Due Date</TableHead>
                     <TableHead className="text-right font-semibold text-gray-900 dark:text-white pr-4">Action</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                           <TableCell colSpan={10} className="h-16 animate-pulse bg-gray-50/50 dark:bg-white/5" />
                        </TableRow>
                     ))
                  ) : paginatedData.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={10} className="h-32 text-center text-gray-500">No invoices found</TableCell>
                     </TableRow>
                  ) : (
                     paginatedData.map((invoice) => (
                        <TableRow key={invoice.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                           <TableCell className="pl-4"><Checkbox /></TableCell>
                           <TableCell>
                              <span 
                                className="font-semibold text-[#7c3aed] hover:underline cursor-pointer"
                                onClick={() => navigate(`/invoices/${invoice.id}`)}
                              >
                                {invoice.invoiceId}
                              </span>
                           </TableCell>
                           <TableCell>
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                                     <span className="text-xs font-bold text-gray-500">{invoice.customer.charAt(0)}</span>
                                 </div>
                                 <span className="font-medium text-gray-900 dark:text-white text-sm">{invoice.customer}</span>
                              </div>
                           </TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                              {format(new Date(invoice.createdOn), 'dd MMM yyyy')}
                           </TableCell>
                           <TableCell className="font-semibold text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400">{formatCurrency(invoice.paid)}</TableCell>
                           <TableCell>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(invoice.status)}`}>
                                 {invoice.status}
                              </span>
                           </TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400 text-sm">{invoice.paymentMode}</TableCell>
                           <TableCell className="text-gray-600 dark:text-gray-400 text-sm">
                              {format(new Date(invoice.dueDate), 'dd MMM yyyy')}
                           </TableCell>
                           <TableCell className="text-right pr-4">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                 </Button>
                           </TableCell>
                        </TableRow>
                     ))
                  )}
               </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <TablePaginate
               total={processedData.length}
               pageSize={pageSize}
               setPageSize={setPageSize}
               currentPage={currentPage}
               setCurrentPage={setCurrentPage}
            />
         </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
