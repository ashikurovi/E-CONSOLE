import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateOrderMutation } from "@/features/order/orderApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { useSelector } from "react-redux";
import { ArrowLeft } from "lucide-react";

// Yup validation schema
const orderSchema = yup.object().shape({
  customerName: yup
    .string()
    .when('$hasCustomer', {
      is: false,
      then: (schema) => schema.required("Customer name is required").min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters").trim(),
      otherwise: (schema) => schema.trim(),
    }),
  customerPhone: yup
    .string()
    .when('$hasCustomer', {
      is: false,
      then: (schema) => schema.max(20, "Phone number must be less than 20 characters").matches(/^[+\d\s()-]*$/, "Please enter a valid phone number").trim(),
      otherwise: (schema) => schema.trim(),
    }),
  customerAddress: yup
    .string()
    .max(500, "Address must be less than 500 characters")
    .trim(),
  shippingAddress: yup
    .string()
    .max(500, "Shipping address must be less than 500 characters")
    .trim(),
});

const CreateOrderPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderSchema),
    mode: "onChange",
    context: { hasCustomer: false },
  });
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { user } = useSelector((state) => state.auth);
  const { data: products = [] } = useGetProductsQuery({ companyId: user?.companyId });
  const { data: users = [] } = useGetUsersQuery({ companyId: user?.companyId });

  const productOptions = useMemo(
    () => products.map((p) => ({ label: `${p.name ?? p.title} (${p.sku ?? "-"})`, value: p.id })),
    [products]
  );
  const customerOptions = useMemo(
    () => users.map((u) => ({ label: `${u.name ?? "-"} (${u.email ?? "-"})`, value: u.id })),
    [users]
  );
  const paymentOptions = [
    { label: "DIRECT (Online)", value: "DIRECT" },
    { label: "Cash on Delivery (COD)", value: "COD" },
  ];

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (!selectedProduct || !itemQty || itemQty <= 0) return toast.error("Select product and quantity");
    const exists = items.find((it) => it.productId === selectedProduct.value);
    if (exists) {
      setItems((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.value ? { ...it, quantity: it.quantity + itemQty } : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { productId: selectedProduct.value, name: selectedProduct.label, quantity: itemQty },
      ]);
    }
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (pid) => setItems((prev) => prev.filter((it) => it.productId !== pid));

  const onSubmit = async (data) => {
    if (items.length === 0) return toast.error("Add at least one item");

    const payload = {
      customerId: selectedCustomer?.value || undefined,
      customerName: !selectedCustomer ? data.customerName || undefined : undefined,
      customerPhone: !selectedCustomer ? data.customerPhone || undefined : undefined,
      customerAddress: !selectedCustomer ? data.customerAddress || undefined : undefined,
      items: items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
      shippingAddress: data.shippingAddress || undefined,
      paymentMethod: selectedPayment?.value,
    };

    const params = { companyId: user?.companyId };
    const res = await createOrder({ body: payload, params });
    if (res?.data) {
      toast.success("Order created");
      reset();
      setItems([]);
      setSelectedCustomer(null);
      setSelectedPayment(paymentOptions[0]);
      navigate("/orders");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/orders")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create Order</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Add a new order to the system
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer selection */}
        <div className="fl gap-3">
          <Dropdown
            name="Customer"
            options={customerOptions}
            setSelectedOption={setSelectedCustomer}
          >
            {selectedCustomer ? selectedCustomer.label : "Select Customer"}
          </Dropdown>
          <Dropdown
            name="Payment Method"
            options={paymentOptions}
            setSelectedOption={setSelectedPayment}
          >
            {selectedPayment ? selectedPayment.label : "Payment Method"}
          </Dropdown>
        </div>

        {/* Manual customer info (used only if no selectedCustomer) */}
        {!selectedCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextField
              label="Customer Name"
              placeholder="John Doe"
              register={register}
              name="customerName"
              error={errors.customerName?.message}
            />
            <TextField
              label="Customer Phone"
              placeholder="+8801..."
              register={register}
              name="customerPhone"
              error={errors.customerPhone?.message}
            />
            <TextField
              label="Customer Address"
              placeholder="Street, City"
              register={register}
              name="customerAddress"
              error={errors.customerAddress?.message}
            />
          </div>
        )}

        {/* Shipping address */}
        <TextField
          label="Shipping Address"
          placeholder="Street, City (optional)"
          register={register}
          name="shippingAddress"
          error={errors.shippingAddress?.message}
        />

        {/* Items composer */}
        <div className="rounded-xl border border-black/10 dark:border-white/10 p-3">
          <div className="fl gap-3">
            <Dropdown
              name="Product"
              options={productOptions}
              setSelectedOption={setSelectedProduct}
            >
              {selectedProduct ? selectedProduct.label : "Select Product"}
            </Dropdown>
            <input
              type="number"
              min={1}
              value={itemQty}
              onChange={(e) => setItemQty(parseInt(e.target.value || "1", 10))}
              className="border border-black/10 dark:border-white/20 bg-bg50 dark:bg-white/10 px-3 py-2 rounded-md w-28 outline-none"
              placeholder="Qty"
            />
            <Button type="button" variant="outline" onClick={addItem}>
              Add Item
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {items.length === 0 ? (
              <p className="text-sm opacity-60">No items added yet.</p>
            ) : (
              items.map((it) => (
                <div key={it.productId} className="fl justify-between border border-black/5 dark:border-white/10 rounded-md px-3 py-2">
                  <span className="text-sm">{it.name}</span>
                  <div className="fl gap-3">
                    <span className="text-sm">Qty: {it.quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(it.productId)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button type="button" variant="ghost" className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" onClick={() => navigate("/orders")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isLoading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateOrderPage;
