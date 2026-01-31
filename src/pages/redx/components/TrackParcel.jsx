import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useLazyTrackParcelQuery,
  useLazyGetParcelInfoQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/buttons/primary-button";
import { Search, Package, MapPin, Clock } from "lucide-react";
import { useForm } from "react-hook-form";

const STATUS_BN = {
  "in transit": "পথ অতিক্রমণ করছে",
  "in-transit": "পথ অতিক্রমণ করছে",
  delivered: "ডেলিভারি সম্পন্ন",
  "out for delivery": "ডেলিভারির জন্য বের হয়েছে",
  "out-for-delivery": "ডেলিভারির জন্য বের হয়েছে",
  "picked up": "কুরিয়ার দ্বারা সংগ্রহ করা হয়েছে",
  "picked-up": "কুরিয়ার দ্বারা সংগ্রহ করা হয়েছে",
  processing: "প্রক্রিয়াধীন",
  pending: "অপেক্ষমাণ",
};

const TrackParcel = () => {
  const { t, i18n } = useTranslation();
  const [trackParcel, { data: trackData, isLoading: isLoadingTrack }] =
    useLazyTrackParcelQuery();
  const [getParcelInfo, { data: parcelInfoData, isLoading: isLoadingInfo }] =
    useLazyGetParcelInfoQuery();

  const [searchValue, setSearchValue] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    const trackingId = (data.tracking_id || "").trim();
    if (!trackingId) {
      toast.error(t("redx.trackingIdRequired"));
      return;
    }
    setSearchValue(trackingId);
    setHasSearched(true);
    try {
      await Promise.all([
        trackParcel(trackingId).unwrap(),
        getParcelInfo(trackingId).unwrap(),
      ]);
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("redx.trackParcelFailed");
      toast.error(errorMessage);
    }
  };

  const parcel = parcelInfoData?.parcel;
  const trackingUpdates = trackData?.tracking || [];

  const isLoading = isLoadingTrack || isLoadingInfo;

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search className="h-5 w-5" />
        {t("redx.trackParcel")}
      </h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        {t("redx.trackParcelDesc")}
      </p>

      <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
          <div className="flex-1">
            <input
              {...register("tracking_id", {
                required: t("redx.trackingIdRequired"),
              })}
              placeholder={t("redx.enterTrackingId")}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-red-500 dark:focus:border-red-500 dark:text-white/90 rounded"
            />
            {errors.tracking_id && (
              <span className="text-red-500 text-xs ml-1">
                {errors.tracking_id.message}
              </span>
            )}
          </div>
          <PrimaryButton type="submit" isLoading={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            {t("redx.track")}
          </PrimaryButton>
        </form>
      </div>

      {hasSearched && parcel && (
        <div className="space-y-6">
          <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-[#242424]">
            <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t("redx.parcelDetails")}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("redx.trackingId")}
                </label>
                <p className="font-medium">{parcel.tracking_id}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("redx.merchantInvoiceId")}
                </label>
                <p className="font-medium">{parcel.merchant_invoice_id || "-"}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("common.status")}
                </label>
                <span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium capitalize">
                  {i18n.language === "bn" && parcel.status
                    ? (STATUS_BN[parcel.status?.toLowerCase()] ?? STATUS_BN[parcel.status?.replace(/\s+/g, "-").toLowerCase()] ?? parcel.status?.replace(/-/g, " "))
                    : parcel.status?.replace(/-/g, " ")}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("redx.cashCollectionAmount")}
                </label>
                <p className="font-semibold">৳{parcel.cash_collection_amount}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("common.name")}
                </label>
                <p className="font-medium">{parcel.customer_name}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                  {t("customers.phone")}
                </label>
                <p className="font-medium">{parcel.customer_phone}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {t("redx.customerAddress")}
                </label>
                <p className="font-medium">{parcel.customer_address}</p>
              </div>
            </div>
          </div>

          {trackingUpdates.length > 0 && (
            <div className="p-4 border border-black/10 dark:border-white/10 rounded-lg bg-white dark:bg-[#242424]">
              <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {t("redx.trackingHistory")}
              </h4>
              <div className="space-y-3">
                {trackingUpdates.map((update, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 border-l-2 border-red-500/50 bg-black/5 dark:bg-white/5 rounded-r"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {i18n.language === "bn"
                          ? (update.message_bn || update.messageBn || update.message_en || update.messageEn)
                          : (update.message_en || update.messageEn || update.message_bn || update.messageBn)}
                      </p>
                      {update.time && (
                        <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                          {new Date(update.time).toLocaleString(i18n.language === "bn" ? "bn-BD" : undefined)}
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

      {hasSearched && !parcel && !isLoading && (
        <div className="p-8 text-center border border-black/10 dark:border-white/10 rounded-lg bg-black/5 dark:bg-white/5">
          <Package className="h-12 w-12 mx-auto mb-3 text-black/30 dark:text-white/30" />
          <p className="text-black/60 dark:text-white/60">
            {t("redx.parcelNotFound")}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackParcel;
