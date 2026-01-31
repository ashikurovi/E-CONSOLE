import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useLazyCalculateChargeQuery,
  useGetAreasQuery,
} from "@/features/redx/redxApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import { Calculator, DollarSign } from "lucide-react";

const PriceCalculator = () => {
  const { t } = useTranslation();
  const [calculateCharge, { isLoading }] = useLazyCalculateChargeQuery();
  const { data: areasData } = useGetAreasQuery();

  const [chargeData, setChargeData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      delivery_area_id: "",
      pickup_area_id: "",
      cash_collection_amount: 1000,
      weight: 500,
    },
  });

  const areas = areasData?.areas || [];

  const onSubmit = async (data) => {
    try {
      const result = await calculateCharge({
        deliveryAreaId: Number(data.delivery_area_id),
        pickupAreaId: Number(data.pickup_area_id),
        cashCollectionAmount: Number(data.cash_collection_amount),
        weight: Number(data.weight),
      }).unwrap();

      setChargeData(result);
      toast.success(t("redx.priceCalculatedSuccess"));
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("redx.priceCalculateFailed");
      toast.error(errorMessage);
      console.error("Price calculation error:", error);
    }
  };

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5" />
        {t("redx.deliveryPriceCalculator")}
      </h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        {t("redx.priceCalculatorDesc")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("redx.pickupArea")} *
            </label>
            <select
              {...register("pickup_area_id", { required: t("redx.pickupAreaRequired") })}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value="">{t("redx.selectArea")}</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.division_name})
                </option>
              ))}
            </select>
            {errors.pickup_area_id && (
              <span className="text-red-500 text-xs ml-1">
                {errors.pickup_area_id.message}
              </span>
            )}
          </div>

          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("redx.deliveryArea")} *
            </label>
            <select
              {...register("delivery_area_id", { required: t("redx.deliveryAreaRequired") })}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value="">{t("redx.selectArea")}</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name} ({area.division_name})
                </option>
              ))}
            </select>
            {errors.delivery_area_id && (
              <span className="text-red-500 text-xs ml-1">
                {errors.delivery_area_id.message}
              </span>
            )}
          </div>

          <TextField
            label={t("redx.cashCollectionAmount")}
            name="cash_collection_amount"
            type="number"
            register={register}
            registerOptions={{
              required: t("redx.amountRequired"),
              min: { value: 0, message: t("redx.amountMin") },
            }}
            placeholder="1000"
            error={errors.cash_collection_amount}
          />

          <TextField
            label={t("redx.weightGrams")}
            name="weight"
            type="number"
            register={register}
            registerOptions={{
              required: t("redx.weightRequired"),
              min: { value: 1, message: t("redx.minWeight") },
            }}
            placeholder="500"
            error={errors.weight}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isLoading} className="w-full md:w-auto">
          <Calculator className="h-4 w-4 mr-2" />
          {t("redx.calculatePrice")}
        </PrimaryButton>
      </form>

      {chargeData && (
        <div className="mt-6 p-6 border border-black/10 dark:border-white/10 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold">{t("redx.estimatedDeliveryCharge")}</h4>
              <p className="text-xs text-black/60 dark:text-white/60">
                {t("redx.basedOnInputs")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#242424] rounded-lg">
              <p className="text-sm text-black/50 dark:text-white/50 mb-1">
                {t("redx.deliveryCharge")}
              </p>
              <p className="text-2xl font-bold">
                ৳{chargeData.deliveryCharge ?? chargeData.delivery_charge ?? "0"}
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-[#242424] rounded-lg">
              <p className="text-sm text-black/50 dark:text-white/50 mb-1">
                {t("redx.codCharge")}
              </p>
              <p className="text-2xl font-bold">
                ৳{chargeData.codCharge ?? chargeData.cod_charge ?? "0"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
