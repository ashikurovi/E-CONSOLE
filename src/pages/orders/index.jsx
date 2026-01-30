import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Truck, Package, XCircle, RotateCcw, FileText, Trash2, ClipboardCheck, Eye, Pencil } from "lucide-react";
import {
  useGetOrdersQuery,
  useCompleteOrderMutation,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
} from "@/features/order/orderApiSlice";
import { Link, useNavigate } from "react-router-dom";
import DeleteModal from "@/components/modals/DeleteModal";
import { generateOrderInvoice } from "@/utils/orderInvoice";
import { useSelector } from "react-redux";

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: orders = [], isLoading } = useGetOrdersQuery({ companyId: authUser?.companyId });
  const [completeOrder, { isLoading: isCompleting }] = useCompleteOrderMutation();
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });

  const headers = useMemo(
    () => [
      { header: t("orders.id"), field: "id" },
      { header: t("orders.customer"), field: "customer" },
      { header: t("common.status"), field: "status" },
      { header: t("orders.paid"), field: "paid" },
      { header: t("orders.total"), field: "total" },
      { header: t("orders.created"), field: "createdAt" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const tableData = useMemo(
    () =>
      orders.map((o) => ({
        id: o.id,
        customer: o.customer?.name ?? o.customerName ?? "-",
        status: o.status ?? "-",
        paid: o.isPaid ? t("orders.yes") : t("orders.no"),
        total:
          typeof o.totalAmount === "number"
            ? `$${Number(o.totalAmount).toFixed(2)}`
            : o.totalAmount ?? "-",
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : "-",
        actions: (() => {
          const status = o.status?.toLowerCase() || "";
          const isProcessing = status === "processing";
          const isCompleted = status === "completed" || status === "paid";
          const isDelivered = status === "delivered";
          const isShipped = status === "shipped";
          const isCancelled = status === "cancelled";
          const isRefunded = status === "refunded";
          const isFinalStatus = isShipped || isDelivered || isCancelled || isRefunded;

          return (
            <TooltipProvider>
              <div className="flex items-center gap-2 justify-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                      onClick={() => navigate(`/orders/${o.id}`)}
                      title={t("common.view")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                    <TooltipContent>
                    <p>{t("orders.viewOrder")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                      onClick={() => {
                        try {
                          generateOrderInvoice(o);
                          toast.success(t("orders.invoiceGenerated"));
                        } catch (error) {
                          toast.error(t("orders.invoiceFailed"));
                          console.error("Invoice generation error:", error);
                        }
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("orders.generateInvoice")}</p>
                  </TooltipContent>
                </Tooltip>
                {!isFinalStatus && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        onClick={() => navigate(`/orders/${o.id}/edit`)}
                        title={t("common.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.editOrder")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isProcessing && !isCompleted && !isFinalStatus && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
                        onClick={async () => {
                          const res = await processOrder({ id: o.id });
                          if (res?.data) toast.success(t("orders.orderProcessing"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isProcessing}
                      >
                        <ClipboardCheck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.markProcessing")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isCompleted && !isFinalStatus && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
                        onClick={async () => {
                          const paymentRef = window.prompt("Payment reference (optional):") || undefined;
                          const res = await completeOrder({ id: o.id, paymentRef });
                          if (res?.data) toast.success(t("orders.orderPaid"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isCompleting}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.markCompleted")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isDelivered && !isShipped && !isCancelled && !isRefunded && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        onClick={async () => {
                          const res = await deliverOrder(o.id);
                          if (res?.data) toast.success(t("orders.orderDelivered"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isDelivering}
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.markDelivered")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isShipped && !isDelivered && !isCancelled && !isRefunded && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                        onClick={async () => {
                          const trackingId = window.prompt("Tracking ID:") || undefined;
                          const provider = window.prompt("Shipping Provider:") || undefined;
                          const res = await shipOrder({ id: o.id, trackingId, provider });
                          if (res?.data) toast.success(t("orders.orderShipped"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isShipping}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.markShipped")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isCancelled && !isRefunded && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        onClick={async () => {
                          if (!confirm("Cancel this order?")) return;
                          const res = await cancelOrder(o.id);
                          if (res?.data) toast.success(t("orders.orderCancelled"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isCancelling}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.cancelOrder")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!isRefunded && !isCancelled && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                        onClick={async () => {
                          if (!confirm("Refund this order?")) return;
                          const res = await refundOrder(o.id);
                          if (res?.data) toast.success(t("orders.orderRefunded"));
                          else toast.error(res?.error?.data?.message || t("common.failed"));
                        }}
                        disabled={isRefunding}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.refundOrder")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {(isRefunded || isCancelled) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
                        onClick={() => setDeleteModal({ isOpen: true, order: o })}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.deleteOrder")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TooltipProvider>
          );
        })(),
      })),
    [orders, completeOrder, processOrder, deliverOrder, shipOrder, cancelOrder, refundOrder, deleteOrder, isCompleting, isProcessing, isDelivering, isShipping, isCancelling, isRefunding, isDeleting, t]
  );

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder(deleteModal.order.id);
    if (res?.data || !res?.error) {
      toast.success(t("orders.orderDeleted"));
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{t("orders.title")}</h2>
        <Button size="sm" onClick={() => navigate("/orders/create")}>
          {t("orders.createOrder")}
        </Button>
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
        title={t("orders.deleteOrder")}
        description={t("orders.deleteOrderDesc")}
        itemName={deleteModal.order ? `Order #${deleteModal.order.id}` : ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default OrdersPage;