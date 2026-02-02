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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Dropdown from "@/components/dropdown/dropdown";
import { useSelector } from "react-redux";
import { Loader2, AlertCircle, ChevronDown, Package, User, MapPin, Store, Truck, FileText, CheckCircle2 } from "lucide-react";

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

  // Premium select input styling
  const selectClassName = "flex h-[56px] w-full rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 px-5 py-3.5 text-[15px] font-medium text-gray-900 dark:text-gray-100 ring-offset-background placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-900 appearance-none transition-all duration-200 hover:border-gray-200 dark:hover:border-gray-700";
  const selectWrapperClass = "relative group";
  const selectIconClass = "absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-transform duration-200 group-focus-within:rotate-180";

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Premium Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-black to-gray-800 dark:from-white dark:to-gray-200 rounded-2xl shadow-lg">
              <Truck className="h-7 w-7 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-gray-100 dark:via-white dark:to-gray-100 bg-clip-text text-transparent">
                {t("pathao.createNewOrder")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                {t("pathao.createNewOrderDesc") || "Fill in the details below to create a new delivery order"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Selection Card - Premium Design */}
        <Card className="mb-8 border-2 border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/20 dark:via-gray-900 dark:to-blue-950/10 shadow-xl shadow-blue-100/20 dark:shadow-blue-900/10 rounded-3xl overflow-hidden">
          <CardHeader className="border-b-2 border-blue-100/50 dark:border-blue-900/30 bg-white/50 dark:bg-gray-950/50 pb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {t("pathao.selectProcessingOrder")}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                  Quick fill your form by selecting an existing processing order
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingOrders ? (
              <div className="flex items-center gap-3 text-base text-blue-600 dark:text-blue-400 py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-medium">{t("pathao.loadingProcessingOrders")}</span>
              </div>
            ) : orderOptions.length === 0 ? (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/30 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t("pathao.noProcessingOrders")}
                </p>
              </div>
            ) : (
              <Dropdown
                name="order"
                options={orderOptions}
                setSelectedOption={handleOrderSelect}
                className="rounded-2xl bg-white dark:bg-gray-950 border-2 border-blue-200 dark:border-blue-800 shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
              >
                {selectedOrder?.label || t("pathao.selectOrderPlaceholder")}
              </Dropdown>
            )}
          </CardContent>
        </Card>
        
        {stores.length === 0 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-2 border-yellow-200 dark:border-yellow-800/30 rounded-2xl flex items-start gap-4 shadow-lg">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-yellow-900 dark:text-yellow-200">
                {t("pathao.noStoresFound")}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please configure your store settings before creating orders
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          {/* Store & Order Info Section */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50  rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-purple-50/50 to-white dark:from-purple-950/20 dark:to-gray-950 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-xl shadow-lg">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("pathao.storeAndOrderInfo") || "Store & Order Information"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 pb-8">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                  {t("pathao.selectStore")} <span className="text-red-500">*</span>
                </label>
                <div className={selectWrapperClass}>
                  <select
                    {...register("store_id", { required: t("pathao.storeRequired") })}
                    className={selectClassName}
                  >
                    <option value="">{t("pathao.selectStorePlaceholder")}</option>
                    {stores.map((store) => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.store_name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={selectIconClass} />
                </div>
                {errors.store_id && (
                  <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.store_id.message}
                  </span>
                )}
              </div>

              <TextField
                label={t("pathao.merchantOrderId")}
                name="merchant_order_id"
                register={register}
                registerOptions={{ required: t("pathao.orderIdRequired") }}
                placeholder={t("pathao.merchantOrderPlaceholder")}
                error={errors.merchant_order_id}
                inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                className="gap-3"
              />
            </CardContent>
          </Card>

          {/* Recipient Information Section */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-white dark:from-blue-950/20 dark:to-gray-950 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-xl shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("pathao.recipientInformation")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TextField
                  label={t("pathao.recipientName")}
                  name="recipient_name"
                  register={register}
                  registerOptions={{ required: t("pathao.recipientNameRequired") }}
                  placeholder="John Doe"
                  error={errors.recipient_name}
                  inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  className="gap-3"
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
                  inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  className="gap-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-gray-950 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500 rounded-xl shadow-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("pathao.deliveryLocation")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.city")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_city", { required: t("pathao.cityRequired") })}
                      className={selectClassName}
                    >
                      <option value="">{t("pathao.selectCity")}</option>
                      {cities.map((city) => (
                        <option key={city.city_id} value={city.city_id}>
                          {city.city_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_city && (
                    <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.recipient_city.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.zone")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_zone", { required: t("pathao.zoneRequired") })}
                      className={selectClassName}
                      disabled={!selectedCity}
                    >
                      <option value="">{t("pathao.selectZone")}</option>
                      {zones.map((zone) => (
                        <option key={zone.zone_id} value={zone.zone_id}>
                          {zone.zone_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_zone && (
                    <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.recipient_zone.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.area")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("recipient_area", { required: t("pathao.areaRequired") })}
                      className={selectClassName}
                      disabled={!selectedZone}
                    >
                      <option value="">{t("pathao.selectArea")}</option>
                      {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>
                          {area.area_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                  {errors.recipient_area && (
                    <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.recipient_area.message}
                    </span>
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
                inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 resize-none"
                className="gap-3"
              />
            </CardContent>
          </Card>

          {/* Item Details Section */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-orange-50/50 to-white dark:from-orange-950/20 dark:to-gray-950 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500 rounded-xl shadow-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("pathao.itemDetails")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.deliveryType")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("delivery_type", { required: t("pathao.deliveryTypeRequired") })}
                      className={selectClassName}
                    >
                      <option value={48}>{t("pathao.normalDelivery")}</option>
                      <option value={12}>{t("pathao.onDemandDelivery")}</option>
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 mb-3 block">
                    {t("pathao.itemType")} <span className="text-red-500">*</span>
                  </label>
                  <div className={selectWrapperClass}>
                    <select
                      {...register("item_type", { required: t("pathao.itemTypeRequired") })}
                      className={selectClassName}
                    >
                      <option value={1}>{t("pathao.document")}</option>
                      <option value={2}>{t("pathao.parcel")}</option>
                    </select>
                    <ChevronDown className={selectIconClass} />
                  </div>
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
                  inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  className="gap-3"
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
                  inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  className="gap-3"
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
                  inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl h-[56px] px-5 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
                  className="gap-3"
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
                inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 resize-none"
                className="gap-3"
              />

              <TextField
                label={t("pathao.specialInstructions")}
                name="special_instruction"
                register={register}
                placeholder={t("pathao.specialInstructionsPlaceholder")}
                multiline
                rows={2}
                error={errors.special_instruction}
                inputClassName="bg-white dark:bg-gray-950/50 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200 resize-none"
                className="gap-3"
              />
            </CardContent>
          </Card>

          {/* Submit Button - Premium */}
          <div className="flex justify-end pt-6 pb-12">
            <Button 
              type="submit" 
              disabled={isLoading || isShipping} 
              className="group relative w-full md:w-auto min-w-[280px] h-14 text-base font-bold bg-gradient-to-r from-black via-gray-900 to-black hover:from-gray-900 hover:via-black hover:to-gray-900 text-white dark:from-white dark:via-gray-100 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:via-white dark:hover:to-gray-100 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {(isLoading || isShipping) ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  {isLoading ? t("pathao.creatingOrder") : t("pathao.updatingStatus")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                  {t("pathao.createPathaoOrder")}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;