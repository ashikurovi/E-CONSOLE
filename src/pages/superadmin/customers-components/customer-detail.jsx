import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useGetSystemusersQuery, useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Key, FileText, CreditCard, Calendar, CheckCircle2, Clock, XCircle, Download } from "lucide-react";
import { generateInvoicePDF } from "../invoice/InvoicePDFGenerator";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const SuperAdminCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();

  const user = useMemo(
    () => users.find((u) => String(u.id) === String(numericId)),
    [users, numericId]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data) => {
    const payload = {
      id: user.id,
      password: data.password,
    };

    const res = await updateSystemuser(payload);
    if (res?.data) {
      toast.success("Password updated successfully");
      reset();
      setIsPasswordModalOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update password");
    }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    try {
      // Attach customer information to invoice if not already present
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          companyId: user.companyId,
          phone: user.phone,
          branchLocation: user.branchLocation,
          paymentInfo: user.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Customer Detail</h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Review details for a single customer system user.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
            >
              <Key className="h-4 w-4" />
              Access Website
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/superadmin/customers")}
              className="bg-white text-violet-600 hover:bg-violet-50 border-0 shadow-lg shadow-black/10"
            >
              Back to customers
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        {isLoading && <p className="text-sm">Loading customer…</p>}

        {!isLoading && !user && (
          <p className="text-sm text-red-500">
            Customer not found or no longer available.
          </p>
        )}

{!isLoading && user && (
          <div className="space-y-6 text-sm">
            {/* Company Logo Section */}
            {user.companyLogo && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Company Branding
                  </h3>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-black/5 dark:bg-white/5 inline-block">
                  <img
                    src={user.companyLogo}
                    alt="Company Logo"
                    className="h-24 w-24 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Name</p>
                  <p className="font-semibold">{user.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Domain Name</p>
                  <p className="font-medium">{user.domainName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Email</p>
                  <p className="font-medium break-all">{user.email ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Company Name</p>
                  <p className="font-medium">{user.companyName ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Company ID</p>
                  <p className="font-medium">{user.companyId ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Phone</p>
                  <p className="font-medium">{user.phone ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Branch Location</p>
                  <p className="font-medium">{user.branchLocation ?? "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-black/60 dark:text-white/60">Primary Color</p>
                  <p className="font-medium">{user.primaryColor ?? "-"}</p>
                  <div className="w-6 h-6 rounded border border-black/20 dark:border-white/20"
                    style={{ backgroundColor: user.primaryColor }}
                  ></div>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Status</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    user.isActive 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Information Section */}
            {user.theme && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Theme Details
                  </h3>
                </div>
                <div className="overflow-hidden border border-gray-100 dark:border-gray-800 rounded-lg">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 w-1/3">
                          Theme ID
                        </td>
                        <td className="px-4 py-2 font-semibold">
                          {user.theme.id}
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                          Domain URL
                        </td>
                        <td className="px-4 py-2 font-semibold">
                          {user.theme.domainUrl || "-"}
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                          Logo Color Code
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {user.theme.logoColorCode ? (
                              <>
                                <div
                                  className="w-6 h-6 rounded border border-black/20 dark:border-white/20"
                                  style={{ backgroundColor: user.theme.logoColorCode }}
                                ></div>
                                <span className="font-semibold">{user.theme.logoColorCode}</span>
                              </>
                            ) : (
                              <span className="text-black/40 dark:text-white/40">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                          Created At
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {user.theme.createdAt ? new Date(user.theme.createdAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                      <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-4 py-2 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                          Last Updated
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {user.theme.updatedAt ? new Date(user.theme.updatedAt).toLocaleString() : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Package Information Section */}
            {user.package && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Package Details
                  </h3>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-base">{user.package.name}</h4>
                      <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                        {user.package.description}
                      </p>
                    </div>
                    {user.package.isFeatured && (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-medium rounded">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-xs text-black/60 dark:text-white/60">Price</p>
                      <p className="font-semibold">৳{parseFloat(user.package.price).toFixed(2)}</p>
                    </div>
                    {user.package.discountPrice && (
                      <div>
                        <p className="text-xs text-black/60 dark:text-white/60">Discount Price</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          ৳{parseFloat(user.package.discountPrice).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                  {user.package.features && user.package.features.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-black/60 dark:text-white/60 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {user.package.features.map((feature) => (
                          <span
                            key={feature}
                            className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded"
                          >
                            {feature.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courier Configurations Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Courier Configuration
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Pathao Config */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                  <p className="text-xs font-semibold text-black/70 dark:text-white/70 mb-2">
                    Pathao
                  </p>
                  {user.pathaoConfig ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-black/60 dark:text-white/60">Client ID:</p>
                        <p className="text-xs font-mono">{user.pathaoConfig.clientId ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/60 dark:text-white/60">Client Secret:</p>
                        <p className="text-xs font-mono">
                          {user.pathaoConfig.clientSecret ? "••••••••" : "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-black/50 dark:text-white/50">Not configured</p>
                  )}
                </div>

                {/* Steadfast Config */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                  <p className="text-xs font-semibold text-black/70 dark:text-white/70 mb-2">
                    Steadfast
                  </p>
                  {user.steadfastConfig ? (
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-black/60 dark:text-white/60">API Key:</p>
                        <p className="text-xs font-mono">{user.steadfastConfig.apiKey ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-black/60 dark:text-white/60">Secret Key:</p>
                        <p className="text-xs font-mono">
                          {user.steadfastConfig.secretKey ? "••••••••" : "-"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-black/50 dark:text-white/50">Not configured</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Configuration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Notification Configuration
                </h3>
              </div>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                {user.notificationConfig ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-black/60 dark:text-white/60">Email:</p>
                      <p className="text-xs font-medium">{user.notificationConfig.email ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-black/60 dark:text-white/60">WhatsApp:</p>
                      <p className="text-xs font-medium">{user.notificationConfig.whatsapp ?? "-"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-black/50 dark:text-white/50">Not configured</p>
                )}
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Activity Timeline
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Created At</p>
                  <p className="text-xs font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Last Updated</p>
                  <p className="text-xs font-medium">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
                  </p>
                </div>
                {user.deletedAt && (
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60">Deleted At</p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
                      {new Date(user.deletedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>


            {/* Invoice Information Section */}
            {user.invoices && user.invoices.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Invoices ({user.invoices.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {user.invoices.map((invoice) => {
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

                    return (
                      <div key={invoice.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              {invoice.invoiceNumber}
                            </h4>
                            <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                              {invoice.transactionId}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(invoice.status)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoicePDF(invoice)}
                              className="h-8 px-3 bg-purple-500 hover:bg-purple-600 text-white border-purple-500 flex items-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60">Total Amount</p>
                            <p className="font-semibold">৳{parseFloat(invoice.totalAmount).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60">Paid Amount</p>
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              ৳{parseFloat(invoice.paidAmount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60">Due Amount</p>
                            <p className="font-semibold text-red-600 dark:text-red-400">
                              ৳{parseFloat(invoice.dueAmount).toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60">Type</p>
                            <p className="font-medium capitalize">{invoice.amountType}</p>
                          </div>
                        </div>

                        {/* Bank Payment Info */}
                        {invoice.bankPayment && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-semibold text-black/70 dark:text-white/70 mb-2">
                              Bank Payment Details
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Bank Name</p>
                                <p className="text-xs font-medium">{invoice.bankPayment.bankName}</p>
                              </div>
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Amount</p>
                                <p className="text-xs font-medium">৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Account Last Digits</p>
                                <p className="text-xs font-medium">{invoice.bankPayment.accLastDigit}</p>
                              </div>
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Payment Status</p>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                  invoice.bankPayment.status === 'verified' 
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                    : invoice.bankPayment.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                }`}>
                                  {invoice.bankPayment.status.charAt(0).toUpperCase() + invoice.bankPayment.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bkash Payment Info */}
                        {(invoice.bkashPaymentID || invoice.bkashTrxID) && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs font-semibold text-black/70 dark:text-white/70 mb-2">
                              Bkash Payment Details
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {invoice.bkashPaymentID && (
                                <div>
                                  <p className="text-xs text-black/60 dark:text-white/60">Payment ID</p>
                                  <p className="text-xs font-medium">{invoice.bkashPaymentID}</p>
                                </div>
                              )}
                              {invoice.bkashTrxID && (
                                <div>
                                  <p className="text-xs text-black/60 dark:text-white/60">Transaction ID</p>
                                  <p className="text-xs font-medium">{invoice.bkashTrxID}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created At
                              </p>
                              <p className="text-xs font-medium">
                                {new Date(invoice.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Updated At
                              </p>
                              <p className="text-xs font-medium">
                                {new Date(invoice.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md h-[400px]">
          <DialogHeader>
            <DialogTitle>Access Customer Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-6">
            {/* Instructions Section */}
            <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-black/70 dark:text-white/70">
                Set a new password for <span className="font-semibold">{user?.name}</span> to access their account
              </p>
            </div>

            {/* Password Fields Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  New Password
                </h3>
              </div>
              <TextField
                label="Password *"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                register={register}
                name="password"
                error={errors.password}
                autoComplete="new-password"
              />
              <TextField
                label="Confirm Password *"
                type="password"
                placeholder="Re-enter password"
                register={register}
                name="confirmPassword"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                onClick={() => {
                  reset();
                  setIsPasswordModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
              >
                {isUpdating ? "Send Credentials..." : "Send Credentials"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminCustomerDetailPage;


