import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
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

const OrderEditForm = ({ order }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      paymentRef: order?.paymentReference || "",
      trackingId: order?.shippingTrackingId || "",
      provider: order?.shippingProvider || "",
    },
  });

  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();

  const onComplete = async (data) => {
    const res = await completeOrder({ id: order.id, paymentRef: data.paymentRef || undefined });
    if (res?.data) {
      toast.success("Order marked as paid");
    } else {
      toast.error(res?.error?.data?.message || "Failed to complete");
    }
  };

  const onShip = async (data) => {
    const res = await shipOrder({ id: order.id, trackingId: data.trackingId || undefined, provider: data.provider || undefined });
    if (res?.data) {
      toast.success("Shipping info updated");
    } else {
      toast.error(res?.error?.data?.message || "Failed to update shipping");
    }
  };

  const closeAndReset = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Edit</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Order #{order?.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-medium mb-3">Complete (Payment)</h4>
            <form onSubmit={handleSubmit(onComplete)} className="space-y-3">
              <TextField label="Payment Reference" placeholder="Txn Ref (optional)" register={register} name="paymentRef" />
              <DialogFooter>
                <Button type="submit" disabled={isCompleting}>
                  {isCompleting ? "Processing..." : "Mark Paid"}
                </Button>
              </DialogFooter>
            </form>
          </section>

          <section>
            <h4 className="text-sm font-medium mb-3">Shipping</h4>
            <form onSubmit={handleSubmit(onShip)} className="space-y-3">
              <TextField label="Tracking ID" placeholder="Tracking ID" register={register} name="trackingId" />
              <TextField label="Shipping Provider" placeholder="e.g., DHL" register={register} name="provider" />
              <DialogFooter>
                <Button type="submit" variant="outline" disabled={isShipping}>
                  {isShipping ? "Updating..." : "Update Shipping"}
                </Button>
              </DialogFooter>
            </form>
          </section>

          <div className="fl justify-end gap-2">
            <Button variant="outline" onClick={closeAndReset}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditForm;