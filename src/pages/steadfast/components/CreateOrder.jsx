import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useCreateOrderMutation } from "@/features/steadfast/steadfastApiSlice";
import { useGetOrdersQuery, useShipOrderMutation } from "@/features/order/orderApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import Dropdown from "@/components/dropdown/dropdown";

const CreateOrder = () => {
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Fetch orders with status = "processing"
  const { data: allOrders = [], isLoading: isLoadingOrders } = useGetOrdersQuery();
  
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
      note: "",
      item_description: "",
      total_lot: "",
      delivery_type: 0,
    },
  });

  // Handle order selection and auto-fill form
  const handleOrderSelect = (option) => {
    setSelectedOrder(option);
    
    if (!option || !option.orderData) {
      reset();
      return;
    }
    
    const order = option.orderData;
    
    // Auto-fill form fields from selected order
    setValue("invoice", order.id?.toString() || "");
    setValue("recipient_name", order.customer?.name || order.customerName || "");
    setValue("recipient_phone", order.customer?.phone || order.shippingPhone || "");
    setValue("alternative_phone", order.customer?.phone || "");
    setValue("recipient_email", order.customer?.email || order.customerEmail || "");
    setValue("recipient_address", order.customerAddress || order.billingAddress || "");
    setValue("cod_amount", order.totalAmount?.toString() || "");
    setValue("note", order.notes || "");
    setValue("item_description", order.orderItems?.map(item => item.productName || item.name).join(", ") || "");
    setValue("total_lot", order.orderItems?.length?.toString() || "1");
    setValue("delivery_type", 0);
    
    toast.success("Order details auto-filled!");
  };

  const onSubmit = async (data) => {
    // Validation
    if (data.recipient_phone && data.recipient_phone.length !== 11) {
      toast.error("Recipient phone must be 11 digits");
      return;
    }

    if (data.alternative_phone && data.alternative_phone.length !== 11) {
      toast.error("Alternative phone must be 11 digits");
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
        toast.success(result.message || "Order created successfully!");
        
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
            
            toast.success("Order status updated to shipped!");
          } catch (shipError) {
            console.error("Failed to update order status:", shipError);
            toast.error("Order created but failed to update status. Please update manually.");
          }
        }
        
        reset();
        setSelectedOrder(null);
      }
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to create order";
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
      <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
      
      {/* Order Selection Dropdown */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          Select Processing Order (Auto-fill)
        </label>
        {isLoadingOrders ? (
          <p className="text-sm text-black/60 dark:text-white/60 py-2">
            Loading processing orders...
          </p>
        ) : orderOptions.length === 0 ? (
          <p className="text-sm text-orange-600 dark:text-orange-400 py-2">
            No processing orders found. Create order manually below.
          </p>
        ) : (
          <Dropdown
            name="order"
            options={orderOptions}
            setSelectedOption={handleOrderSelect}
            className="rounded-lg"
          >
            {selectedOrder?.label || "-- Select a processing order to auto-fill --"}
          </Dropdown>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            label="Invoice ID *"
            name="invoice"
            register={register}
            registerOptions={{ required: "Invoice ID is required" }}
            placeholder="Unique invoice ID"
            error={errors.invoice}
          />
          <TextField
            label="Recipient Name *"
            name="recipient_name"
            register={register}
            registerOptions={{
              required: "Recipient name is required",
              maxLength: {
                value: 100,
                message: "Recipient name must be less than 100 characters",
              },
            }}
            placeholder="John Smith"
            error={errors.recipient_name}
          />
          <TextField
            label="Recipient Phone *"
            name="recipient_phone"
            type="tel"
            register={register}
            registerOptions={{
              required: "Recipient phone is required",
              minLength: {
                value: 11,
                message: "Recipient phone must be 11 digits",
              },
              maxLength: {
                value: 11,
                message: "Recipient phone must be 11 digits",
              },
            }}
            placeholder="01234567890"
            error={errors.recipient_phone}
          />
          <TextField
            label="Alternative Phone"
            name="alternative_phone"
            type="tel"
            register={register}
            registerOptions={{
              minLength: {
                value: 11,
                message: "Alternative phone must be 11 digits",
              },
              maxLength: {
                value: 11,
                message: "Alternative phone must be 11 digits",
              },
            }}
            placeholder="01234567890"
            error={errors.alternative_phone}
          />
          <TextField
            label="Recipient Email"
            name="recipient_email"
            type="email"
            register={register}
            registerOptions={{
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            }}
            placeholder="email@example.com"
            error={errors.recipient_email}
          />
          <TextField
            label="COD Amount (BDT) *"
            name="cod_amount"
            type="number"
            register={register}
            registerOptions={{
              required: "COD amount is required",
              min: {
                value: 0,
                message: "COD amount must be greater than or equal to 0",
              },
            }}
            placeholder="1060"
            step="0.01"
            error={errors.cod_amount}
          />
          <TextField
            label="Total Lot"
            name="total_lot"
            type="number"
            register={register}
            registerOptions={{
              min: {
                value: 1,
                message: "Total lot must be at least 1",
              },
            }}
            placeholder="1"
            error={errors.total_lot}
          />
          <div>
            <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
              Delivery Type *
            </label>
            <select
              {...register("delivery_type", { required: "Delivery type is required" })}
              className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            >
              <option value={0}>Home Delivery</option>
              <option value={1}>Point Delivery/Steadfast Hub Pick Up</option>
            </select>
            {errors.delivery_type && (
              <span className="text-red-500 text-xs ml-1">{errors.delivery_type.message}</span>
            )}
          </div>
        </div>
        <TextField
          label="Recipient Address *"
          name="recipient_address"
          register={register}
          registerOptions={{
            required: "Recipient address is required",
            maxLength: {
              value: 250,
              message: "Recipient address must be less than 250 characters",
            },
          }}
          placeholder="Fla# A1,House# 17/1, Road# 3/A, Dhanmondi,Dhaka-1209"
          multiline
          rows={3}
          error={errors.recipient_address}
        />
        <TextField
          label="Item Description"
          name="item_description"
          register={register}
          placeholder="Items name and other information"
          multiline
          rows={2}
          error={errors.item_description}
        />
        <TextField
          label="Note"
          name="note"
          register={register}
          placeholder="Delivery instructions or other notes"
          multiline
          rows={2}
          error={errors.note}
        />
        <PrimaryButton type="submit" isLoading={isLoading || isShipping} className="w-full md:w-auto">
          {isLoading ? "Creating Order..." : isShipping ? "Updating Status..." : "Create Order"}
        </PrimaryButton>
      </form>
    </div>
  );
};

export default CreateOrder;
