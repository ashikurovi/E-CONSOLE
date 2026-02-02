import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useGetPriceCalculationMutation,
  useGetCitiesQuery,
  useGetZonesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, DollarSign, Loader2 } from "lucide-react";

const PriceCalculator = () => {
  const { t } = useTranslation();
  const [calculatePrice, { isLoading }] = useGetPriceCalculationMutation();
  const { data: citiesData } = useGetCitiesQuery();

  const [selectedCity, setSelectedCity] = useState("");
  const { data: zonesData } = useGetZonesQuery(selectedCity, {
    skip: !selectedCity,
  });
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

  useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("recipient_zone", "");
    }
  }, [watchCity, setValue]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        recipient_city: Number(data.recipient_city),
        recipient_zone: Number(data.recipient_zone),
        delivery_type: Number(data.delivery_type),
        item_type: Number(data.item_type),
        item_weight: Number(data.item_weight),
      };

      const result = await calculatePrice(payload).unwrap();

      if (result?.code === 200 || result?.type === "success") {
        setPriceData(result.data?.data);
        toast.success(t("pathao.priceCalculatedSuccess"));
      }
    } catch (error) {
      toast.error(error?.data?.message || t("pathao.priceCalculateFailed"));
    }
  };

  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];

  return (
    <Card className="max-w-5xl mx-auto bg-transparent border-none shadow-none">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
          <Calculator className="w-6 h-6 text-violet-600" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">
            {t("pathao.deliveryPriceCalculator")}
          </h2>
          <p className="text-sm text-gray-500">
            {t("pathao.priceCalculatorDesc")}
          </p>
        </div>
      </div>

      {/* Calculator Form */}
      <Card className="border border-dashed rounded-2xl bg-white">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* City */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("pathao.city")}
                </label>
                <select
                  {...register("recipient_city", {
                    required: t("pathao.cityRequired"),
                  })}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">{t("pathao.selectCity")}</option>
                  {cities.map((city) => (
                    <option key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </option>
                  ))}
                </select>
                {errors.recipient_city && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.recipient_city.message}
                  </p>
                )}
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("pathao.zone")}
                </label>
                <select
                  {...register("recipient_zone", {
                    required: t("pathao.zoneRequired"),
                  })}
                  disabled={!selectedCity}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-violet-500 disabled:bg-gray-100"
                >
                  <option value="">{t("pathao.selectZone")}</option>
                  {zones.map((zone) => (
                    <option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name}
                    </option>
                  ))}
                </select>
                {errors.recipient_zone && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.recipient_zone.message}
                  </p>
                )}
              </div>

              {/* Delivery Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Type
                </label>
                <select
                  {...register("delivery_type")}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-violet-500"
                >
                  <option value={48}>Normal Delivery</option>
                  <option value={12}>On Demand Delivery</option>
                </select>
              </div>

              {/* Item Type */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Item Type
                </label>
                <select
                  {...register("item_type")}
                  className="h-11 w-full rounded-lg border border-gray-200 px-4 text-sm focus:ring-2 focus:ring-violet-500"
                >
                  <option value={1}>Document</option>
                  <option value={2}>Parcel</option>
                </select>
              </div>

              {/* Weight */}
              <TextField
                label="Item Weight (kg)"
                name="item_weight"
                type="number"
                step="0.1"
                register={register}
                registerOptions={{
                  required: "Weight is required",
                  min: {
                    value: 0.1,
                    message: "Minimum weight is 0.1kg",
                  },
                }}
                placeholder="0.5"
                error={errors.item_weight}
                inputClassName="h-11 rounded-lg border-gray-200"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-6 h-11"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4 mr-2" />
                )}
                {t("pathao.calculatePrice")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Price Result */}
      {priceData && (
        <Card className="mt-8 rounded-2xl border bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">
                  {t("pathao.estimatedDeliveryCharge")}
                </h4>
                <p className="text-sm text-gray-500">
                  {t("pathao.basedOnInputs")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-gray-50">
                <p className="text-sm text-gray-500 mb-1">
                  {t("pathao.basePrice")}
                </p>
                <p className="text-3xl font-bold">৳{priceData.price}</p>
              </div>

              {priceData.additional_charge > 0 && (
                <div className="p-5 rounded-xl border bg-gray-50">
                  <p className="text-sm text-gray-500 mb-1">
                    {t("pathao.additionalCharge")}
                  </p>
                  <p className="text-3xl font-bold">
                    ৳{priceData.additional_charge}
                  </p>
                </div>
              )}
            </div>

            {priceData.service_type && (
              <p className="mt-4 text-sm text-gray-600">
                <span className="font-medium">{t("pathao.serviceType")}:</span>{" "}
                {priceData.service_type}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </Card>
  );
};

export default PriceCalculator;
