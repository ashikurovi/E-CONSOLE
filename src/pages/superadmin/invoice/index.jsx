import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  DollarSign,
  CreditCard,
  Building2,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Download,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
} from "@/features/invoice/invoiceApiSlice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import InvoiceCreateForm from "./InvoiceCreateForm";
import InvoiceStatusUpdateForm from "./InvoiceStatusUpdateForm";
import InlineBankPaymentActions from "./InlineBankPaymentActions";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const InvoiceManagementPage = () => {
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  // Stats Calculation
  const stats = useMemo(() => {
    const total = invoices.length;
    const paidInvoices = invoices.filter(
      (inv) => inv.status === "paid" || inv.status === "PAID",
    );
    const pendingInvoices = invoices.filter(
      (inv) => inv.status === "pending" || inv.status === "PENDING",
    );
    const overdueInvoices = invoices.filter(
      (inv) => inv.status === "overdue" || inv.status === "OVERDUE",
    );

    const totalAmount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0,
    );
    const paidAmount = paidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0,
    );
    const pendingAmount = pendingInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.totalAmount || 0),
      0,
    );

    const paidRate =
      total > 0 ? Math.round((paidInvoices.length / total) * 100) : 0;
    const pendingRate =
      total > 0 ? Math.round((pendingInvoices.length / total) * 100) : 0;

    const formatMoney = (amount) => `৳${amount.toLocaleString()}`;

    return [
      {
        label: "Total Invoices",
        value: total,
        trend: "+12%", // Mock trend or calculate if date available
        trendDir: "up",
        icon: FileText,
        bg: "bg-violet-50 dark:bg-violet-900/20",
        color: "text-violet-600 dark:text-violet-400",
        wave: "text-violet-500",
      },
      {
        label: "Total Revenue",
        value: formatMoney(paidAmount),
        trend: `${paidRate}% Paid`,
        trendDir: "up",
        icon: DollarSign,
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        wave: "text-emerald-500",
      },
      {
        label: "Pending Amount",
        value: formatMoney(pendingAmount),
        trend: `${pendingRate}% Pending`,
        trendDir: "down",
        icon: Clock,
        bg: "bg-amber-50 dark:bg-amber-900/20",
        color: "text-amber-600 dark:text-amber-400",
        wave: "text-amber-500",
      },
      {
        label: "Avg. Invoice Value",
        value: formatMoney(total > 0 ? totalAmount / total : 0),
        trend: "+5%",
        trendDir: "up",
        icon: TrendingUp,
        bg: "bg-blue-50 dark:bg-blue-900/20",
        color: "text-blue-600 dark:text-blue-400",
        wave: "text-blue-500",
      },
    ];
  }, [invoices]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDeleteClick = (invoice) => {
    setInvoiceToDelete(invoice);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete) {
      const res = await deleteInvoice(invoiceToDelete.id);
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to delete invoice");
      } else {
        toast.success("Invoice deleted successfully");
      }
      setInvoiceToDelete(null);
    }
  };

  const handleDownloadPDF = (invoice, e) => {
    e?.stopPropagation();
    try {
      generateInvoicePDF(invoice);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        icon: Clock,
      },
      paid: {
        color:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: CheckCircle2,
      },
      cancelled: {
        color:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        icon: XCircle,
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (bankPayment) => {
    if (!bankPayment) return null;
    const statusConfig = {
      verified: {
        color:
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        label: "Verified",
      },
      pending: {
        color:
          "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        label: "Pending",
      },
      rejected: {
        color:
          "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        label: "Rejected",
      },
    };
    const config = statusConfig[bankPayment.status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return date
      ? new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Invoice Management
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Manage customer invoices, track payments, and handle billing
            operations efficiently.
          </p>
        </div>
        <div className="flex-shrink-0">
          <InvoiceCreateForm />
        </div>
      </div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                    stat.trendDir === "up"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
                  }`}
                >
                  {stat.trendDir === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div
              className={`absolute bottom-0 right-0 w-32 h-24 opacity-10 ${stat.wave}`}
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
      </motion.div>

      {/* Invoices Table */}
      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                All Invoices
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Detailed list of all invoices and their current status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {invoices.length} records
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading invoices...
              </p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                No invoices found
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New invoices will appear here once created.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Invoice
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Total Amount
                  </th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Paid
                  </th>
                  <th className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Due
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-[100px] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.map((invoice) => {
                  const isExpanded = expandedRows.has(invoice.id);
                  return (
                    <React.Fragment key={invoice.id}>
                      {/* Main Row */}
                      <tr
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          isExpanded
                            ? "bg-slate-50/80 dark:bg-slate-800/80"
                            : ""
                        }`}
                        onClick={() => toggleRow(invoice.id)}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            )}
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                {invoice.invoiceNumber}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                {invoice.transactionId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {invoice.customer?.name || "-"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {invoice.customer?.email || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(invoice.totalAmount)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(invoice.paidAmount)}
                          </span>
                        </td>
                        <td className="hidden md:table-cell px-4 md:px-6 py-3 md:py-4">
                          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                            {formatCurrency(invoice.dueAmount)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            {getStatusBadge(invoice.status)}
                            {invoice.bankPayment?.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                <Building2 className="h-3 w-3" />
                                Bank Payment Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-4 md:px-6 py-3 md:py-4">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(invoice.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Bank Payment Actions (if pending) */}
                            <InlineBankPaymentActions invoice={invoice} />

                            {/* Divider if bank payment actions are shown */}
                            {invoice?.bankPayment?.status === "pending" && (
                              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-violet-600"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900"
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(invoice.id);
                                  }}
                                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20"
                                >
                                  <Eye className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingInvoice(invoice);
                                  }}
                                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20"
                                >
                                  <Edit className="h-4 w-4" /> Update Status
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => handleDownloadPDF(invoice, e)}
                                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20"
                                >
                                  <Download className="h-4 w-4" /> Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(invoice);
                                  }}
                                  disabled={isDeleting}
                                  className="cursor-pointer gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete Invoice
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                          <td colSpan="8" className="px-4 md:px-6 py-4 md:py-6">
                            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
                              {/* Download PDF Button */}
                              <div className="mb-6 flex flex-col sm:flex-row sm:justify-end">
                                <Button
                                  onClick={(e) => handleDownloadPDF(invoice, e)}
                                  className="bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 shadow-sm shadow-violet-200 dark:shadow-none w-full sm:w-auto"
                                >
                                  <Download className="h-4 w-4" />
                                  Download Invoice PDF
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Customer Information */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <User className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                      Customer Information
                                    </h3>
                                  </div>
                                  <div className="space-y-4 pl-0 sm:pl-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Name
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                          {invoice.customer?.name || "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Email
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white break-all">
                                          {invoice.customer?.email || "-"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Company
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                          {invoice.customer?.companyName || "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Company ID
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                          {invoice.customer?.companyId || "-"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Phone
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                          {invoice.customer?.phone || "-"}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                          Location
                                        </p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                                          {invoice.customer?.branchLocation ||
                                            "-"}
                                        </p>
                                      </div>
                                    </div>
                                    {invoice.customer?.paymentInfo && (
                                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                                          Current Package
                                        </p>
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {
                                              invoice.customer.paymentInfo
                                                .packagename
                                            }
                                          </span>
                                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(
                                              invoice.customer.paymentInfo
                                                .amount,
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Information */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                      Payment Information
                                    </h3>
                                  </div>
                                  <div className="space-y-4 pl-0 sm:pl-2">
                                    {invoice.bankPayment ? (
                                      <>
                                        <div className="p-4 rounded-xl bg-violet-50/50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30">
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                                              Bank Transfer Details
                                            </span>
                                            {getPaymentStatusBadge(
                                              invoice.bankPayment,
                                            )}
                                          </div>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Bank Name
                                              </p>
                                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                {invoice.bankPayment.bankName}
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Account Number
                                              </p>
                                              <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                                                {
                                                  invoice.bankPayment
                                                    .accountNumber
                                                }
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Transaction ID
                                              </p>
                                              <p className="text-sm font-medium text-slate-900 dark:text-white font-mono">
                                                {
                                                  invoice.bankPayment
                                                    .transactionId
                                                }
                                              </p>
                                            </div>
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                                                Amount
                                              </p>
                                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {formatCurrency(
                                                  invoice.bankPayment.amount,
                                                )}
                                              </p>
                                            </div>
                                          </div>
                                          {invoice.bankPayment.documentUrl && (
                                            <div className="mt-4 pt-3 border-t border-violet-100 dark:border-violet-900/30">
                                              <a
                                                href={
                                                  invoice.bankPayment
                                                    .documentUrl
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
                                              >
                                                View Payment Document
                                                <ChevronRight className="h-3 w-3" />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-center">
                                        <CreditCard className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                          No bank payment details available
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {editingInvoice && (
        <InvoiceStatusUpdateForm
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}

      <Dialog
        open={!!invoiceToDelete}
        onOpenChange={(open) => !open && setInvoiceToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 text-white text-center">
            <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Delete Invoice?
            </DialogTitle>
            <DialogDescription className="text-rose-100 mt-2">
              This action cannot be undone. This will permanently delete invoice{" "}
              <span className="font-semibold text-white">
                #{invoiceToDelete?.invoiceNumber}
              </span>
              .
            </DialogDescription>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900">
            <DialogFooter className="gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setInvoiceToDelete(null)}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Invoice"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default InvoiceManagementPage;
