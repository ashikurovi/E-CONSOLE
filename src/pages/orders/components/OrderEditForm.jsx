import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useCompleteOrderMutation,
  useShipOrderMutation,
} from "@/features/order/orderApiSlice";
import { useSelector } from "react-redux";

const OrderEditForm = ({ order }) => {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const orderEditSchema = useMemo(
    () =>
      yup.object().shape({
        paymentRef: yup
          .string()
          .max(100, t("orders.validation.paymentRefMax"))
          .trim(),
        trackingId: yup
          .string()
          .max(100, t("orders.validation.trackingIdMax"))
          .trim(),
        provider: yup
          .string()
          .max(100, t("orders.validation.providerMax"))
          .trim(),
      }),
    [t],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(orderEditSchema),
    mode: "onChange",
    defaultValues: {
      paymentRef: order?.paymentReference || "",
      trackingId: order?.shippingTrackingId || "",
      provider: order?.shippingProvider || "",
    },
  });

  const [completeOrder, { isLoading: isCompleting }] =
    useCompleteOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();

  const onComplete = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await completeOrder({
      id: order.id,
      body: { paymentRef: data.paymentRef || undefined },
      params,
    });
    if (res?.data) {
      toast.success(t("orders.orderMarkedPaid"));
    } else {
      toast.error(res?.error?.data?.message || t("orders.completeFailed"));
    }
  };

  const onShip = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await shipOrder({
      id: order.id,
      body: {
        trackingId: data.trackingId || undefined,
        provider: data.provider || undefined,
      },
      params,
    });
    if (res?.data) {
      toast.success(t("orders.shippingUpdated"));
    } else {
      toast.error(
        res?.error?.data?.message || t("orders.shippingUpdateFailed"),
      );
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
          title={t("common.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <Pencil className="h-5 w-5 text-black dark:text-white" />
            {t("orders.editOrderTitle")} <span className="text-gray-400 font-normal">#{order?.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-8">
          {/* Payment Section */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 transition-all hover:border-black/30 dark:hover:border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                {t("orders.completePayment")}
              </h4>
            </div>
            <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
              <TextField
                label={t("orders.paymentReference")}
                placeholder={t("orders.txnRefOptional")}
                register={register}
                name="paymentRef"
                error={errors.paymentRef?.message}
                className="bg-white dark:bg-[#0b0f14]"
              />
              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isCompleting}
                  className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-gray-900 dark:from-white dark:via-gray-200 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-200 rounded-lg px-6 font-medium shadow-sm"
                >
                  {isCompleting ? t("common.processing") : t("orders.markPaid")}
                </Button>
              </div>
            </form>
          </div>

          {/* Shipping Section */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 border border-gray-100 dark:border-gray-800/50 transition-all hover:border-black/30 dark:hover:border-white/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                {t("orders.shipping")}
              </h4>
            </div>
            <form onSubmit={handleSubmit(onShip)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label={t("orders.trackingId")}
                  placeholder={t("orders.trackingId")}
                  register={register}
                  name="trackingId"
                  error={errors.trackingId?.message}
                  className="bg-white dark:bg-[#0b0f14]"
                />
                <TextField
                  label={t("orders.shippingProvider")}
                  placeholder={t("orders.providerPlaceholder")}
                  register={register}
                  name="provider"
                  error={errors.provider?.message}
                  className="bg-white dark:bg-[#0b0f14]"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 dark:bg-[#0b0f14] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 rounded-lg px-6 font-medium shadow-sm"
                  type="submit"
                  disabled={isShipping}
                >
                  {isShipping
                    ? t("orders.updating")
                    : t("orders.updateShipping")}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50/50 dark:bg-gray-900/20 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <Button
            className="bg-transparent border border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-lg"
            variant="ghost"
            onClick={closeAndReset}
          >
            {t("orders.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditForm;
