import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {
  useCreateOrderMutation,
  useGetStoresQuery,
  useGetCitiesQuery,
  useGetZonesQuery,
  useGetAreasQuery,
} from "@/features/pathao/pathaoApiSlice";
import { useGetOrdersQuery, useShipOrderMutation } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";

const CreateOrder = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const { data: storesData } = useGetStoresQuery();
  const { data: citiesData } = useGetCitiesQuery();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  
  // Fetch orders with status = "processing"
  const { data: allOrders = [], isLoading: isLoadingOrders } = useGetOrdersQuery({ companyId: authUser?.companyId });
  
  // Filter processing orders
  const processingOrders = allOrders.filter(
    (order) => order.status?.toLowerCase() === "processing"
  );
  
  // Create options for dropdown
  const orderOptions = useMemo(
    () => processingOrders.map((order) => ({
      label: `Order #${order.id} - ${order.customer?.name || order.customerName || "N/A"} - ${order.totalAmount ? `৳${order.totalAmount}` : "N/A"}`,
      value: order.id,
      orderData: order,
    })),
    [processingOrders]
  );
  
  const { data: zonesData } = useGetZonesQuery(selectedCity, {
    skip: !selectedCity,
  });
  
  const { data: areasData } = useGetAreasQuery(selectedZone, {
    skip: !selectedZone,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      store_id: "",
      merchant_order_id: "",
      recipient_name: "",
      recipient_phone: "",
      recipient_address: "",
      recipient_city: "",
      recipient_zone: "",
      recipient_area: "",
      delivery_type: 48,
      item_type: 2,
      special_instruction: "",
      item_quantity: 1,
      item_weight: 0.5,
      amount_to_collect: 0,
      item_description: "",
    },
  });

  // Watch city and zone changes
  const watchCity = watch("recipient_city");
  const watchZone = watch("recipient_zone");

  useEffect(() => {
    if (watchCity) {
      setSelectedCity(watchCity);
      setValue("recipient_zone", "");
      setValue("recipient_area", "");
    }
  }, [watchCity, setValue]);

  useEffect(() => {
    if (watchZone) {
      setSelectedZone(watchZone);
      setValue("recipient_area", "");
    }
  }, [watchZone, setValue]);

  // Handle order selection and auto-fill form
  const handleOrderSelect = (option) => {
    setSelectedOrder(option);
    
    if (!option || !option.orderData) {
      reset();
      setSelectedCity("");
      setSelectedZone("");
      return;
    }
    
    const order = option.orderData;
    
    // Auto-fill form fields from selected order
    // Store ID - use first available store as default
    if (stores.length > 0) {
      setValue("store_id", stores[0].store_id.toString());
    }
    
    setValue("merchant_order_id", order.id?.toString() || "");
    setValue("recipient_name", order.customer?.name || order.customerName || "");
    setValue("recipient_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("recipient_address", order.customerAddress || order.billingAddress || "");
    
    // City, Zone, Area - cannot auto-populate as they require specific IDs from Pathao API
    // User will need to select these manually
    setValue("recipient_city", "");
    setValue("recipient_zone", "");
    setValue("recipient_area", "");
    setSelectedCity("");
    setSelectedZone("");
    
    // Build item description: product name and description only
    const items = order.items || order.orderItems || [];
    const itemDescription = items
      .map((item) => {
        const name = item.product?.name || item.productName || item.name || "Product";
        const desc = item.product?.description || item.description;
        return desc ? `${name}: ${desc}` : name;
      })
      .join(", ");
    setValue("item_description", itemDescription || "");
    setValue("special_instruction", order.notes || "");
    setValue("item_quantity", items.length || 1);
    setValue("amount_to_collect", order.totalAmount?.toString() || "0");
    setValue("item_weight", "0.5"); // Default weight
    setValue("delivery_type", 48); // Normal delivery
    setValue("item_type", 2); // Parcel
    
    toast.success(t("pathao.orderAutoFilled"));
  };

  const onSubmit = async (data) => {
    try {
      const orderData = {
        store_id: Number(data.store_id),
        merchant_order_id: data.merchant_order_id,
        recipient_name: data.recipient_name,
        recipient_phone: data.recipient_phone,
        recipient_address: data.recipient_address,
        recipient_city: Number(data.recipient_city),
        recipient_zone: Number(data.recipient_zone),
        recipient_area: Number(data.recipient_area),
        delivery_type: Number(data.delivery_type),
        item_type: Number(data.item_type),
        special_instruction: data.special_instruction || "",
        item_quantity: Number(data.item_quantity),
        item_weight: Number(data.item_weight),
        amount_to_collect: Number(data.amount_to_collect),
        item_description: data.item_description || "",
      };

      const result = await createOrder(orderData).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        toast.success(t("pathao.orderCreatedSuccess"));
        
        // Extract tracking information from Pathao response
        const consignmentId = result.data?.data?.consignment_id || result.data?.consignment_id;
        const trackingCode = result.data?.data?.tracking_code || result.data?.tracking_code;
        
        // Get city name from selected city
        const cityName = cities.find(c => c.city_id === Number(data.recipient_city))?.city_name || "";
        
        // Update the order with shipping information if we have a selected order
        if (selectedOrder && selectedOrder.orderData) {
          try {
            const shipmentData = {
              shippingTrackingId: consignmentId || trackingCode || "",
              shippingProvider: "Pathao",
              status: "shipped",
              ...(cityName && { shippingCity: cityName }),
            };
            
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: shipmentData,
            }).unwrap();
            
            toast.success(t("pathao.orderStatusUpdated"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("pathao.orderCreatedStatusFailed"));
          }
        }
        
        reset();
        setSelectedOrder(null);
        setSelectedCity("");
        setSelectedZone("");
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.createOrderFailed");
      toast.error(errorMessage);
      console.error("Create order error:", error);
    }
  };

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];
  const zones = zonesData?.data?.data || [];
  const areas = areasData?.data?.data || [];

  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">{t("pathao.createNewOrder")}</h3>
      
      {/* Order Selection Dropdown */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("pathao.selectProcessingOrder")}
        </label>
        {isLoadingOrders ? (
          <p className="text-sm text-black/60 dark:text-white/60 py-2">
            {t("pathao.loadingProcessingOrders")}
          </p>
        ) : orderOptions.length === 0 ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 py-2">
            {t("pathao.noProcessingOrders")}
          </p>
        ) : (
          <Dropdown
            name="order"
            options={orderOptions}
            setSelectedOption={handleOrderSelect}
            className="rounded-lg"
          >
            {selectedOrder?.label || t("pathao.selectOrderPlaceholder")}
          </Dropdown>
        )}
      </div>
      
      {stores.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ {t("pathao.noStoresFound")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Store and Order Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("pathao.selectStore")}
            </label>
            <select
              {...register("store_id", { required: t("pathao.storeRequired") })}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value="">{t("pathao.selectStorePlaceholder")}</option>
              {stores.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.store_name}
                </option>
              ))}
            </select>
            {errors.store_id && (
              <span className="text-red-500 text-xs ml-1">{errors.store_id.message}</span>
            )}
          </div>

          <TextField
            label={t("pathao.merchantOrderId")}
            name="merchant_order_id"
            register={register}
            registerOptions={{ required: t("pathao.orderIdRequired") }}
            placeholder={t("pathao.merchantOrderPlaceholder")}
            error={errors.merchant_order_id}
          />
        </div>

        {/* Recipient Information */}
        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("pathao.recipientInformation")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={t("pathao.recipientName")}
              name="recipient_name"
              register={register}
              registerOptions={{ required: t("pathao.recipientNameRequired") }}
              placeholder="John Doe"
              error={errors.recipient_name}
            />

            <TextField
              label={t("pathao.recipientPhone")}
              name="recipient_phone"
              type="tel"
              register={register}
              registerOptions={{
                required: t("pathao.phoneRequired"),
                pattern: {
                  value: /^01[0-9]{9}$/,
                  message: t("pathao.invalidPhoneFormat"),
                },
              }}
              placeholder="01XXXXXXXXX"
              error={errors.recipient_phone}
            />
          </div>
        </div>

        {/* Location */}
        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("pathao.deliveryLocation")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("pathao.city")}
              </label>
              <select
                {...register("recipient_city", { required: t("pathao.cityRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
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
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
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
                {t("pathao.area")}
              </label>
              <select
                {...register("recipient_area", { required: t("pathao.areaRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
                disabled={!selectedZone}
              >
                <option value="">{t("pathao.selectArea")}</option>
                {areas.map((area) => (
                  <option key={area.area_id} value={area.area_id}>
                    {area.area_name}
                  </option>
                ))}
              </select>
              {errors.recipient_area && (
                <span className="text-red-500 text-xs ml-1">{errors.recipient_area.message}</span>
              )}
            </div>
          </div>

          <TextField
            label={t("pathao.recipientAddress")}
            name="recipient_address"
            register={register}
            registerOptions={{ required: t("pathao.addressRequired") }}
            placeholder={t("pathao.addressPlaceholder")}
            multiline
            rows={3}
            error={errors.recipient_address}
          />
        </div>

        {/* Item Details */}
        <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-4">
          <h4 className="text-md font-semibold mb-3">{t("pathao.itemDetails")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("pathao.deliveryType")}
              </label>
              <select
                {...register("delivery_type", { required: t("pathao.deliveryTypeRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              >
                <option value={48}>{t("pathao.normalDelivery")}</option>
                <option value={12}>{t("pathao.onDemandDelivery")}</option>
              </select>
            </div>

            <div>
              <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
                {t("pathao.itemType")}
              </label>
              <select
                {...register("item_type", { required: t("pathao.itemTypeRequired") })}
                className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
              >
                <option value={1}>{t("pathao.document")}</option>
                <option value={2}>{t("pathao.parcel")}</option>
              </select>
            </div>

            <TextField
              label={t("pathao.itemQuantity")}
              name="item_quantity"
              type="number"
              register={register}
              registerOptions={{
                required: t("pathao.quantityRequired"),
                min: { value: 1, message: t("pathao.minQuantity") },
              }}
              placeholder="1"
              error={errors.item_quantity}
            />

            <TextField
              label={t("pathao.itemWeight")}
              name="item_weight"
              type="number"
              step="0.1"
              register={register}
              registerOptions={{
                required: t("pathao.weightRequired"),
                min: { value: 0.1, message: t("pathao.minWeight") },
              }}
              placeholder="0.5"
              error={errors.item_weight}
            />

            <TextField
              label={t("pathao.amountToCollect")}
              name="amount_to_collect"
              type="number"
              register={register}
              registerOptions={{
                required: t("pathao.amountRequired"),
                min: { value: 0, message: t("pathao.amountMin") },
              }}
              placeholder="1000"
              error={errors.amount_to_collect}
            />
          </div>

          <TextField
            label={t("pathao.itemDescription")}
            name="item_description"
            register={register}
            placeholder={t("pathao.itemDescriptionPlaceholder")}
            multiline
            rows={2}
            error={errors.item_description}
          />

          <TextField
            label={t("pathao.specialInstructions")}
            name="special_instruction"
            register={register}
            placeholder={t("pathao.specialInstructionsPlaceholder")}
            multiline
            rows={2}
            error={errors.special_instruction}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isLoading || isShipping} className="w-full md:w-auto">
          {isLoading ? t("pathao.creatingOrder") : isShipping ? t("pathao.updatingStatus") : t("pathao.createPathaoOrder")}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default CreateOrder;
