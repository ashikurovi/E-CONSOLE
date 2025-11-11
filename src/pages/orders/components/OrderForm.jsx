import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateOrderMutation } from "@/features/order/orderApiSlice";
import { useGetProductsQuery } from "@/features/product/productApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";

const OrderForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const { data: products = [] } = useGetProductsQuery();
  const { data: users = [] } = useGetUsersQuery();

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

    const res = await createOrder(payload);
    if (res?.data) {
      toast.success("Order created");
      reset();
      setItems([]);
      setSelectedCustomer(null);
      setSelectedPayment(paymentOptions[0]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create order");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Order</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <TextField label="Customer Name" placeholder="John Doe" register={register} name="customerName" />
              <TextField label="Customer Phone" placeholder="+8801..." register={register} name="customerPhone" />
              <TextField label="Customer Address" placeholder="Street, City" register={register} name="customerAddress" />
            </div>
          )}

          {/* Shipping address */}
          <TextField label="Shipping Address" placeholder="Street, City (optional)" register={register} name="shippingAddress" />

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrderForm;