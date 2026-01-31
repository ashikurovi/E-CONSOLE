import React, { useCallback, useMemo, useState } from "react";
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
import { Truck, Package, XCircle, RotateCcw, FileText, Trash2, ClipboardCheck, Eye, Clock, CheckCircle, DollarSign, CreditCard, MapPin, Copy, Printer, ScanBarcode, Box, Hourglass, Loader2, CheckSquare, Banknote, ShoppingBag } from "lucide-react";
import {
  useGetOrdersQuery,
  useGetOrderStatsQuery,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useCancelOrderMutation,
  useRefundOrderMutation,
  useDeleteOrderMutation,
  useBarcodeScanMutation,
} from "@/features/order/orderApiSlice";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DeleteModal from "@/components/modals/DeleteModal";
import TextField from "@/components/input/TextField";
import { Switch } from "@/components/ui/switch";
import { generateOrderInvoice } from "@/utils/orderInvoice";
import { generateParcelSlip } from "@/utils/parcelSlip";
import { useSelector } from "react-redux";
import Dropdown from "@/components/dropdown/dropdown";
import StatCard from "@/components/cards/stat-card";
import OrderViewModal from "./components/OrderViewModal";

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: orders = [], isLoading } = useGetOrdersQuery({ companyId: authUser?.companyId });
  const { data: stats = {} } = useGetOrderStatsQuery({ companyId: authUser?.companyId });
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [barcodeScan, { isLoading: isBarcodeScanning }] = useBarcodeScanMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, order: null });
  const [processModal, setProcessModal] = useState({ isOpen: false, order: null });
  const [shipModal, setShipModal] = useState({ isOpen: false, order: null });
  const [shipForm, setShipForm] = useState({ trackingId: "", provider: "" });
  const [deliverModal, setDeliverModal] = useState({ isOpen: false, order: null });
  const [deliverForm, setDeliverForm] = useState({ comment: "", markAsPaid: true });
  const [barcodeScanModal, setBarcodeScanModal] = useState({ isOpen: false, value: "" });
  const [statusFilter, setStatusFilter] = useState(null);
  const [paymentFilter, setPaymentFilter] = useState(null);

  const statusFilterOptions = useMemo(
    () => [
      { label: t("orders.filterAllStatus"), value: null },
      { label: t("orders.filterPending"), value: "pending" },
      { label: t("orders.filterProcessing"), value: "processing" },
      { label: t("orders.filterPaid"), value: "paid" },
      { label: t("orders.filterShipped"), value: "shipped" },
      { label: t("orders.filterDelivered"), value: "delivered" },
      { label: t("orders.filterCancelled"), value: "cancelled" },
      { label: t("orders.filterRefunded"), value: "refunded" },
    ],
    [t]
  );

  const paymentFilterOptions = useMemo(
    () => [
      { label: t("orders.filterAllPayment"), value: null },
      { label: t("orders.paid"), value: "paid" },
      { label: t("orders.unpaid"), value: "unpaid" },
    ],
    [t]
  );

  const filteredOrders = useMemo(() => {
    let result = orders;
    if (statusFilter?.value) {
      result = result.filter((o) => (o.status?.toLowerCase() || "") === statusFilter.value);
    }
    if (paymentFilter?.value) {
      const isPaid = paymentFilter.value === "paid";
      result = result.filter((o) => o.isPaid === isPaid);
    }
    // Sort by createdAt descending so newest orders appear at top
    return [...result].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders, statusFilter, paymentFilter]);

  const headers = useMemo(
    () => [
      { header: t("orders.id"), field: "id" },
      { header: t("orders.customer"), field: "customer" },
      { header: t("common.status"), field: "status" },
      { header: t("orders.paid"), field: "paid" },
      { header: t("orders.total"), field: "total" },
      { header: t("orders.trackingId"), field: "trackingId" },
      { header: t("orders.created"), field: "createdAt" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );

  const copyToClipboard = useCallback(
    (text) => {
      if (!text) return;
      navigator.clipboard.writeText(text).then(
        () => toast.success(t("common.copied")),
        () => toast.error(t("common.copyFailed"))
      );
    },
    [t]
  );

  const getStatusLabel = (status) => {
    const s = (status || "").toLowerCase();
    const map = {
      pending: t("orders.filterPending"),
      processing: t("orders.filterProcessing"),
      paid: t("orders.filterPaid"),
      shipped: t("orders.filterShipped"),
      delivered: t("orders.filterDelivered"),
      cancelled: t("orders.filterCancelled"),
      refunded: t("orders.filterRefunded"),
      completed: t("orders.filterPaid"),
    };
    return map[s] ?? (status || "-");
  };

  const getRowClassNameByStatus = (item) => {
    const s = (item?.status || "").toLowerCase();
    const map = {
      pending: "bg-[#DCE865]/20 dark:bg-[#DCE865]/10 hover:bg-[#DCE865]/30 dark:hover:bg-[#DCE865]/20 !text-black dark:!text-[#DCE865]",
      processing: "bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60",
      paid: "bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-950/60",
      shipped: "bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-950/60",
      delivered: "bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/40 !text-green-800 dark:!text-green-300",
      cancelled: "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50",
      refunded: "bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800/70",
      completed: "bg-green-50 dark:bg-green-950/40 hover:bg-green-100 dark:hover:bg-green-950/60",
    };
    return map[s] ?? "";
  };

  const tableData = useMemo(
    () =>
      filteredOrders.map((o) => ({
        id: o.id,
        customer: o.customer?.name ?? o.customerName ?? "-",
        status: getStatusLabel(o.status),
        _rawStatus: (o.status || "").toLowerCase(),
        paid: o.isPaid ? t("orders.yes") : t("orders.no"),
        total:
          typeof o.totalAmount === "number"
            ? `$${Number(o.totalAmount).toFixed(2)}`
            : o.totalAmount ?? "-",
        trackingId: o.shippingTrackingId ? (
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm truncate max-w-[120px]" title={o.shippingTrackingId}>
              {o.shippingTrackingId}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => copyToClipboard(o.shippingTrackingId)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("common.copy")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          "-"
        ),
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleString() : "-",
        actions: (() => {
          const status = o.status?.toLowerCase() || "";
          const isProcessing = status === "processing";
          const isCompleted = status === "completed" || status === "paid";
          const isDelivered = status === "delivered";
          const isShipped = status === "shipped";
          const isCancelled = status === "cancelled";
          const isRefunded = status === "refunded";

          // Processing: show Ship only. Deliver only when shipped.
          const showShipDeliver = (isProcessing || isCompleted) && !isShipped && !isDelivered && !isCancelled && !isRefunded;
          // Shipped: hide Ship. Show Deliver only.
          const showDeliverWhenShipped = isShipped && !isDelivered && !isCancelled && !isRefunded;
          // Delivered: only View, Invoice, Delete
          const showOnlyViewInvoiceDelete = isDelivered;
          // Pending: show Process, Cancel. Shipped: show Cancel.
          const showProcessCancel = !isProcessing && !isCompleted && !isShipped && !isDelivered && !isCancelled && !isRefunded;
          const showCancelWhenShipped = isShipped && !isDelivered && !isCancelled && !isRefunded;

          return (
            <TooltipProvider>
              <div className="flex items-center gap-2 justify-end">
                <OrderViewModal order={o} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
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

                {o.shippingTrackingId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        onClick={() => navigate(`/orders/track?trackingId=${encodeURIComponent(o.shippingTrackingId)}`)}
                        title={t("orders.trackOrder")}
                      >
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.trackOrder")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {isShipped && o.shippingTrackingId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        onClick={async () => {
                          try {
                            // Company domain from auth/me API: customDomain (if active) or subdomain
                            let companyDomain =
                              import.meta.env.VITE_APP_URL || import.meta.env.VITE_TRACKING_PAGE_URL;
                            if (authUser?.customDomain && authUser?.customDomainStatus === "active") {
                              companyDomain = `https://${authUser.customDomain.replace(/^https?:\/\//, "")}`;
                            } else if (authUser?.subdomain) {
                              const base = import.meta.env.VITE_APP_BASE_DOMAIN || "squadcart.com";
                              companyDomain = `https://${authUser.subdomain}.${base}`;
                            }
                            await generateParcelSlip(o, {
                              companyName: authUser?.companyName,
                              companyLogo: authUser?.companyLogo,
                              trackingPageUrl: companyDomain,
                            });
                            toast.success(t("orders.parcelSlipGenerated"));
                          } catch (error) {
                            toast.error(t("orders.parcelSlipFailed"));
                            console.error("Parcel slip error:", error);
                          }
                        }}
                        title={t("orders.printParcelSlip")}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.printParcelSlip")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {showProcessCancel && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        onClick={() => setProcessModal({ isOpen: true, order: o })}
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

                {showShipDeliver && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                          onClick={() => {
                            setShipModal({ isOpen: true, order: o });
                            setShipForm({
                              trackingId: o.shippingTrackingId || "",
                              provider: o.shippingProvider || "",
                            });
                          }}
                          disabled={isShipping}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("orders.markShipped")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                          onClick={() => {
                            setDeliverModal({ isOpen: true, order: o });
                            setDeliverForm({ comment: "", markAsPaid: true });
                          }}
                          disabled={isDelivering}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("orders.markDelivered")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}

                {showDeliverWhenShipped && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        onClick={() => {
                          setDeliverModal({ isOpen: true, order: o });
                          setDeliverForm({ comment: "", markAsPaid: true });
                        }}
                        disabled={isDelivering}
                      >
                        <Package className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("orders.markDelivered")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {(showProcessCancel || showCancelWhenShipped) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white hover:text-red-600 dark:hover:text-red-400"
                        onClick={async () => {
                          if (!confirm("Cancel this order?")) return;
                          const res = await cancelOrder({ id: o.id });
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

                {isCancelled && !isRefunded && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white"
                        onClick={async () => {
                          if (!confirm("Refund this order?")) return;
                          const res = await refundOrder({ id: o.id });
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

                {(showOnlyViewInvoiceDelete || isRefunded) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/5 hover:bg-black/10 text-black dark:bg-white/10 dark:hover:bg-white/20 dark:text-white hover:text-red-600 dark:hover:text-red-400"
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
    [filteredOrders, processOrder, deliverOrder, shipOrder, cancelOrder, refundOrder, deleteOrder, isProcessing, isDelivering, isShipping, isCancelling, isRefunding, isDeleting, copyToClipboard, t, navigate, authUser]
  );

  const getRowClassName = (item) => getRowClassNameByStatus({ status: item?._rawStatus });

  const handleProcess = async () => {
    if (!processModal.order) return;
    const res = await processOrder({ id: processModal.order.id });
    if (res?.data) {
      toast.success(t("orders.orderProcessing"));
      setProcessModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.order) return;
    const res = await deleteOrder({ id: deleteModal.order.id });
    if (res?.data || !res?.error) {
      toast.success(t("orders.orderDeleted"));
      setDeleteModal({ isOpen: false, order: null });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleDeliver = async () => {
    if (!deliverModal.order) return;
    const res = await deliverOrder({
      id: deliverModal.order.id,
      body: {
        comment: deliverForm.comment?.trim() || undefined,
        markAsPaid: deliverForm.markAsPaid,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderDelivered"));
      setDeliverModal({ isOpen: false, order: null });
      setDeliverForm({ comment: "", markAsPaid: true });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const handleShip = async () => {
    if (!shipModal.order) return;
    const res = await shipOrder({
      id: shipModal.order.id,
      body: {
        trackingId: shipForm.trackingId?.trim() || undefined,
        provider: shipForm.provider?.trim() || undefined,
      },
    });
    if (res?.data) {
      toast.success(t("orders.orderShipped"));
      setShipModal({ isOpen: false, order: null });
      setShipForm({ trackingId: "", provider: "" });
    } else {
      toast.error(res?.error?.data?.message || t("common.failed"));
    }
  };

  const formatAmount = (val) => {
    const num = Number(val);
    return isNaN(num) ? "0" : num.toFixed(2);
  };

  const statsCards = [
    { title: t("orders.statsTotal"), value: stats.total ?? 0, icon: ShoppingBag, tone: "default" },
    { title: t("orders.statsPending"), value: stats.pending ?? 0, icon: Hourglass, tone: "blue" },
    { title: t("orders.statsProcessing"), value: stats.processing ?? 0, icon: Loader2, tone: "blue" },
    { title: t("orders.statsShipped"), value: stats.shipped ?? 0, icon: Truck, tone: "blue" },
    { title: t("orders.statsDelivered"), value: stats.delivered ?? 0, icon: CheckSquare, tone: "green" },
    { title: t("orders.statsRevenue"), value: `৳${formatAmount(stats.totalRevenue)}`, icon: Banknote, tone: "green" },
    { title: t("orders.statsUnpaid"), value: stats.unpaidCount ?? 0, icon: CreditCard, tone: "red" },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
        {statsCards.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} icon={s.icon} tone={s.tone} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          {t("orders.title")}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Dropdown
            name={t("orders.filterByStatus")}
            options={statusFilterOptions}
            setSelectedOption={setStatusFilter}
          >
            {statusFilter?.label ?? t("orders.filterAllStatus")}
          </Dropdown>
          <Dropdown
            name={t("orders.filterByPayment")}
            options={paymentFilterOptions}
            setSelectedOption={setPaymentFilter}
          >
            {paymentFilter?.label ?? t("orders.filterAllPayment")}
          </Dropdown>
          <Button size="sm" variant="outline" onClick={() => navigate("/orders/track")}>
            <MapPin className="h-4 w-4 mr-2" />
            {t("orders.trackOrder")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setBarcodeScanModal({ isOpen: true, value: "" })}>
            <ScanBarcode className="h-4 w-4 mr-2" />
            {t("orders.scanBarcode")}
          </Button>
          <Button size="sm" onClick={() => navigate("/orders/create")}>
            {t("orders.createOrder")}
          </Button>
        </div>
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={filteredOrders.length}
        isLoading={isLoading}
        py="py-2"
        getRowClassName={getRowClassName}
      />

      {/* Process Confirmation Modal */}
      <Dialog open={processModal.isOpen} onOpenChange={(open) => !open && setProcessModal({ isOpen: false, order: null })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.markProcessing")}</DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("orders.confirmProcessing")} Order #{processModal.order?.id}?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setProcessModal({ isOpen: false, order: null })} disabled={isProcessing}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleProcess} disabled={isProcessing} className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-gray-900 dark:from-white dark:via-gray-200 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-200">
              {isProcessing ? t("common.processing") : t("orders.markProcessing")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      {/* Ship Modal */}
      <Dialog
        open={shipModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShipModal({ isOpen: false, order: null });
            setShipForm({ trackingId: "", provider: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.markShipped")} - Order #{shipModal.order?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.trackingId")}
              placeholder={t("orders.trackingId")}
              value={shipForm.trackingId}
              onChange={(e) => setShipForm((prev) => ({ ...prev, trackingId: e.target.value }))}
            />
            <TextField
              label={t("orders.shippingProvider")}
              placeholder={t("orders.providerPlaceholder")}
              value={shipForm.provider}
              onChange={(e) => setShipForm((prev) => ({ ...prev, provider: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setShipModal({ isOpen: false, order: null });
                setShipForm({ trackingId: "", provider: "" });
              }}
              disabled={isShipping}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleShip} disabled={isShipping} className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-gray-900 dark:from-white dark:via-gray-200 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-200">
              {isShipping ? t("common.processing") : t("orders.markShipped")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scan Modal */}
      <Dialog
        open={barcodeScanModal.isOpen}
        onOpenChange={(open) => !open && setBarcodeScanModal({ isOpen: false, value: "" })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.scanBarcode")}</DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("orders.scanBarcodeDesc")}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.trackingId")}
              placeholder={t("orders.enterTrackingId")}
              value={barcodeScanModal.value}
              onChange={(e) => setBarcodeScanModal((prev) => ({ ...prev, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (e.target?.value || barcodeScanModal.value || "").trim();
                  if (val) {
                    barcodeScan({ body: { trackingId: val } })
                      .unwrap()
                      .then(() => {
                        toast.success(t("orders.barcodeScanRecorded"));
                        setBarcodeScanModal({ isOpen: false, value: "" });
                      })
                      .catch((err) => toast.error(err?.data?.message || t("common.failed")));
                  }
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setBarcodeScanModal({ isOpen: false, value: "" })}
              disabled={isBarcodeScanning}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={async () => {
                const val = barcodeScanModal.value?.trim();
                if (!val) {
                  toast.error(t("orders.trackingIdRequired"));
                  return;
                }
                try {
                  await barcodeScan({ body: { trackingId: val } }).unwrap();
                  toast.success(t("orders.barcodeScanRecorded"));
                  setBarcodeScanModal({ isOpen: false, value: "" });
                } catch (err) {
                  toast.error(err?.data?.message || t("common.failed"));
                }
              }}
              disabled={isBarcodeScanning}
              className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-gray-900 dark:from-white dark:via-gray-200 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-200"
            >
              {isBarcodeScanning ? t("common.processing") : t("orders.recordScan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliver Modal */}
      <Dialog
        open={deliverModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeliverModal({ isOpen: false, order: null });
            setDeliverForm({ comment: "", markAsPaid: true });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.markDelivered")} - Order #{deliverModal.order?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.note")}
              placeholder={t("orders.notePlaceholder")}
              value={deliverForm.comment}
              onChange={(e) => setDeliverForm((prev) => ({ ...prev, comment: e.target.value }))}
              multiline
              rows={3}
            />
            <div className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 p-4">
              <label htmlFor="markAsPaid" className="text-sm font-medium cursor-pointer">
                {t("orders.markPaid")}
              </label>
              <Switch
                id="markAsPaid"
                checked={deliverForm.markAsPaid}
                onCheckedChange={(checked) => setDeliverForm((prev) => ({ ...prev, markAsPaid: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setDeliverModal({ isOpen: false, order: null });
                setDeliverForm({ comment: "", markAsPaid: true });
              }}
              disabled={isDelivering}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleDeliver} disabled={isDelivering} className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white hover:from-black hover:to-gray-900 dark:from-white dark:via-gray-200 dark:to-white dark:text-black dark:hover:from-gray-100 dark:hover:to-gray-200">
              {isDelivering ? t("common.processing") : t("orders.markDelivered")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;