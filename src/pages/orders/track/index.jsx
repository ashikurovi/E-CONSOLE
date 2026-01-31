import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLazyTrackOrderUnifiedQuery } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import { Search, Package, Truck, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PrimaryButton from "@/components/buttons/primary-button";

const STATUS_BN = {
  "in transit": "পথ অতিক্রমণ করছে",
  "in-transit": "পথ অতিক্রমণ করছে",
  delivered: "ডেলিভারি সম্পন্ন",
  shipped: "পাঠানো হয়েছে",
  processing: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
  paid: "পেইড",
  cancelled: "বাতিল",
  refunded: "রিফান্ড",
  "out for delivery": "ডেলিভারির জন্য বের হয়েছে",
  "out-for-delivery": "ডেলিভারির জন্য বের হয়েছে",
  "not found": "পাওয়া যায়নি",
  error: "ত্রুটি",
};

const OrderTrackPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const trackingIdFromUrl = searchParams.get("trackingId")?.trim();

  const [trackOrderUnified, { data: trackData, isLoading }] =
    useLazyTrackOrderUnifiedQuery();
  const [searchValue, setSearchValue] = useState(trackingIdFromUrl || "");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (trackingIdFromUrl) {
      setSearchValue(trackingIdFromUrl);
      setHasSearched(true);
      trackOrderUnified(trackingIdFromUrl).catch(() => {});
    }
  }, [trackingIdFromUrl, trackOrderUnified]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const id = searchValue.trim();
    if (!id) {
      toast.error(t("orders.trackingIdRequired"));
      return;
    }
    setHasSearched(true);
    try {
      await trackOrderUnified(id).unwrap();
    } catch (error) {
      const msg = error?.data?.message || t("orders.orderNotFound");
      toast.error(msg);
    }
  };

  const order = trackData;
  const isFound = order && order.courier !== "Unknown";
  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      "in transit": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      shipped: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
      refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
      "not found": "bg-red-500/10 text-red-600 dark:text-red-400",
      error: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return map[s] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  const getCourierColor = (courier) => {
    const c = (courier || "").toLowerCase();
    const map = {
      redx: "bg-red-500/10 text-red-600 dark:text-red-400",
      steadfast: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      pathao: "bg-green-500/10 text-green-600 dark:text-green-400",
      squadcart: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };
    return map[c] ?? "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-[#0b0f14] dark:via-[#11161d] dark:to-[#0b0f14] z-0" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent blur-3xl z-0" />

      <div className="relative z-10 p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
              className="rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
                {t("orders.trackOrder")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-2">
                <Truck className="h-4 w-4" />
                {t("orders.trackOrderDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 rounded-3xl border border-white/60 dark:border-white/10 p-8 relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none" />
           
           <form onSubmit={handleSubmit} className="relative z-10 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={t("orders.enterTrackingId")}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/30 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg"
              />
            </div>
            <PrimaryButton type="submit" isLoading={isLoading} className="rounded-xl px-8 text-lg font-medium shadow-lg shadow-blue-500/20">
              {t("orders.track")}
            </PrimaryButton>
          </form>
        </div>

        {/* Results */}
        {hasSearched && isFound && (
          <div className="space-y-6">
            {/* Order Info Card */}
            <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-xl border border-white/60 dark:border-white/10 p-8 relative overflow-hidden">
              <h4 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <Package className="h-5 w-5" />
                {t("orders.orderDetails")}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                    {t("orders.courier")}
                  </label>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold capitalize ${getCourierColor(order.courier)}`}>
                    {order.courier}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                    {t("orders.trackingId")}
                  </label>
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{order.tracking_id || "-"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">
                    {t("common.status")}
                  </label>
                  <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-bold capitalize ${getStatusColor(order.status)}`}>
                    {i18n.language === "bn" && order.status
                      ? (STATUS_BN[order.status?.toLowerCase()] ?? STATUS_BN[order.status?.replace(/\s+/g, "-").toLowerCase()] ?? order.status)
                      : order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {order.tracking?.length > 0 && (
              <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-xl border border-white/60 dark:border-white/10 p-8 relative overflow-hidden">
                <h4 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5" />
                  {t("orders.trackingHistory")}
                </h4>
                <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                  {order.tracking.map((d, i) => (
                    <div key={i} className="relative pl-8">
                      {/* Dot */}
                      <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900 shadow-md" />
                      
                      <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 hover:bg-white/60 dark:hover:bg-black/30 transition-all">
                        {d.previousStatus && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                             <span className="font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                                {i18n.language === "bn" && d.previousStatus
                                  ? (STATUS_BN[d.previousStatus?.toLowerCase()] ?? STATUS_BN[d.previousStatus?.replace(/\s+/g, "-").toLowerCase()] ?? d.previousStatus)
                                  : d.previousStatus}
                             </span>
                             <ArrowLeft className="h-3 w-3 rotate-180" />
                             <span className="font-medium px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                {i18n.language === "bn" && d.status
                                  ? (STATUS_BN[d.status?.toLowerCase()] ?? STATUS_BN[d.status?.replace(/\s+/g, "-").toLowerCase()] ?? d.status)
                                  : d.status}
                             </span>
                          </div>
                        )}
                        
                        {(d.messageEn || d.messageBn) && (
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">
                            {i18n.language === "bn" ? (d.messageBn || d.messageEn) : (d.messageEn || d.messageBn)}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {d.time && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(d.time).toLocaleString(i18n.language === "bn" ? "bn-BD" : undefined)}
                            </span>
                          )}
                          {d.reason && (
                            <span className="text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/10 px-2 py-0.5 rounded">
                              {i18n.language === "bn" ? "মন্তব্য: " : "Comment: "}{d.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {hasSearched && !isFound && !isLoading && (
          <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-xl border border-white/60 dark:border-white/10 p-12 text-center relative overflow-hidden">
            <div className="inline-flex p-4 rounded-full bg-red-50 dark:bg-red-900/10 mb-4">
              <Package className="h-8 w-8 text-red-500 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("orders.orderNotFound")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {order?.tracking?.[0]?.messageEn || order?.tracking?.[0]?.messageBn || t("orders.trackOrderDesc")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackPage;
