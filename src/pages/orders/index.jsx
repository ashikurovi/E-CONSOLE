import React, { useMemo } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, Package, XCircle, RotateCcw } from "lucide-react";
import {
  useGetOrdersQuery,
  useCompleteOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
} from "@/features/order/orderApiSlice";
import OrderForm from "./components/OrderForm";
import OrderEditForm from "./components/OrderEditForm";

const OrdersPage = () => {
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Customer", field: "customer" },
      { header: "Status", field: "status" },
      { header: "Paid", field: "paid" },
      { header: "Total", field: "total" },
      { header: "Created", field: "createdAt" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      orders.map((o) => ({
        id: o.id,
        customer: o.customer?.name ?? o.customerName ?? "-",
        status: o.status ?? "-",
        paid: o.isPaid ? "Yes" : "No",
        total:
          typeof o.totalAmount === "number"
            ? `$${Number(o.totalAmount).toFixed(2)}`
            : o.totalAmount ?? "-",
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : "-",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <OrderEditForm order={o} />

            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                const paymentRef = window.prompt("Payment reference (optional):") || undefined;
                const res = await completeOrder({ id: o.id, paymentRef });
                if (res?.data) toast.success("Order marked as paid");
                else toast.error(res?.error?.data?.message || "Failed to complete");
              }}
              disabled={isCompleting}
              title="Complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="default"
              size="icon"
              onClick={async () => {
                const res = await deliverOrder(o.id);
                if (res?.data) toast.success("Order delivered");
                else toast.error(res?.error?.data?.message || "Failed to deliver");
              }}
              disabled={isDelivering}
              title="Deliver"
            >
              <Truck className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                const trackingId = window.prompt("Tracking ID:") || undefined;
                const provider = window.prompt("Shipping Provider:") || undefined;
                const res = await shipOrder({ id: o.id, trackingId, provider });
                if (res?.data) toast.success("Order shipped");
                else toast.error(res?.error?.data?.message || "Failed to ship");
              }}
              disabled={isShipping}
              title="Ship"
            >
              <Package className="h-4 w-4" />
            </Button>

            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (!confirm("Cancel this order?")) return;
                const res = await cancelOrder(o.id);
                if (res?.data) toast.success("Order cancelled");
                else toast.error(res?.error?.data?.message || "Failed to cancel");
              }}
              disabled={isCancelling}
              title="Cancel"
            >
              <XCircle className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (!confirm("Refund this order?")) return;
                const res = await refundOrder(o.id);
                if (res?.data) toast.success("Order refunded");
                else toast.error(res?.error?.data?.message || "Failed to refund");
              }}
              disabled={isRefunding}
              title="Refund"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [orders, completeOrder, deliverOrder, shipOrder, cancelOrder, refundOrder, isCompleting, isDelivering, isShipping, isCancelling, isRefunding]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Orders</h2>
        <OrderForm />
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={orders.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default OrdersPage;