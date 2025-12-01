import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, Package, XCircle, RotateCcw, FileText, Trash2 } from "lucide-react";
import {
  useGetOrdersQuery,
  useCompleteOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
} from "@/features/order/orderApiSlice";
import OrderForm from "./components/OrderForm";
import OrderEditForm from "./components/OrderEditForm";
import OrderViewModal from "./components/OrderViewModal";
import DeleteModal from "@/components/modals/DeleteModal";
import { generateOrderInvoice } from "@/utils/orderInvoice";

const OrdersPage = () => {
  const { data: orders = [], isLoading } = useGetOrdersQuery();
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });

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
        actions: (() => {
          const status = o.status?.toLowerCase() || "";
          const isCompleted = status === "completed" || status === "paid";
          const isDelivered = status === "delivered";
          const isShipped = status === "shipped";
          const isCancelled = status === "cancelled";
          const isRefunded = status === "refunded";
          const isFinalStatus = isShipped || isDelivered || isCancelled || isRefunded;

          return (
            <div className="flex items-center gap-2 justify-end">
              <OrderViewModal order={o} />
              <Button
                variant="ghost"
                size="icon"
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                onClick={() => {
                  try {
                    generateOrderInvoice(o);
                    toast.success("Invoice generated successfully");
                  } catch (error) {
                    toast.error("Failed to generate invoice");
                    console.error("Invoice generation error:", error);
                  }
                }}
                title="Generate Invoice"
              >
                <FileText className="h-4 w-4" />
              </Button>
              {!isFinalStatus && <OrderEditForm order={o} />}

              {!isCompleted && !isFinalStatus && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
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
              )}

              {!isDelivered && !isShipped && !isCancelled && !isRefunded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
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
              )}

              {!isShipped && !isDelivered && !isCancelled && !isRefunded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
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
              )}

              {!isCancelled && !isRefunded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
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
              )}

              {!isRefunded && !isCancelled && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
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
              )}

              {(isRefunded || isCancelled) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                  onClick={() => setDeleteModal({ isOpen: true, order: o })}
                  disabled={isDeleting}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })(),
      })),
    [orders, completeOrder, deliverOrder, shipOrder, cancelOrder, refundOrder, deleteOrder, isCompleting, isDelivering, isShipping, isCancelling, isRefunding, isDeleting]
  );

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder(deleteModal.order.id);
    if (res?.data || !res?.error) {
      toast.success("Order deleted");
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || "Failed to delete order");
    }
  };

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

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, order: null })}
        onConfirm={handleDelete}
        title="Delete Order"
        description="This action cannot be undone. This will permanently delete the order."
        itemName={deleteModal.order ? `Order #${deleteModal.order.id}` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OrdersPage;