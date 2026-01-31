import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useCreateOrderMutation } from "@/features/steadfast/steadfastApiSlice";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  
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
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      invoice: "",
      recipient_name: "",
      recipient_phone: "",
      alternative_phone: "",
      recipient_email: "",
      recipient_address: "",
      cod_amount: "",
      delivery_location: "inside",
      note: "",
      item_description: "",
      total_lot: "",
      delivery_type: 0,
    },
  });

  const deliveryLocation = watch("delivery_location");

  // Delivery charges: Inside Dhaka = 70, Outside Dhaka = 150
  const DELIVERY_CHARGE_INSIDE_DHAKA = 70;
  const DELIVERY_CHARGE_OUTSIDE_DHAKA = 150;

  // Recalculate COD when delivery location changes (if order is selected)
  useEffect(() => {
    if (!selectedOrder?.orderData) return;
    const orderTotal = Number(selectedOrder.orderData.totalAmount) || 0;
    const deliveryCharge = deliveryLocation === "outside" ? DELIVERY_CHARGE_OUTSIDE_DHAKA : DELIVERY_CHARGE_INSIDE_DHAKA;
    setValue("cod_amount", (orderTotal + deliveryCharge).toString());
  }, [deliveryLocation, selectedOrder, setValue]);

  // Handle order selection and auto-fill form
  const handleOrderSelect = (option) => {
    setSelectedOrder(option);
    
    if (!option || !option.orderData) {
      reset();
      return;
    }
    
    const order = option.orderData;
    const orderTotal = Number(order.totalAmount) || 0;
    const isInsideDhaka = order.deliveryType?.toUpperCase() !== "OUTSIDEDHAKA";
    const deliveryCharge = isInsideDhaka ? DELIVERY_CHARGE_INSIDE_DHAKA : DELIVERY_CHARGE_OUTSIDE_DHAKA;
    const codAmount = orderTotal + deliveryCharge;
    
    // Auto-fill form fields from selected order
    setValue("invoice", order.id?.toString() || "");
    setValue("recipient_name", order.customer?.name || order.customerName || "");
    setValue("recipient_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("alternative_phone", order.customer?.phone || "");
    setValue("recipient_email", order.customer?.email || order.customerEmail || "");
    setValue("recipient_address", order.customerAddress || order.billingAddress || "");
    setValue("cod_amount", codAmount.toString());
    setValue("note", order.notes || "");
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
    setValue("total_lot", items.length?.toString() || "1");
    setValue("delivery_location", isInsideDhaka ? "inside" : "outside");
    setValue("delivery_type", 0);
    
    toast.success(t("steadfast.orderAutoFilled"));
  };

  const onSubmit = async (data) => {
    // Validation
    if (data.recipient_phone && data.recipient_phone.length !== 11) {
      toast.error(t("steadfast.recipientPhone11Digits"));
      return;
    }

    if (data.alternative_phone && data.alternative_phone.length !== 11) {
      toast.error(t("steadfast.alternativePhone11Digits"));
      return;
    }

    // Prepare form data
    const formData = {
      invoice: data.invoice,
      recipient_name: data.recipient_name,
      recipient_phone: data.recipient_phone,
      alternative_phone: data.alternative_phone || "",
      recipient_email: data.recipient_email || "",
      recipient_address: data.recipient_address,
      cod_amount: data.cod_amount ? Number(data.cod_amount) : 0,
      note: data.note || "",
      item_description: data.item_description || "",
      total_lot: data.total_lot ? Number(data.total_lot) : "",
      delivery_type: data.delivery_type ? Number(data.delivery_type) : 0,
    };

    try {
      const result = await createOrder(formData).unwrap();
      if (result.status === 200) {
        toast.success(result.message || t("steadfast.orderCreatedSuccess"));
        
        // Extract tracking information from Steadfast response
        const trackingCode = result.consignment?.tracking_code || result.tracking_code;
        const consignmentId = result.consignment?.consignment_id || result.consignment_id;
        
        // Update the order with shipping information if we have a selected order
        if (selectedOrder && selectedOrder.orderData) {
          try {
            const shipmentData = {
              shippingTrackingId: trackingCode || consignmentId || "",
              shippingProvider: "Steadfast",
              status: "shipped",
            };
            
            await shipOrder({
              id: selectedOrder.orderData.id,
              body: shipmentData,
            }).unwrap();
            
            toast.success(t("steadfast.orderStatusUpdated"));
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error(t("steadfast.orderCreatedStatusFailed"));
          }
        }
        
        reset();
        setSelectedOrder(null);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("steadfast.createOrderFailed");
      const errorDetails = error?.data?.details;
      
      if (error?.status === 429) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 }
        );
      } else if (error?.status === 401) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Create order error:", error);
    }
  };

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">{t("steadfast.createNewOrder")}</h3>
      
      {/* Order Selection Dropdown */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("steadfast.selectProcessingOrder")}
        </label>
        {isLoadingOrders ? (
          <p className="text-sm text-black/60 dark:text-white/60 py-2">
            {t("steadfast.loadingProcessingOrders")}
          </p>
        ) : orderOptions.length === 0 ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 py-2">
            {t("steadfast.noProcessingOrders")}
          </p>
        ) : (
          <Dropdown
            name="order"
            options={orderOptions}
            setSelectedOption={handleOrderSelect}
            className="rounded-lg"
          >
            {selectedOrder?.label || t("steadfast.selectOrderPlaceholder")}
          </Dropdown>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label={t("steadfast.invoiceId")}
            name="invoice"
            register={register}
            registerOptions={{ required: t("steadfast.invoiceRequired") }}
            placeholder={t("steadfast.invoicePlaceholder")}
            error={errors.invoice}
          />
          <TextField
            label={t("steadfast.recipientName")}
            name="recipient_name"
            register={register}
            registerOptions={{
              required: t("steadfast.recipientNameRequired"),
              maxLength: {
                value: 100,
                message: t("steadfast.recipientNameMax"),
              },
            }}
            placeholder={t("steadfast.recipientNamePlaceholder")}
            error={errors.recipient_name}
          />
          <TextField
            label={t("steadfast.recipientPhone")}
            name="recipient_phone"
            type="tel"
            register={register}
            registerOptions={{
              required: t("steadfast.recipientPhoneRequired"),
              minLength: {
                value: 11,
                message: t("steadfast.recipientPhoneDigits"),
              },
              maxLength: {
                value: 11,
                message: t("steadfast.recipientPhoneDigits"),
              },
            }}
            placeholder={t("steadfast.recipientPhonePlaceholder")}
            error={errors.recipient_phone}
          />
          <TextField
            label={t("steadfast.alternativePhone")}
            name="alternative_phone"
            type="tel"
            register={register}
            registerOptions={{
              minLength: {
                value: 11,
                message: t("steadfast.alternativePhoneDigits"),
              },
              maxLength: {
                value: 11,
                message: t("steadfast.alternativePhoneDigits"),
              },
            }}
            placeholder={t("steadfast.recipientPhonePlaceholder")}
            error={errors.alternative_phone}
          />
          <TextField
            label={t("steadfast.recipientEmail")}
            name="recipient_email"
            type="email"
            register={register}
            registerOptions={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: t("steadfast.invalidEmail"),
              },
            }}
            placeholder="email@example.com"
            error={errors.recipient_email}
          />
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("steadfast.deliveryLocation")}
            </label>
            <select
              {...register("delivery_location")}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value="inside">{t("steadfast.insideDhaka")} (৳70)</option>
              <option value="outside">{t("steadfast.outsideDhaka")} (৳150)</option>
            </select>
          </div>
          <TextField
            label={t("steadfast.codAmount")}
            name="cod_amount"
            type="number"
            register={register}
            registerOptions={{
              required: t("steadfast.codAmountRequired"),
              min: {
                value: 0,
                message: t("steadfast.codAmountMin"),
              },
            }}
            placeholder="1060"
            step="0.01"
            error={errors.cod_amount}
          />
          <TextField
            label={t("steadfast.totalLot")}
            name="total_lot"
            type="number"
            register={register}
            registerOptions={{
              min: {
                value: 1,
                message: t("steadfast.totalLotMin"),
              },
            }}
            placeholder="1"
            error={errors.total_lot}
          />
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              {t("steadfast.deliveryType")}
            </label>
            <select
              {...register("delivery_type", { required: t("steadfast.deliveryTypeRequired") })}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value={0}>{t("steadfast.homeDelivery")}</option>
              <option value={1}>{t("steadfast.pointDelivery")}</option>
            </select>
            {errors.delivery_type && (
              <span className="text-red-500 text-xs ml-1">{errors.delivery_type.message}</span>
            )}
          </div>
        </div>
        <TextField
          label={t("steadfast.recipientAddress")}
          name="recipient_address"
          register={register}
          registerOptions={{
            required: t("steadfast.recipientAddressRequired"),
            maxLength: {
              value: 250,
              message: t("steadfast.recipientAddressMax"),
            },
          }}
          placeholder="Fla# A1,House# 17/1, Road# 3/A, Dhanmondi,Dhaka-1209"
          multiline
          rows={3}
          error={errors.recipient_address}
        />
        <TextField
          label={t("steadfast.itemDescription")}
          name="item_description"
          register={register}
          placeholder={t("steadfast.itemDescriptionPlaceholder")}
          multiline
          rows={2}
          error={errors.item_description}
        />
        <TextField
          label={t("steadfast.note")}
          name="note"
          register={register}
          placeholder={t("steadfast.notePlaceholder")}
          multiline
          rows={2}
          error={errors.note}
        />
        <PrimaryButton type="submit" isLoading={isLoading || isShipping} className="w-full md:w-auto">
          {isLoading ? t("steadfast.creatingOrder") : isShipping ? t("steadfast.updatingStatus") : t("steadfast.createOrder")}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default CreateOrder;
