import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText, DollarSign, CreditCard, Building2, User, Calendar, CheckCircle2, Clock, XCircle, Eye, Trash2, Edit, Download } from "lucide-react";
import { useGetInvoicesQuery, useDeleteInvoiceMutation } from "@/features/invoice/invoiceApiSlice";
import { Button } from "@/components/ui/button";
import InvoiceCreateForm from "./InvoiceCreateForm";
import InvoiceStatusUpdateForm from "./InvoiceStatusUpdateForm";
import BankPaymentActions from "./BankPaymentActions";
import InlineBankPaymentActions from "./InlineBankPaymentActions";
import { generateInvoicePDF } from "./InvoicePDFGenerator";
import toast from "react-hot-toast";

const InvoiceManagementPage = () => {
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteInvoiceMutation();
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [editingInvoice, setEditingInvoice] = useState(null);

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleDelete = async (invoice) => {
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      return;
    }
    const res = await deleteInvoice(invoice.id);
    if (res?.error) {
      alert(res?.error?.data?.message || "Failed to delete invoice");
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
      pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Clock },
      paid: { color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle2 },
      cancelled: { color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentStatusBadge = (bankPayment) => {
    if (!bankPayment) return null;
    const statusConfig = {
      verified: { color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", label: "Verified" },
      pending: { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", label: "Pending" },
      rejected: { color: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300", label: "Rejected" },
    };
    const config = statusConfig[bankPayment.status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) : "-";
  };

  // Statistics
  const stats = useMemo(() => {
    const total = invoices.length;
    const pending = invoices.filter(inv => inv.status === "pending").length;
    const paid = invoices.filter(inv => inv.status === "paid").length;
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + parseFloat(inv.paidAmount || 0), 0);
    const totalDue = invoices.reduce((sum, inv) => sum + parseFloat(inv.dueAmount || 0), 0);

    return { total, pending, paid, totalAmount, totalPaid, totalDue };
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Invoice Management
            </h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              Manage customer invoices, payments, and billing information.
            </p>
          </div>
          <InvoiceCreateForm />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Total Invoices</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{stats.paid}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Total Amount</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(stats.totalAmount)}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Total Paid</p>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">{formatCurrency(stats.totalPaid)}</p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">Total Due</p>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">{formatCurrency(stats.totalDue)}</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 dark:border-gray-800">
          <h2 className="text-sm font-medium">All Invoices</h2>
          <p className="text-xs text-black/60 dark:text-white/60">Click on any row to view detailed information.</p>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-black/60 dark:text-white/60">
              Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-black/60 dark:text-white/60">
              No invoices found.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-black/5 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider w-[180px]">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Paid
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Due
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-black/70 dark:text-white/70 uppercase tracking-wider w-[280px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {invoices.map((invoice) => {
                  const isExpanded = expandedRows.has(invoice.id);
                  return (
                    <React.Fragment key={invoice.id}>
                      {/* Main Row */}
                      <tr
                        className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => toggleRow(invoice.id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-black/40 dark:text-white/40" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-black/40 dark:text-white/40" />
                            )}
                            <div>
                              <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
                              <p className="text-xs text-black/50 dark:text-white/50">{invoice.transactionId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{invoice.customer?.name || "-"}</p>
                            <p className="text-xs text-black/50 dark:text-white/50">{invoice.customer?.email || "-"}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold">{formatCurrency(invoice.totalAmount)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(invoice.paidAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            {formatCurrency(invoice.dueAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(invoice.status)}
                            {invoice.bankPayment?.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                <Building2 className="h-3 w-3" />
                                Bank Payment Pending
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-black/60 dark:text-white/60">
                            {formatDate(invoice.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Bank Payment Actions (if pending) */}
                            <InlineBankPaymentActions invoice={invoice} />
                            
                            {/* Divider if bank payment actions are shown */}
                            {invoice?.bankPayment?.status === "pending" && (
                              <div className="h-8 w-px bg-black/10 dark:bg-white/10" />
                            )}
                            
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => handleDownloadPDF(invoice, e)}
                              title="Download PDF"
                              className="h-8 w-8 bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => toggleRow(invoice.id)}
                              title="View details"
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditingInvoice(invoice)}
                              title="Update status"
                              className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDelete(invoice)}
                              disabled={isDeleting}
                              title="Delete"
                              className="h-8 w-8 bg-red-500 hover:bg-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-black/5 dark:bg-white/5">
                          <td colSpan="8" className="px-4 py-6">
                            {/* Download PDF Button */}
                            <div className="mb-4 flex justify-end">
                              <Button
                                onClick={(e) => handleDownloadPDF(invoice, e)}
                                className="bg-purple-500 hover:bg-purple-600 text-white flex items-center gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download Invoice PDF
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Customer Information */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                  <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                                    Customer Information
                                  </h3>
                                </div>
                                <div className="space-y-3 pl-7">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Name</p>
                                      <p className="text-sm font-medium">{invoice.customer?.name || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Email</p>
                                      <p className="text-sm font-medium break-all">{invoice.customer?.email || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Company</p>
                                      <p className="text-sm font-medium">{invoice.customer?.companyName || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Company ID</p>
                                      <p className="text-sm font-medium">{invoice.customer?.companyId || "-"}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Phone</p>
                                      <p className="text-sm font-medium">{invoice.customer?.phone || "-"}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Location</p>
                                      <p className="text-sm font-medium">{invoice.customer?.branchLocation || "-"}</p>
                                    </div>
                                  </div>
                                  {invoice.customer?.paymentInfo && (
                                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                      <p className="text-xs text-black/60 dark:text-white/60 mb-1">Current Package</p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">{invoice.customer.paymentInfo.packagename}</span>
                                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                          {formatCurrency(invoice.customer.paymentInfo.amount)}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Payment Information */}
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                                    Payment Information
                                  </h3>
                                </div>
                                <div className="space-y-3 pl-7">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Invoice Number</p>
                                      <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Transaction ID</p>
                                      <p className="text-sm font-medium break-all">{invoice.transactionId}</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Amount Type</p>
                                      <p className="text-sm font-medium capitalize">{invoice.amountType}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Status</p>
                                      <div className="mt-1">{getStatusBadge(invoice.status)}</div>
                                    </div>
                                  </div>

                                  {/* Bank Payment Details */}
                                  {invoice.bankPayment && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        <p className="text-xs font-semibold text-black/70 dark:text-white/70">Bank Payment</p>
                                      </div>
                                      <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Bank Name</p>
                                            <p className="text-sm font-medium">{invoice.bankPayment.bankName}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Amount</p>
                                            <p className="text-sm font-medium">{formatCurrency(invoice.bankPayment.amount)}</p>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Account Last Digits</p>
                                            <p className="text-sm font-medium">{invoice.bankPayment.accLastDigit}</p>
                                          </div>
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Payment Status</p>
                                            <div className="mt-1">{getPaymentStatusBadge(invoice.bankPayment)}</div>
                                          </div>
                                        </div>
                                        {/* Bank Payment Actions */}
                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                          <BankPaymentActions invoice={invoice} />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Bkash Payment Details */}
                                  {(invoice.bkashPaymentID || invoice.bkashTrxID) && (
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                      <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                                        <p className="text-xs font-semibold text-black/70 dark:text-white/70">Bkash Payment</p>
                                      </div>
                                      <div className="space-y-2">
                                        {invoice.bkashPaymentID && (
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Payment ID</p>
                                            <p className="text-sm font-medium">{invoice.bkashPaymentID}</p>
                                          </div>
                                        )}
                                        {invoice.bkashTrxID && (
                                          <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">Transaction ID</p>
                                            <p className="text-sm font-medium">{invoice.bkashTrxID}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Timeline */}
                              <div className="lg:col-span-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-2 mb-3">
                                  <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                  <h3 className="text-sm font-semibold text-black/70 dark:text-white/70">
                                    Timeline
                                  </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-7">
                                  <div>
                                    <p className="text-xs text-black/60 dark:text-white/60">Created At</p>
                                    <p className="text-sm font-medium">{formatDate(invoice.createdAt)}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-black/60 dark:text-white/60">Last Updated</p>
                                    <p className="text-sm font-medium">{formatDate(invoice.updatedAt)}</p>
                                  </div>
                                  {invoice.deletedAt && (
                                    <div>
                                      <p className="text-xs text-black/60 dark:text-white/60">Deleted At</p>
                                      <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                        {formatDate(invoice.deletedAt)}
                                      </p>
                                    </div>
                                  )}
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

      {/* Status Update Modal */}
      {editingInvoice && (
        <InvoiceStatusUpdateForm
          invoice={editingInvoice}
          onClose={() => setEditingInvoice(null)}
        />
      )}
    </div>
  );
};

export default InvoiceManagementPage;
