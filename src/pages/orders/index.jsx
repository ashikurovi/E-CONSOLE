import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import {
  FileText,
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  Calendar,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  useGetOrdersQuery,
  useProcessOrderMutation,
  useDeliverOrderMutation,
  useShipOrderMutation,
  useDeleteOrderMutation,
  useGetOrderStatsQuery,
  useBarcodeScanMutation,
} from "@/features/order/orderApiSlice";
import { useRecordPartialPaymentMutation } from "@/features/payment/paymentApiSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "@/components/modal/delete-modal";
import TextField from "@/components/input/TextField";
import { Switch } from "@/components/ui/switch";
import { useSelector } from "react-redux";
import OrderStatCard from "./components/OrderStatCard";

const OrdersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: orders = [], isLoading } = useGetOrdersQuery({
    companyId: authUser?.companyId,
  });
  const { data: stats = {} } = useGetOrderStatsQuery({
    companyId: authUser?.companyId,
  });
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [deliverOrder, { isLoading: isDelivering }] = useDeliverOrderMutation();
  const [shipOrder, { isLoading: isShipping }] = useShipOrderMutation();
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [barcodeScan, { isLoading: isBarcodeScanning }] =
    useBarcodeScanMutation();
  const [recordPartialPayment, { isLoading: isRecordingPartial }] =
    useRecordPartialPaymentMutation();
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    order: null,
  });
  const [processModal, setProcessModal] = useState({
    isOpen: false,
    order: null,
  });
  const [shipModal, setShipModal] = useState({ isOpen: false, order: null });
  const [shipForm, setShipForm] = useState({ trackingId: "", provider: "" });
  const [deliverModal, setDeliverModal] = useState({
    isOpen: false,
    order: null,
  });
  const [deliverForm, setDeliverForm] = useState({
    comment: "",
    markAsPaid: true,
  });
  const [barcodeScanModal, setBarcodeScanModal] = useState({
    isOpen: false,
    value: "",
  });
  const [partialPaymentModal, setPartialPaymentModal] = useState({
    isOpen: false,
    order: null,
  });
  const [partialPaymentForm, setPartialPaymentForm] = useState({
    partialAmount: "",
    partialPaymentRef: "",
  });
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Unfulfilled", "Unpaid", "Open", "Closed"];

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Tab filtering
    if (activeTab === "Unfulfilled") {
      result = result.filter((o) => (o.status?.toLowerCase() || "") === "pending" || (o.status?.toLowerCase() || "") === "processing");
    } else if (activeTab === "Unpaid") {
      result = result.filter((o) => !o.isPaid);
    } else if (activeTab === "Open") {
      result = result.filter((o) => !["delivered", "cancelled", "refunded"].includes((o.status?.toLowerCase() || "")));
    } else if (activeTab === "Closed") {
      result = result.filter((o) => ["delivered", "cancelled", "refunded"].includes((o.status?.toLowerCase() || "")));
    }
    // Sort by createdAt descending so newest orders appear at top
    return [...result].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [orders, activeTab]);

  const headers = useMemo(
    () => [
      { header: t("orders.id"), field: "id" },
      { header: t("orders.created"), field: "createdAt" },
      { header: t("orders.customer"), field: "customer" },
      { header: t("orders.paid"), field: "paid" },
      { header: t("orders.total"), field: "total" },
      { header: t("orders.delivery") || "Delivery", field: "delivery" },
      { header: t("orders.items") || "Items", field: "items" },
      { header: t("common.status") || "Fulfilment", field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t],
  );





  const tableData = useMemo(
    () =>
      filteredOrders.map((o) => ({
        id: <span className="font-bold text-gray-900 dark:text-gray-100 italic">#{o.id}</span>,
        createdAt: o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "-",
        customer: <span className="font-medium text-gray-700 dark:text-gray-300">{o.customer?.name ?? o.customerName ?? "-"}</span>,
        paid: (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${o.isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${o.isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {o.isPaid ? 'Success' : 'Pending'}
          </div>
        ),
        total: (
          <span className="font-bold text-gray-900 dark:text-gray-100">
             ৳{Number(o.totalAmount || 0).toLocaleString()}
          </span>
        ),
        delivery: <span className="text-gray-400 font-medium">N/A</span>,
        items: <span className="text-gray-600 dark:text-gray-400 font-medium">{o.items?.length || 0} items</span>,
        status: (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${['delivered', 'paid', 'completed'].includes(o.status?.toLowerCase()) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${['delivered', 'paid', 'completed'].includes(o.status?.toLowerCase()) ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {['delivered', 'paid', 'completed'].includes(o.status?.toLowerCase()) ? 'Fulfilled' : 'Unfulfilled'}
          </div>
        ),
        actions: (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/orders/${o.id}`)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <FileText className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        ),
      })),
    [
      filteredOrders,
      navigate,
    ],
  );


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

  const handlePartialPayment = async () => {
    if (!partialPaymentModal.order) return;
    const amount = Number(partialPaymentForm.partialAmount);
    if (!amount || amount <= 0) {
      toast.error(
        t("orders.validation.amountRequired") || "Amount is required",
      );
      return;
    }
    const total = Number(partialPaymentModal.order.totalAmount ?? 0);
    const paid = Number(partialPaymentModal.order.paidAmount ?? 0);
    const remaining = total - paid;
    if (amount > remaining) {
      toast.error(
        t("orders.validation.amountExceedsRemaining") ||
          "Amount exceeds remaining balance",
      );
      return;
    }
    const res = await recordPartialPayment({
      id: partialPaymentModal.order.id,
      body: {
        amount,
        paymentRef: partialPaymentForm.partialPaymentRef?.trim() || undefined,
      },
      params: { companyId: authUser?.companyId },
    });
    if (res?.data) {
      toast.success(t("orders.partialPaymentRecorded"));
      setPartialPaymentModal({ isOpen: false, order: null });
      setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
    } else {
      toast.error(
        res?.error?.data?.message || t("orders.partialPaymentFailed"),
      );
    }
  };

  // Mock data for sparklines
  const sparklineData = [
    { value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, 
    { value: 22 }, { value: 45 }, { value: 35 }, { value: 55 }
  ];

  const orderStats = [
    { title: "Total Orders", value: stats.totalOrders || 0, delta: "+25.2%", tone: "green" },
    { title: "Order items over time", value: stats.unpaidCount || 0, delta: "+18.2%", tone: "green" },
    { title: "Returns Orders", value: "0", delta: "-1.2%", tone: "red" },
    { title: "Fulfilled orders over time", value: stats.delivered || 0, delta: "+12.2%", tone: "green" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-neutral-950 p-6 space-y-8">
      {/* Top Search Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search or type command..." 
            className="w-full h-11 pl-12 pr-12 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-purple-500/10 transition-all text-sm font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[10px] font-bold text-gray-400">
            ⌘ /
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Orders</h1>
          <Button variant="outline" className="h-10 px-4 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Jan 1 - Jan 30, 2024
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="h-10 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold">
            More actions
            <ChevronRight className="w-4 h-4 ml-2 rotate-90" />
          </Button>
          <Button onClick={() => navigate("/orders/create")} className="h-10 rounded-xl bg-[#5347CE] hover:bg-[#4338ca] text-white text-sm font-bold px-6">
            Create order
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {orderStats.map((stat, i) => (
          <OrderStatCard 
            key={i}
            title={stat.title}
            value={stat.value}
            delta={stat.delta}
            tone={stat.tone}
            chartData={sparklineData}
          />
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center p-1 bg-gray-100/50 dark:bg-neutral-900/50 rounded-2xl w-fit">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-neutral-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {tab}
              </button>
            ))}
            <button className="px-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center gap-1.5 text-sm font-bold">
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800">
              <Search className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800">
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white dark:hover:bg-neutral-900 border border-transparent hover:border-gray-100 dark:hover:border-neutral-800">
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900/40 rounded-[24px] border border-gray-100 dark:border-neutral-800 overflow-hidden">
          <ReusableTable
            data={tableData}
            headers={headers}
            total={filteredOrders.length}
            isLoading={isLoading}
            searchable={false}
            py="py-4"
          />
        </div>
      </div>

      {/* Process Confirmation Modal */}
      <Dialog
        open={processModal.isOpen}
        onOpenChange={(open) =>
          !open && setProcessModal({ isOpen: false, order: null })
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("orders.markProcessing")}</DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("orders.confirmProcessing")} Order #{processModal.order?.id}?
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setProcessModal({ isOpen: false, order: null })}
              disabled={isProcessing}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {isProcessing
                ? t("common.processing")
                : t("orders.markProcessing")}
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
            <DialogTitle>
              {t("orders.markShipped")} - Order #{shipModal.order?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.trackingId")}
              placeholder={t("orders.trackingId")}
              value={shipForm.trackingId}
              onChange={(e) =>
                setShipForm((prev) => ({ ...prev, trackingId: e.target.value }))
              }
            />
            <TextField
              label={t("orders.shippingProvider")}
              placeholder={t("orders.providerPlaceholder")}
              value={shipForm.provider}
              onChange={(e) =>
                setShipForm((prev) => ({ ...prev, provider: e.target.value }))
              }
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
            <Button
              onClick={handleShip}
              disabled={isShipping}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isShipping ? t("common.processing") : t("orders.markShipped")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scan Modal */}
      <Dialog
        open={barcodeScanModal.isOpen}
        onOpenChange={(open) =>
          !open && setBarcodeScanModal({ isOpen: false, value: "" })
        }
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
              onChange={(e) =>
                setBarcodeScanModal((prev) => ({
                  ...prev,
                  value: e.target.value,
                }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = (
                    e.target?.value ||
                    barcodeScanModal.value ||
                    ""
                  ).trim();
                  if (val) {
                    barcodeScan({ body: { trackingId: val } })
                      .unwrap()
                      .then(() => {
                        toast.success(t("orders.barcodeScanRecorded"));
                        setBarcodeScanModal({ isOpen: false, value: "" });
                      })
                      .catch((err) =>
                        toast.error(err?.data?.message || t("common.failed")),
                      );
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
              className="bg-slate-500 hover:bg-slate-600 text-white"
            >
              {isBarcodeScanning
                ? t("common.processing")
                : t("orders.recordScan")}
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
            <DialogTitle>
              {t("orders.markDelivered")} - Order #{deliverModal.order?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.note")}
              placeholder={t("orders.notePlaceholder")}
              value={deliverForm.comment}
              onChange={(e) =>
                setDeliverForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              multiline
              rows={3}
            />
            <div className="flex items-center justify-between rounded-lg border border-black/10 dark:border-white/10 p-4">
              <label
                htmlFor="markAsPaid"
                className="text-sm font-medium cursor-pointer"
              >
                {t("orders.markPaid")}
              </label>
              <Switch
                id="markAsPaid"
                checked={deliverForm.markAsPaid}
                onCheckedChange={(checked) =>
                  setDeliverForm((prev) => ({ ...prev, markAsPaid: checked }))
                }
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
            <Button
              onClick={handleDeliver}
              disabled={isDelivering}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isDelivering
                ? t("common.processing")
                : t("orders.markDelivered")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partial Payment Modal */}
      <Dialog
        open={partialPaymentModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPartialPaymentModal({ isOpen: false, order: null });
            setPartialPaymentForm({ partialAmount: "", partialPaymentRef: "" });
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("orders.recordPayment") || "Partial Payment"} - Order #
              {partialPaymentModal.order?.id}
            </DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {partialPaymentModal.order && (
                <>
                  {t("orders.total")}: $
                  {Number(partialPaymentModal.order.totalAmount ?? 0).toFixed(
                    2,
                  )}{" "}
                  | {t("orders.paid")}: $
                  {Number(partialPaymentModal.order.paidAmount ?? 0).toFixed(2)}{" "}
                  | {t("orders.remaining") || "Remaining"}: $
                  {(
                    Number(partialPaymentModal.order.totalAmount ?? 0) -
                    Number(partialPaymentModal.order.paidAmount ?? 0)
                  ).toFixed(2)}
                </>
              )}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <TextField
              label={t("orders.partialAmount") || "Amount"}
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              value={partialPaymentForm.partialAmount}
              onChange={(e) =>
                setPartialPaymentForm((prev) => ({
                  ...prev,
                  partialAmount: e.target.value,
                }))
              }
            />
            <TextField
              label={t("orders.paymentReference")}
              placeholder={t("orders.paymentReference")}
              value={partialPaymentForm.partialPaymentRef}
              onChange={(e) =>
                setPartialPaymentForm((prev) => ({
                  ...prev,
                  partialPaymentRef: e.target.value,
                }))
              }
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setPartialPaymentModal({ isOpen: false, order: null });
                setPartialPaymentForm({
                  partialAmount: "",
                  partialPaymentRef: "",
                });
              }}
              disabled={isRecordingPartial}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handlePartialPayment}
              disabled={isRecordingPartial}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isRecordingPartial
                ? t("common.processing")
                : t("orders.recordPayment") || "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
