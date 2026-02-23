import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  useGetAdminResellersQuery,
  useMarkPayoutPaidMutation,
} from "@/features/reseller/resellerApiSlice";
import {
  Package,
  ShoppingCart,
  DollarSign,
  User,
  Mail,
  CreditCard,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from "lucide-react";

const ResellersListPage = () => {
  const { t } = useTranslation();
  const { data: resellers = [], isLoading } = useGetAdminResellersQuery();
  const [markPaid, { isLoading: markingPaid }] = useMarkPayoutPaidMutation();
  const [expandedId, setExpandedId] = useState(null);

  const handleMarkPaid = async (payoutId) => {
    try {
      await markPaid(payoutId).unwrap();
      toast.success(t("resellers.payoutMarkedPaid") || "Payout marked as paid");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to mark as paid");
    }
  };

  const formatMoney = (n) =>
    Number(n ?? 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("resellers.title") || "Resellers Overview"}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("resellers.subtitle") ||
            "View which reseller added how many products, sold how much, and who requested payment."}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.reseller") || "Reseller"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.productsAdded") || "Products"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.sold") || "Sold"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.earning") || "Earning"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.pendingPayout") || "Pending"}
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  {t("resellers.paymentRequests") || "Payment requests"}
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {resellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {t("resellers.noResellers") || "No resellers found."}
                  </td>
                </tr>
              ) : (
                resellers.map((r) => {
                  const pendingPayouts = (r.payouts || []).filter(
                    (p) => p.status === "PENDING"
                  );
                  const isExpanded = expandedId === r.id;

                  return (
                    <React.Fragment key={r.id}>
                      <tr className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {r.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {r.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            {r.totalProducts ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1">
                            <ShoppingCart className="w-4 h-4 text-gray-400" />
                            {r.totalSoldQty ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                          <span className="inline-flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            {formatMoney(r.totalEarning)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <CreditCard className="w-4 h-4" />
                            {formatMoney(r.pendingPayoutAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {pendingPayouts.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300">
                              {pendingPayouts.length}{" "}
                              {t("resellers.pending") || "pending"}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {(r.payouts || []).length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(isExpanded ? null : r.id)
                              }
                              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </td>
                      </tr>

                      {isExpanded && r.id === expandedId && (
                        <tr className="bg-gray-50 dark:bg-gray-800/30">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                              <p className="px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
                                {t("resellers.payoutHistory") ||
                                  "Payout requests"}
                              </p>
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      ID
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                                      Amount
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Status
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Requested
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Paid at
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium text-gray-600 dark:text-gray-400">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(r.payouts || []).map((p) => (
                                    <tr
                                      key={p.id}
                                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                                    >
                                      <td className="px-3 py-2">{p.id}</td>
                                      <td className="px-3 py-2 text-right font-medium">
                                        {formatMoney(p.amount)}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            p.status === "PAID"
                                              ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                              : p.status === "PENDING"
                                                ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                          }`}
                                        >
                                          {p.status}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                        {p.createdAt
                                          ? new Date(
                                              p.createdAt
                                            ).toLocaleString()
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                        {p.paidAt
                                          ? new Date(
                                              p.paidAt
                                            ).toLocaleString()
                                          : "—"}
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        {p.status === "PENDING" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleMarkPaid(p.id)
                                            }
                                            disabled={markingPaid}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50"
                                          >
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            {t("resellers.approve") ||
                                              t("resellers.markPaid") ||
                                              "Approve"}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResellersListPage;
