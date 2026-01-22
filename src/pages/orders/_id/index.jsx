import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, User, CreditCard, Truck, Calendar, Edit } from "lucide-react";
import { useGetOrderQuery } from "@/features/order/orderApiSlice";

const OrderViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useGetOrderQuery(parseInt(id));

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
            <p className="text-black/60 dark:text-white/60">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
            className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Order Not Found</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              The order you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "shipped":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "processing":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  };

  const primaryImage = (product) => {
    if (product?.images?.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return primary?.url || product.images[0]?.url;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/orders")}
              className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white">Order #{order.id}</h1>
              <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                {order.createdAt && new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}
            >
              {order.status?.toUpperCase() || "PENDING"}
            </span>
            <Button
              variant="outline"
              onClick={() => navigate(`/orders/${id}/edit`)}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Order
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {order.items?.length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {typeof order.totalAmount === "number"
                    ? `$${Number(order.totalAmount).toFixed(2)}`
                    : "$0.00"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Payment Status</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {order.isPaid ? "Paid" : "Unpaid"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Section */}
          {order.items && order.items.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Package className="h-5 w-5 text-black dark:text-white" />
                <h2 className="text-xl font-bold text-black dark:text-white">
                  Order Items ({order.items.length})
                </h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const productImage = primaryImage(item.product);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={item.product?.name || "Product"}
                          className="w-20 h-20 rounded-lg object-cover border border-black/10 dark:border-white/10"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center border border-black/10 dark:border-white/10">
                          <Package className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-black dark:text-white text-lg mb-1">
                          {item.product?.name || item.name || "Unknown Product"}
                        </h3>
                        <p className="text-sm text-black/60 dark:text-white/60 mb-2">
                          SKU: {item.product?.sku || item.sku || "N/A"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-black/70 dark:text-white/70">
                              Qty: <span className="font-semibold text-black dark:text-white">{item.quantity || 0}</span>
                            </span>
                            <span className="text-black/70 dark:text-white/70">
                              Price: <span className="font-semibold text-black dark:text-white">
                                {typeof item.unitPrice === "number"
                                  ? `$${Number(item.unitPrice).toFixed(2)}`
                                  : "$0.00"}
                              </span>
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-black/60 dark:text-white/60 mb-1">Total</p>
                            <p className="text-lg font-bold text-black dark:text-white">
                              {typeof item.totalPrice === "number"
                                ? `$${Number(item.totalPrice).toFixed(2)}`
                                : "$0.00"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-black dark:text-white">Order Total</span>
                  <span className="text-2xl font-bold text-black dark:text-white">
                    {typeof order.totalAmount === "number"
                      ? `$${Number(order.totalAmount).toFixed(2)}`
                      : "$0.00"}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-black dark:text-white" />
              <h2 className="text-lg font-bold text-black dark:text-white">Customer</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-base font-semibold text-black dark:text-white mt-1">
                  {order.customer?.name || order.customerName || "N/A"}
                </p>
              </div>
              {order.customer?.email && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1 break-all">{order.customer.email}</p>
                </div>
              )}
              {(order.customer?.phone || order.customerPhone) && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Phone
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1">
                    {order.customer?.phone || order.customerPhone}
                  </p>
                </div>
              )}
              {order.customerAddress && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Address
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1 whitespace-pre-wrap">
                    {order.customerAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-black dark:text-white" />
              <h2 className="text-lg font-bold text-black dark:text-white">Payment</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                  Status
                </label>
                <p className="mt-1">
                  <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      order.isPaid
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                  Method
                </label>
                <p className="text-sm font-semibold text-black dark:text-white mt-1">
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              {order.paymentReference && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Reference
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1 font-mono break-all">
                    {order.paymentReference}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {(order.shippingTrackingId || order.shippingProvider || order.deliveryType) && (
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-black dark:text-white" />
                <h2 className="text-lg font-bold text-black dark:text-white">Shipping</h2>
              </div>
              <div className="space-y-3">
                {order.deliveryType && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                      Delivery Type
                    </label>
                    <p className="text-sm font-semibold text-black dark:text-white mt-1">
                      {order.deliveryType}
                    </p>
                  </div>
                )}
                {order.shippingTrackingId && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                      Tracking ID
                    </label>
                    <p className="text-sm text-black dark:text-white mt-1 font-mono break-all">
                      {order.shippingTrackingId}
                    </p>
                  </div>
                )}
                {order.shippingProvider && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                      Provider
                    </label>
                    <p className="text-sm font-semibold text-black dark:text-white mt-1">
                      {order.shippingProvider}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-black dark:text-white" />
              <h2 className="text-lg font-bold text-black dark:text-white">Timeline</h2>
            </div>
            <div className="space-y-3">
              {order.createdAt && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Created
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
              {order.updatedAt && (
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-sm text-black dark:text-white mt-1">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewPage;
