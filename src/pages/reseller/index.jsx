import React from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  useGetResellerSummaryQuery,
  useGetResellerPayoutsQuery,
  useLazyGetPayoutInvoiceQuery,
  useMarkResellerPayoutPaidMutation,
} from "@/features/reseller/resellerApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import {
  Download,
  Package,
  Tags,
  Wallet,
  TrendingUp,
  ArrowDownToLine,
} from "lucide-react";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

const openInvoicePrintWindow = (data) => {
  const w = window.open("", "_blank", "width=600,height=700");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html>
    <html>
      <head><title>Invoice ${data.invoiceNumber}</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; }
          h1 { font-size: 1.25rem; margin-bottom: 8px; }
          .meta { color: #666; font-size: 0.875rem; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #eee; }
          th { color: #666; font-weight: 500; }
          .total { font-size: 1.25rem; font-weight: 700; margin-top: 16px; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Reseller Commission Invoice</h1>
        <div class="meta">Invoice # ${data.invoiceNumber}</div>
        <table>
          <tr><th>Reseller</th><td>${data.resellerName}</td></tr>
          <tr><th>Company</th><td>${data.companyName || "—"}</td></tr>
          <tr><th>Paid at</th><td>${formatDate(data.paidAt)}</td></tr>
          <tr><th>Requested at</th><td>${formatDate(data.requestedAt)}</td></tr>
          <tr><th>Commission Amount</th><td><strong>${Number(data.amount).toFixed(2)}</strong></td></tr>
        </table>
        <p class="total">Total Commission: ${Number(data.amount).toFixed(2)}</p>
        <p style="margin-top: 24px; font-size: 0.75rem; color: #888;">Thank you for your business.</p>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  w.document.close();
};

const ResellerDashboardPage = () => {
  const { data: user } = useGetCurrentUserQuery();
  const { data: summary, isLoading: summaryLoading } = useGetResellerSummaryQuery();
  const { data: payouts, isLoading: payoutsLoading } = useGetResellerPayoutsQuery();
  const [getPayoutInvoice, { isLoading: invoiceLoading }] = useLazyGetPayoutInvoiceQuery();
  const [markPaid, { isLoading: markingPaid }] = useMarkResellerPayoutPaidMutation();

  const handleMarkPaid = async (payoutId) => {
    try {
      await markPaid(payoutId).unwrap();
      toast.success("Commission marked as paid");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to mark as paid");
    }
  };

  const handleDownloadInvoice = async (payoutId) => {
    try {
      const data = await getPayoutInvoice(payoutId).unwrap();
      openInvoicePrintWindow(data);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to load invoice");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {user?.name || user?.fullName
              ? `Welcome, ${user.name || user.fullName}`
              : "Reseller Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Get a quick overview of your products, sales, and the commission you owe to the admin.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/products/create"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:hover:bg-slate-800"
          >
            <Package className="h-4 w-4" />
            Add Product
          </Link>
          <Link
            to="/categories/create"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Tags className="h-4 w-4" />
            Add Category
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Products
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalProducts ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Sold Qty
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalSoldQty ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Total Sales (Revenue)
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.totalEarning ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Pending Commission (to Admin)
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
                {summaryLoading ? "…" : summary?.pendingPayoutAmount ?? 0}
              </p>
            </div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            Commission History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Every 7 days the system calculates how much commission you owe to the admin based on your delivered sales.
            Admin will handle the actual payment collection; here you can only view your commission records and invoices.
          </p>
        </div>

        <div className="overflow-x-auto">
          {payoutsLoading ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Loading payouts...
            </p>
          ) : !payouts || payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <ArrowDownToLine className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No payout requests yet
              </p>
              <p className="max-w-sm text-xs text-slate-500 dark:text-slate-400">
                When admin creates a commission request for you, it will appear here with its status.
              </p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Requested At</th>
                  <th className="py-2 pr-4">Paid At</th>
                  <th className="py-2 pr-4">Payment Details</th>
                  <th className="py-2 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(payouts ?? []).map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-200">
                      {payout.id}
                    </td>
                    <td className="py-2 pr-4 text-slate-900 dark:text-slate-50">
                      {Number(payout.amount).toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          payout.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            : payout.status === "PENDING"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                      {payout.createdAt
                        ? new Date(payout.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">
                      {payout.paidAt
                        ? new Date(payout.paidAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line max-w-xs">
                      {payout.paymentDetails || "-"}
                    </td>
                    <td className="py-2 pr-4 text-right space-x-2">
                      {payout.status === "PENDING" && (
                        <button
                          type="button"
                          onClick={() => handleMarkPaid(payout.id)}
                          disabled={markingPaid}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark as Paid
                        </button>
                      )}
                      {payout.status === "PAID" && (
                        <button
                          type="button"
                          onClick={() => handleDownloadInvoice(payout.id)}
                          disabled={invoiceLoading}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download invoice
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResellerDashboardPage;

