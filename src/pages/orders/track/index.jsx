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
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/orders")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {t("orders.trackOrder")}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60 mt-0.5">
            {t("orders.trackOrderDesc")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={t("orders.enterTrackingId")}
            className="flex-1 border border-black/10 dark:border-white/10 py-2.5 px-4 bg-white dark:bg-[#242424] w-full outline-none focus:ring-2 focus:ring-primary/20 rounded"
          />
          <PrimaryButton type="submit" isLoading={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {t("orders.track")}
          </PrimaryButton>
        </div>
      </form>

      {hasSearched && isFound && (
        <div className="space-y-6">
          <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("orders.orderDetails")}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("orders.courier")}
                </label>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${getCourierColor(
                    order.courier
                  )}`}
                >
                  {order.courier}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("orders.trackingId")}
                </label>
                <p className="font-medium">{order.tracking_id || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("common.status")}
                </label>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                    order.status
                  )}`}
                >
                  {i18n.language === "bn" && order.status
                    ? (STATUS_BN[order.status?.toLowerCase()] ?? STATUS_BN[order.status?.replace(/\s+/g, "-").toLowerCase()] ?? order.status)
                    : order.status}
                </span>
              </div>
            </div>
          </div>

          {order.tracking?.length > 0 && (
            <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("orders.trackingHistory")}
              </h4>
              <div className="space-y-3">
                {order.tracking.map((d, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 border-l-2 border-primary/50 bg-black/5 dark:bg-white/5 rounded-r"
                  >
                    <div className="flex-1">
                      {d.previousStatus && (
                        <p className="text-xs text-black/50 dark:text-white/50 mb-0.5">
                          {i18n.language === "bn" ? "পূর্ববর্তী: " : "Previous: "}
                          <span className="font-medium">
                            {i18n.language === "bn" && d.previousStatus
                              ? (STATUS_BN[d.previousStatus?.toLowerCase()] ?? STATUS_BN[d.previousStatus?.replace(/\s+/g, "-").toLowerCase()] ?? d.previousStatus)
                              : d.previousStatus}
                          </span>
                          {" → "}
                          <span className="font-medium">
                            {i18n.language === "bn" && d.status
                              ? (STATUS_BN[d.status?.toLowerCase()] ?? STATUS_BN[d.status?.replace(/\s+/g, "-").toLowerCase()] ?? d.status)
                              : d.status}
                          </span>
                        </p>
                      )}
                      {(d.messageEn || d.messageBn) && (
                        <p className="text-sm font-medium">
                          {i18n.language === "bn" ? (d.messageBn || d.messageEn) : (d.messageEn || d.messageBn)}
                        </p>
                      )}
                      {d.time && (
                        <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                          {new Date(d.time).toLocaleString(i18n.language === "bn" ? "bn-BD" : undefined)}
                        </p>
                      )}
                      {d.reason && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          {i18n.language === "bn" ? "মন্তব্য: " : "Comment: "}{d.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasSearched && !isFound && !isLoading && (
        <div className="p-8 text-center border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
          <Package className="h-12 w-12 mx-auto mb-3 text-black/30 dark:text-white/30" />
          <p className="text-black/60 dark:text-white/60">
            {order?.tracking?.[0]?.messageEn || order?.tracking?.[0]?.messageBn || t("orders.orderNotFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTrackPage;
