import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Clock, CheckCircle, XCircle, Download, FileText } from "lucide-react";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";

const BillingSettings = ({ user: userFromApi }) => {
    const { t } = useTranslation();
    const authUser = useSelector((state) => state.auth.user);
    const user = userFromApi ?? authUser ?? null;

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
            toast.success(t("settings.invoiceDownloaded"));
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error(t("settings.invoiceDownloadFailed"));
        }
    };

    if (!user?.invoices || user.invoices.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                {t("settings.noInvoices")}
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t("settings.myInvoices")} ({user.invoices.length})
            </h2>
            <div className="space-y-4">
                {user.invoices.map((invoice) => {
                    const getStatusBadge = (status) => {
                        const statusConfig = {
                            pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Clock },
                            paid: { color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle },
                            cancelled: { color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: XCircle },
                        };
                        const config = statusConfig[status] || statusConfig.pending;
                        const Icon = config.icon;
                        return (
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
                                <Icon className="h-4 w-4" />
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                        );
                    };

                    return (
                        <Card key={invoice.id} className="border border-gray-100 dark:border-gray-800">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-base flex items-center gap-2">
                                                <CreditCard className="h-5 w-5" />
                                                {invoice.invoiceNumber}
                                            </h4>
                                            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                                                {invoice.transactionId}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getStatusBadge(invoice.status)}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadInvoicePDF(invoice)}
                                                className="h-9 px-4 bg-purple-500 hover:bg-purple-600 text-white border-purple-500 flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                                {t("settings.downloadPdf")}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                        <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">{t("settings.totalAmount")}</p>
                                            <p className="text-base font-semibold">৳{parseFloat(invoice.totalAmount).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">{t("settings.paidAmount")}</p>
                                            <p className="text-base font-semibold text-green-600 dark:text-green-400">
                                                ৳{parseFloat(invoice.paidAmount).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">{t("settings.dueAmount")}</p>
                                            <p className="text-base font-semibold text-red-600 dark:text-red-400">
                                                ৳{parseFloat(invoice.dueAmount).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-black/60 dark:text-white/60">{t("settings.type")}</p>
                                            <p className="text-base font-medium capitalize">{invoice.amountType}</p>
                                        </div>
                                    </div>

                                    {/* Bank Payment Info */}
                                    {invoice.bankPayment && (
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">
                                                {t("settings.bankPaymentDetails")}
                                            </p>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs text-black/60 dark:text-white/60">{t("settings.bankName")}</p>
                                                    <p className="text-sm font-medium">{invoice.bankPayment.bankName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black/60 dark:text-white/60">{t("settings.amount")}</p>
                                                    <p className="text-sm font-medium">৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black/60 dark:text-white/60">{t("settings.accountLastDigits")}</p>
                                                    <p className="text-sm font-medium">{invoice.bankPayment.accLastDigit}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-black/60 dark:text-white/60">{t("settings.paymentStatus")}</p>
                                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${invoice.bankPayment.status === 'verified'
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
                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                                            <p className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">
                                                {t("settings.bkashPaymentDetails")}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {invoice.bkashPaymentID && (
                                                    <div>
                                                        <p className="text-xs text-black/60 dark:text-white/60">{t("settings.paymentId")}</p>
                                                        <p className="text-sm font-medium">{invoice.bkashPaymentID}</p>
                                                    </div>
                                                )}
                                                {invoice.bkashTrxID && (
                                                    <div>
                                                        <p className="text-xs text-black/60 dark:text-white/60">{t("settings.transactionId")}</p>
                                                        <p className="text-sm font-medium">{invoice.bkashTrxID}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default BillingSettings;
