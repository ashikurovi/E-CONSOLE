import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useCreateParcelMutation,
  useGetPickupStoresQuery,
  useGetAreasQuery,
  useGetAreasByPostCodeQuery,
  useGetAreasByDistrictQuery,
} from "@/features/redx/redxApiSlice";
import { useGetOrdersQuery, useShipOrderMutation } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";

const CreateOrder = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [createParcel, { isLoading }] = useCreateParcelMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const { data: storesData } = useGetPickupStoresQuery();
  const { data: areasData } = useGetAreasQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [areaSearchType, setAreaSearchType] = useState("all");
  const [postCode, setPostCode] = useState("");
  const [districtName, setDistrictName] = useState("");

  const { data: areasByPostCode } = useGetAreasByPostCodeQuery(postCode, {
    skip: areaSearchType !== "postcode" || !postCode,
  });
  const { data: areasByDistrict } = useGetAreasByDistrictQuery(districtName, {
    skip: areaSearchType !== "district" || !districtName,
  });

  const { data: allOrders = [], isLoading: isLoadingOrders } = useGetOrdersQuery({
    companyId: authUser?.companyId,
  });

  const processingOrders = allOrders.filter(
    (order) => order.status?.toLowerCase() === "processing"
  );

  const orderOptions = useMemo(
    () =>
      processingOrders.map((order) => ({
        label: `Order #${order.id} - ${order.customer?.name || order.customerName || "N/A"} - ${order.totalAmount ? `৳${order.totalAmount}` : "N/A"}`,
        value: order.id,
        orderData: order,
      })),
    [processingOrders]
  );

  const areas =
    areaSearchType === "postcode"
      ? areasByPostCode?.areas || []
      : areaSearchType === "district"
      ? areasByDistrict?.areas || []
      : areasData?.areas || [];

  const pickupStores = storesData?.pickup_stores || [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickup_store_id: "",
      merchant_invoice_id: "",
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      delivery_area: "",
      delivery_area_id: "",
      cash_collection_amount: 0,
      parcel_weight: 500,
      value: 0,
      instruction: "",
    },
  });

  const watchDeliveryArea = watch("delivery_area");

  useEffect(() => {
    const area = areas.find((a) => a.name === watchDeliveryArea);
    if (area) {
      setValue("delivery_area_id", area.id);
    }
  }, [watchDeliveryArea, areas, setValue]);

  const handleOrderSelect = (option) => {
    setSelectedOrder(option);

    if (!option || !option.orderData) {
      reset();
      return;
    }

    const order = option.orderData;
    const items = order.items || order.orderItems || [];

    if (pickupStores.length > 0) {
      setValue("pickup_store_id", pickupStores[0].id.toString());
    }
    setValue("merchant_invoice_id", order.id?.toString() || "");
    setValue("customer_name", order.customer?.name || order.customerName || "");
    setValue("customer_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("customer_address", order.customerAddress || order.billingAddress || "");
    setValue("cash_collection_amount", order.totalAmount?.toString() || "0");
    setValue("value", order.totalAmount?.toString() || "0");
    setValue("parcel_weight", "500");
    setValue("instruction", order.notes || "");
    setValue("delivery_area", "");
    setValue("delivery_area_id", "");

    toast.success(t("redx.orderAutoFilled"));
  };

  const onSubmit = async (data) => {
    try {
      const parcelData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        delivery_area: data.delivery_area,
        delivery_area_id: Number(data.delivery_area_id),
        customer_address: data.customer_address,
        cash_collection_amount: data.cash_collection_amount.toString(),
        parcel_weight: data.parcel_weight.toString(),
        value: data.value.toString(),
        merchant_invoice_id: data.merchant_invoice_id || undefined,
        instruction: data.instruction || undefined,
        ...(data.pickup_store_id && {
          pickup_store_id: data.pickup_store_id,
        }),
      };

      const result = await createParcel(parcelData).unwrap();
      const trackingId = result.tracking_id || result.data?.tracking_id;

      if (trackingId) {
        toast.success(t("redx.orderCreatedSuccess"));

        if (selectedOrder?.orderData) {
          try {
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: {
                shippingTrackingId: trackingId,
                shippingProvider: "RedX",
                status: "shipped",
              },
            }).unwrap();
            toast.success(t("redx.orderStatusUpdated"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("redx.orderCreatedStatusFailed"));
          }
        }

        reset();
        setSelectedOrder(null);
      }
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("redx.createOrderFailed");
      toast.error(errorMessage);
      console.error("Create parcel error:", error);
    }
  };

  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">{t("redx.createNewOrder")}</h3>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("redx.selectProcessingOrder")}
        </label>
        {isLoadingOrders ? (
          <p className="text-sm text-black/60 dark:text-white/60 py-2">
            {t("redx.loadingProcessingOrders")}
          </p>
        ) : orderOptions.length === 0 ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 py-2">
            {t("redx.noProcessingOrders")}
          </p>
        ) : (
          <Dropdown
            name="order"
            options={orderOptions}
            setSelectedOption={handleOrderSelect}
            className="rounded-lg"
          >
            {selectedOrder?.label || t("redx.selectOrderPlaceholder")}
          </Dropdown>
        )}
      </div>

      {pickupStores.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t("redx.noStoresFound")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pickupStores.length > 0 && (
            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("redx.selectPickupStore")}
              </label>
              <select
                {...register("pickup_store_id")}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              >
                <option value="">{t("redx.selectStorePlaceholder")}</option>
                {pickupStores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.area_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <TextField
            label={t("redx.merchantInvoiceId")}
            name="merchant_invoice_id"
            register={register}
            placeholder={t("redx.merchantInvoicePlaceholder")}
            error={errors.merchant_invoice_id}
          />
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("redx.recipientInformation")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("redx.customerName")}
              name="customer_name"
              register={register}
              registerOptions={{ required: t("redx.customerNameRequired") }}
              placeholder="John Doe"
              error={errors.customer_name}
            />
            <TextField
              label={t("redx.customerPhone")}
              name="customer_phone"
              type="tel"
              register={register}
              registerOptions={{
                required: t("redx.phoneRequired"),
                pattern: {
                  value: /^01[0-9]{9}$/,
                  message: t("redx.invalidPhoneFormat"),
                },
              }}
              placeholder="01XXXXXXXXX"
              error={errors.customer_phone}
            />
          </div>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("redx.deliveryLocation")}</h4>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAreaSearchType("all")}
                className={`px-3 py-1.5 rounded text-sm ${areaSearchType === "all" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                {t("redx.allAreas")}
              </button>
              <button
                type="button"
                onClick={() => setAreaSearchType("postcode")}
                className={`px-3 py-1.5 rounded text-sm ${areaSearchType === "postcode" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                {t("redx.byPostCode")}
              </button>
              <button
                type="button"
                onClick={() => setAreaSearchType("district")}
                className={`px-3 py-1.5 rounded text-sm ${areaSearchType === "district" ? "bg-black text-white dark:bg-white dark:text-black" : "bg-black/10 dark:bg-white/10"}`}
              >
                {t("redx.byDistrict")}
              </button>
            </div>

            {areaSearchType === "postcode" && (
              <div>
                <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                  {t("redx.postCode")}
                </label>
                <input
                  type="text"
                  value={postCode}
                  onChange={(e) => setPostCode(e.target.value)}
                  placeholder="1209"
                  className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full rounded"
                />
              </div>
            )}
            {areaSearchType === "district" && (
              <div>
                <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                  {t("redx.districtName")}
                </label>
                <input
                  type="text"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                  placeholder={t("redx.districtPlaceholder")}
                  className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full rounded"
                />
              </div>
            )}

            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("redx.deliveryArea")} *
              </label>
              <select
                {...register("delivery_area", { required: t("redx.areaRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              >
                <option value="">{t("redx.selectArea")}</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.name}>
                    {area.name} ({area.division_name})
                  </option>
                ))}
              </select>
              {errors.delivery_area && (
                <span className="text-red-500 text-xs ml-1">{errors.delivery_area.message}</span>
              )}
            </div>

            <TextField
              label={t("redx.customerAddress")}
              name="customer_address"
              register={register}
              registerOptions={{ required: t("redx.addressRequired") }}
              placeholder={t("redx.addressPlaceholder")}
              multiline
              rows={3}
              error={errors.customer_address}
            />
          </div>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("redx.parcelDetails")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              label={t("redx.parcelWeight")}
              name="parcel_weight"
              type="number"
              register={register}
              registerOptions={{
                required: t("redx.weightRequired"),
                min: { value: 1, message: t("redx.minWeight") },
              }}
              placeholder="500 (grams)"
              error={errors.parcel_weight}
            />
            <TextField
              label={t("redx.declaredValue")}
              name="value"
              type="number"
              register={register}
              registerOptions={{
                required: t("redx.valueRequired"),
                min: { value: 0, message: t("redx.valueMin") },
              }}
              placeholder="1000"
              error={errors.value}
            />
          </div>
          <TextField
            label={t("redx.instruction")}
            name="instruction"
            register={register}
            placeholder={t("redx.instructionPlaceholder")}
            multiline
            rows={2}
            error={errors.instruction}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isLoading || isShipping} className="w-full md:w-auto">
          {isLoading ? t("redx.creatingOrder") : isShipping ? t("redx.updatingStatus") : t("redx.createRedXOrder")}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default CreateOrder;
