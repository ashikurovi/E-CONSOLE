import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
  const { user } = useSelector((state) => state.auth);
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
    const params = { companyId: user?.companyId };
    const res = await completeOrder({ id: order.id, body: { paymentRef: data.paymentRef || undefined }, params });
    if (res?.data) {
      toast.success("Order marked as paid");
    } else {
      toast.error(res?.error?.data?.message || "Failed to complete");
    }
  };

  const onShip = async (data) => {
    const params = { companyId: user?.companyId };
    const res = await shipOrder({ id: order.id, body: { trackingId: data.trackingId || undefined, provider: data.provider || undefined }, params });
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
        <Button
          variant="ghost"
          size="icon"
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
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
                <Button className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400" type="submit" variant="outline" disabled={isShipping}>
                  {isShipping ? "Updating..." : "Update Shipping"}
                </Button>
              </DialogFooter>
            </form>
          </section>

          <div className="fl justify-end gap-2">
            <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" variant="outline" onClick={closeAndReset}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditForm;