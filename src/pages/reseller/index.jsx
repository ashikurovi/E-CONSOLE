import React from "react";
import toast from "react-hot-toast";
import {
  useGetResellerSummaryQuery,
  useGetResellerPayoutsQuery,
  useRequestResellerPayoutMutation,
  useLazyGetPayoutInvoiceQuery,
} from "@/features/reseller/resellerApiSlice";
import { Download } from "lucide-react";

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
        <h1>Reseller Payout Invoice</h1>
        <div class="meta">Invoice # ${data.invoiceNumber}</div>
        <table>
          <tr><th>Reseller</th><td>${data.resellerName}</td></tr>
          <tr><th>Company</th><td>${data.companyName || "—"}</td></tr>
          <tr><th>Paid at</th><td>${formatDate(data.paidAt)}</td></tr>
          <tr><th>Requested at</th><td>${formatDate(data.requestedAt)}</td></tr>
          <tr><th>Amount</th><td><strong>${Number(data.amount).toFixed(2)}</strong></td></tr>
        </table>
        <p class="total">Total: ${Number(data.amount).toFixed(2)}</p>
        <p style="margin-top: 24px; font-size: 0.75rem; color: #888;">Thank you for your business.</p>
        <script>window.onload = function() { window.print(); }<\/script>
      </body>
    </html>
  `);
  w.document.close();
};

const ResellerDashboardPage = () => {
  const { data: summary, isLoading: summaryLoading } = useGetResellerSummaryQuery();
  const { data: payouts, isLoading: payoutsLoading } = useGetResellerPayoutsQuery();
  const [requestPayout, { isLoading: requesting }] = useRequestResellerPayoutMutation();
  const [getPayoutInvoice, { isLoading: invoiceLoading }] = useLazyGetPayoutInvoiceQuery();

  const handleRequestPayout = async () => {
    try {
      await requestPayout().unwrap();
      toast.success("Payout request created successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to request payout");
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
      <h1 className="text-2xl font-bold">Reseller Dashboard</h1>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold">
            {summaryLoading ? "..." : summary?.totalProducts ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Sold Qty</p>
          <p className="text-2xl font-semibold">
            {summaryLoading ? "..." : summary?.totalSoldQty ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Earning</p>
          <p className="text-2xl font-semibold">
            {summaryLoading ? "..." : summary?.totalEarning ?? 0}
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Pending Payout</p>
          <p className="text-2xl font-semibold">
            {summaryLoading ? "..." : summary?.pendingPayoutAmount ?? 0}
          </p>
        </div>
      </section>

      <section className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payout Requests</h2>
        <button
          type="button"
          onClick={handleRequestPayout}
          disabled={requesting}
          className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:opacity-50"
        >
          {requesting ? "Requesting..." : "Request Payout"}
        </button>
      </section>

      <section className="bg-white shadow rounded-lg p-4 overflow-x-auto">
        {payoutsLoading ? (
          <p>Loading payouts...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Requested At</th>
                <th className="py-2 pr-4">Paid At</th>
                <th className="py-2 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(payouts ?? []).map((payout) => (
                <tr key={payout.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{payout.id}</td>
                  <td className="py-2 pr-4">{Number(payout.amount).toFixed(2)}</td>
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
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
                  <td className="py-2 pr-4">
                    {payout.createdAt ? new Date(payout.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="py-2 pr-4">
                    {payout.paidAt ? new Date(payout.paidAt).toLocaleString() : "-"}
                  </td>
                  <td className="py-2 pr-4 text-right">
                    {payout.status === "PAID" && (
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(payout.id)}
                        disabled={invoiceLoading}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ResellerDashboardPage;

