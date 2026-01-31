import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingCart,
  User,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";

const CreateOrderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const orderSchema = useMemo(
    () =>
      yup.object().shape({
        customerName: yup.string().when("$hasCustomer", {
          is: false,
          then: (schema) =>
            schema
              .required(t("orders.validation.customerNameRequired"))
              .min(2, t("orders.validation.nameMin"))
              .max(100, t("orders.validation.nameMax"))
              .trim(),
          otherwise: (schema) => schema.trim(),
        }),
        customerPhone: yup.string().when("$hasCustomer", {
          is: false,
          then: (schema) =>
            schema
              .max(20, t("orders.validation.phoneMax"))
              .matches(/^[+\d\s()-]*$/, t("orders.validation.phoneValid"))
              .trim(),
          otherwise: (schema) => schema.trim(),
        }),
        customerEmail: yup
          .string()
          .transform((v) => (v === "" ? undefined : v))
          .optional()
          .email(t("orders.validation.emailValid"))
          .max(255, t("orders.validation.emailMax"))
          .trim(),
        customerAddress: yup
          .string()
          .max(500, t("orders.validation.addressMax"))
          .trim(),
        shippingAddress: yup
          .string()
          .max(500, t("orders.validation.shippingAddressMax"))
          .trim(),
      }),
    [t],
  );

  const form = useForm({
    resolver: yupResolver(orderSchema),
    mode: "onChange",
    context: { hasCustomer: !!selectedCustomer },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    clearErrors,
    trigger,
  } = form;

  // Clear validation errors and re-validate when customer selection changes
  useEffect(() => {
    if (selectedCustomer) {
      clearErrors(["customerName", "customerPhone"]);
    }
    trigger();
  }, [selectedCustomer, clearErrors, trigger]);

  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const { user } = useSelector((state) => state.auth);
  const { data: products = [] } = useGetProductsQuery({
    companyId: user?.companyId,
  });
  const { data: users = [] } = useGetUsersQuery({ companyId: user?.companyId });

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        label: `${p.name ?? p.title} (${p.sku ?? "-"})`,
        value: p.id,
      })),
    [products],
  );
  const customerOptions = useMemo(
    () =>
      users.map((u) => ({
        label: `${u.name ?? "-"} (${u.email ?? "-"})`,
        value: u.id,
      })),
    [users],
  );
  const paymentOptions = useMemo(
    () => [
      { label: t("orders.paymentDirect"), value: "DIRECT" },
      { label: t("orders.paymentCod"), value: "COD" },
    ],
    [t],
  );
  const [selectedPayment, setSelectedPayment] = useState(paymentOptions[0]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemQty, setItemQty] = useState(1);
  const [items, setItems] = useState([]);

  const addItem = () => {
    if (!selectedProduct || !itemQty || itemQty <= 0)
      return toast.error(t("orders.selectProductAndQty"));
    const exists = items.find((it) => it.productId === selectedProduct.value);
    if (exists) {
      setItems((prev) =>
        prev.map((it) =>
          it.productId === selectedProduct.value
            ? { ...it, quantity: it.quantity + itemQty }
            : it,
        ),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: selectedProduct.value,
          name: selectedProduct.label,
          quantity: itemQty,
        },
      ]);
    }
    setSelectedProduct(null);
    setItemQty(1);
  };

  const removeItem = (pid) =>
    setItems((prev) => prev.filter((it) => it.productId !== pid));

  const onSubmit = async (data) => {
    if (items.length === 0) {
      toast.error(t("orders.addAtLeastOneItem"));
      return;
    }

    // Manual validation: if no customer selected, customerName is required
    if (
      !selectedCustomer &&
      (!data.customerName || data.customerName.trim().length < 2)
    ) {
      toast.error(t("orders.customerNameRequiredMin"));
      return;
    }

    const payload = {
      customerId: selectedCustomer?.value || undefined,
      customerName: !selectedCustomer
        ? data.customerName || undefined
        : undefined,
      customerEmail: !selectedCustomer
        ? data.customerEmail || undefined
        : undefined,
      customerPhone: !selectedCustomer
        ? data.customerPhone || undefined
        : undefined,
      customerAddress: !selectedCustomer
        ? data.customerAddress || undefined
        : undefined,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
      })),
      shippingAddress: data.shippingAddress || undefined,
      paymentMethod: selectedPayment?.value,
    };

    const params = { companyId: user?.companyId };
    const res = await createOrder({ body: payload, params });
    if (res?.data) {
      toast.success(t("orders.orderCreated"));
      reset();
      setItems([]);
      setSelectedCustomer(null);
      setSelectedPayment(paymentOptions[0]);
      navigate("/orders");
    } else {
      toast.error(res?.error?.data?.message || t("orders.orderCreateFailed"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f14] relative overflow-hidden font-sans transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-[#0b0f14] dark:via-[#11161d] dark:to-[#0b0f14] z-0" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50/30 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent blur-3xl z-0" />

      <div className="relative z-10 p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10" />

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
              className="rounded-xl bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 transition-all duration-300 group"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200 group-hover:-translate-x-1 transition-transform" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white">
                {t("orders.createOrder")}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                {t("createEdit.createOrderDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60 rounded-3xl border border-white/60 dark:border-white/10 p-6 lg:p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none" />

          <form
            onSubmit={handleSubmit(onSubmit, (errors) => {
              if (Object.keys(errors).length > 0) {
                console.log("Form validation errors:", errors);
                const firstError = Object.values(errors)[0];
                if (firstError?.message) {
                  toast.error(firstError.message);
                }
              }
            })}
            className="space-y-8 relative z-10"
          >
            {/* Customer & Payment Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <User className="h-4 w-4" /> {t("orders.customer")}
                </label>
                <div className="relative group">
                  <Dropdown
                    name={t("orders.customer")}
                    options={customerOptions}
                    setSelectedOption={setSelectedCustomer}
                    className="w-full"
                  >
                    {selectedCustomer
                      ? selectedCustomer.label
                      : t("orders.selectCustomer")}
                  </Dropdown>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> {t("orders.paymentMethod")}
                </label>
                <div className="relative group">
                  <Dropdown
                    name={t("orders.paymentMethod")}
                    options={paymentOptions}
                    setSelectedOption={setSelectedPayment}
                    className="w-full"
                  >
                    {selectedPayment
                      ? selectedPayment.label
                      : t("orders.paymentMethod")}
                  </Dropdown>
                </div>
              </div>
            </div>

            {/* Manual Customer Details (if no customer selected) */}
            {!selectedCustomer && (
              <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("orders.customerDetails")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <TextField
                    label={t("orders.customerName")}
                    placeholder={t("orders.customerPlaceholder")}
                    register={register}
                    name="customerName"
                    error={errors.customerName?.message}
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                  />
                  <TextField
                    label={t("orders.customerEmail")}
                    placeholder={t("orders.emailPlaceholder")}
                    type="email"
                    register={register}
                    name="customerEmail"
                    error={errors.customerEmail?.message}
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                  />
                  <TextField
                    label={t("orders.customerPhone")}
                    placeholder={t("orders.phonePlaceholder")}
                    register={register}
                    name="customerPhone"
                    error={errors.customerPhone?.message}
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                  />
                  <TextField
                    label={t("orders.customerAddress")}
                    placeholder={t("orders.addressPlaceholder")}
                    register={register}
                    name="customerAddress"
                    error={errors.customerAddress?.message}
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {t("orders.shippingAddress")}
              </label>
              <TextField
                placeholder={t("orders.shippingPlaceholder")}
                register={register}
                name="shippingAddress"
                error={errors.shippingAddress?.message}
                className="bg-white/50 dark:bg-black/20 backdrop-blur-sm"
              />
            </div>

            {/* Product Selection & Items */}
            <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/50 dark:border-white/10">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" /> {t("orders.orderItems")}
              </h3>

              <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                <div className="flex-1 w-full">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    {t("orders.product")}
                  </label>
                  <Dropdown
                    name={t("orders.product")}
                    options={productOptions}
                    setSelectedOption={setSelectedProduct}
                    className="w-full"
                  >
                    {selectedProduct
                      ? selectedProduct.label
                      : t("orders.selectProduct")}
                  </Dropdown>
                </div>

                <div className="w-32">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5 block">
                    {t("orders.qty")}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={itemQty}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = parseInt(value, 10);
                      if (!isNaN(numValue) && numValue > 0) {
                        setItemQty(numValue);
                      } else if (
                        value === "" ||
                        value === null ||
                        value === undefined
                      ) {
                        setItemQty(1);
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const numValue = parseInt(value, 10);
                      if (isNaN(numValue) || numValue < 1) {
                        setItemQty(1);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-black/20 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="1"
                  />
                </div>

                <Button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl px-6 h-[46px]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("orders.addItem")}
                </Button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-black/10 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    {t("orders.noItemsAdded")}
                  </div>
                ) : (
                  items.map((it) => (
                    <div
                      key={it.productId}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-black/40 border border-white/50 dark:border-white/10 shadow-sm transition-all hover:bg-white/80 dark:hover:bg-black/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {it.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t("orders.qty")}: {it.quantity}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(it.productId)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <Button
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/orders");
                }}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl px-6"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black hover:shadow-lg hover:shadow-black/20 dark:hover:shadow-white/20 transition-all rounded-xl px-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t("orders.creating")}
                  </div>
                ) : (
                  t("orders.createOrder")
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;
