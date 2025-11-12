import React, { useMemo } from "react";
import ReusableTable from "@/components/table/reusable-table";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useGetOrdersQuery } from "@/features/order/orderApiSlice";
import { useGetOrderItemsQuery } from "@/features/ordersitem/ordersItemApiSlice";
import {
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
} from "@/features/order/orderApiSlice";

const OrdersItemsPage = () => {
  const { data: orders = [], isLoading:isOrder } = useGetOrdersQuery();
  const { data: items = [], isLoading } = useGetOrderItemsQuery();

  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const headers = useMemo(
    () => [
      { header: "Order ID", field: "orderId" },
      { header: "Product", field: "product" },
      { header: "SKU", field: "sku" },
      { header: "Quantity", field: "quantity" },
      { header: "Unit Price", field: "unitPrice" },
      { header: "Total", field: "totalPrice" },
      { header: "Order Status", field: "orderStatus" },
      { header: "Created", field: "createdAt" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(() => {
    return items.map((it) => ({
      orderId: it.orderId,
      product: it.productName,
      sku: it.sku,
      quantity: it.quantity,
      unitPrice:
        typeof it.unitPrice === "number"
          ? `$${Number(it.unitPrice).toFixed(2)}`
          : it.unitPrice ?? "-",
      totalPrice:
        typeof it.totalPrice === "number"
          ? `$${Number(it.totalPrice).toFixed(2)}`
          : it.totalPrice ?? "-",
      orderStatus: it.orderStatus,
      createdAt: it.createdAt ? new Date(it.createdAt).toLocaleString() : "-",
      actions: (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={async () => {
              const res = await deliverOrder(it.orderId);
              if (res?.data) toast.success("Order delivered");
              else toast.error(res?.error?.data?.message || "Failed to deliver");
            }}
            disabled={isDelivering}
          >
            {isDelivering ? "..." : "Deliver"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const trackingId = window.prompt("Tracking ID:") || undefined;
              const provider = window.prompt("Shipping Provider:") || undefined;
              const res = await shipOrder({ id: it.orderId, trackingId, provider });
              if (res?.data) toast.success("Order shipped");
              else toast.error(res?.error?.data?.message || "Failed to ship");
            }}
            disabled={isShipping}
          >
            {isShipping ? "..." : "Ship"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              if (!confirm("Cancel this order?")) return;
              const res = await cancelOrder(it.orderId);
              if (res?.data) toast.success("Order cancelled");
              else toast.error(res?.error?.data?.message || "Failed to cancel");
            }}
            disabled={isCancelling}
          >
            {isCancelling ? "..." : "Cancel"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              if (!confirm("Refund this order?")) return;
              const res = await refundOrder(it.orderId);
              if (res?.data) toast.success("Order refunded");
              else toast.error(res?.error?.data?.message || "Failed to refund");
            }}
            disabled={isRefunding}
          >
            {isRefunding ? "..." : "Refund"}
          </Button>
        </div>
      ),
    }));
  }, [items, deliverOrder, shipOrder, cancelOrder, refundOrder, isDelivering, isShipping, isCancelling, isRefunding]);
  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Order Items</h2>
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={tableData.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default OrdersItemsPage;