import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetPriceCalculationMutation,
  useGetCitiesQuery,
  useGetZonesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import { Calculator, DollarSign } from "lucide-react";

const PriceCalculator = () => {
  const { t } = useTranslation();
  const [calculatePrice, { isLoading }] = useGetPriceCalculationMutation();
  const { data: citiesData } = useGetCitiesQuery();
  const [selectedCity, setSelectedCity] = useState("");
  const { data: zonesData } = useGetZonesQuery(selectedCity, { skip: !selectedCity });
  const [priceData, setPriceData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      recipient_city: "",
      recipient_zone: "",
      delivery_type: 48,
      item_type: 2,
      item_weight: 0.5,
    },
  });

  const watchCity = watch("recipient_city");

  React.useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("recipient_zone", "");
    }
  }, [watchCity, setValue]);

  const onSubmit = async (data) => {
    try {
      const calculationData = {
        recipient_city: Number(data.recipient_city),
        recipient_zone: Number(data.recipient_zone),
        delivery_type: Number(data.delivery_type),
        item_type: Number(data.item_type),
        item_weight: Number(data.item_weight),
      };

      const result = await calculatePrice(calculationData).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        setPriceData(result.data?.data);
        toast.success(t("pathao.priceCalculatedSuccess"));
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.priceCalculateFailed");
      toast.error(errorMessage);
      console.error("Price calculation error:", error);
    }
  };

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Calculator className="h-5 w-5" />
        {t("pathao.deliveryPriceCalculator")}
      </h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        {t("pathao.priceCalculatorDesc")}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("pathao.city")}
            </label>
            <select
              {...register("recipient_city", { required: t("pathao.cityRequired") })}
              className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value="">{t("pathao.selectCity")}</option>
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.city_name}
                </option>
              ))}
            </select>
            {errors.recipient_city && (
              <span className="text-red-500 text-xs ml-1">{errors.recipient_city.message}</span>
            )}
          </div>

          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("pathao.zone")}
            </label>
            <select
              {...register("recipient_zone", { required: t("pathao.zoneRequired") })}
              className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              disabled={!selectedCity}
            >
              <option value="">{t("pathao.selectZone")}</option>
              {zones.map((zone) => (
                <option key={zone.zone_id} value={zone.zone_id}>
                  {zone.zone_name}
                </option>
              ))}
            </select>
            {errors.recipient_zone && (
              <span className="text-red-500 text-xs ml-1">{errors.recipient_zone.message}</span>
            )}
          </div>

          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              Delivery Type *
            </label>
            <select
              {...register("delivery_type", { required: "Delivery type is required" })}
              className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value={48}>Normal Delivery</option>
              <option value={12}>On Demand Delivery</option>
            </select>
          </div>

          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              Item Type *
            </label>
            <select
              {...register("item_type", { required: "Item type is required" })}
              className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value={1}>Document</option>
              <option value={2}>Parcel</option>
            </select>
          </div>

          <TextField
            label="Item Weight (kg) *"
            name="item_weight"
            type="number"
            step="0.1"
            register={register}
            registerOptions={{
              required: "Weight is required",
              min: { value: 0.1, message: "Minimum weight is 0.1 kg" },
            }}
            placeholder="0.5"
            error={errors.item_weight}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isLoading} className="w-full md:w-auto">
          <Calculator className="h-4 w-4 mr-2" />
          {t("pathao.calculatePrice")}
        </PrimaryButton>
      </form>

      {/* Price Result */}
      {priceData && (
        <div className="mt-6 p-6 border border-gray-100 dark:border-gray-800 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-semibold">{t("pathao.estimatedDeliveryCharge")}</h4>
              <p className="text-xs text-black/60 dark:text-white/60">{t("pathao.basedOnInputs")}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-lg">
              <p className="text-sm text-black/50 dark:text-white/50 mb-1">{t("pathao.basePrice")}</p>
              <p className="text-2xl font-bold">৳{priceData.price || "0"}</p>
            </div>
            {priceData.additional_charge > 0 && (
              <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-lg">
                <p className="text-sm text-black/50 dark:text-white/50 mb-1">{t("pathao.additionalCharge")}</p>
                <p className="text-2xl font-bold">৳{priceData.additional_charge}</p>
              </div>
            )}
          </div>

          {priceData.service_type && (
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded text-sm">
              <span className="text-black/60 dark:text-white/60">{t("pathao.serviceType")}: </span>
              <span className="font-medium">{priceData.service_type}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;
