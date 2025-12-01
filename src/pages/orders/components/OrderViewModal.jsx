import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function OrderViewModal({ order }) {
  if (!order) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details #{order.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Order ID</label>
              <p className="text-base text-black dark:text-white mt-1">{order.id || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Status</label>
              <p className="text-base text-black dark:text-white mt-1">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    order.status === "completed" || order.status === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {order.status || "-"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Customer</label>
              <p className="text-base text-black dark:text-white mt-1">
                {order.customer?.name || order.customerName || "-"}
              </p>
            </div>
            {order.customer?.email && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Customer Email</label>
                <p className="text-base text-black dark:text-white mt-1">{order.customer.email}</p>
              </div>
            )}
            {order.customer?.phone && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Customer Phone</label>
                <p className="text-base text-black dark:text-white mt-1">{order.customer.phone}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Payment Status</label>
              <p className="text-base text-black dark:text-white mt-1">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    order.isPaid
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Unpaid"}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Payment Method</label>
              <p className="text-base text-black dark:text-white mt-1">{order.paymentMethod || "-"}</p>
            </div>
            {order.paymentReference && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Payment Reference</label>
                <p className="text-base text-black dark:text-white mt-1">{order.paymentReference}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Total Amount</label>
              <p className="text-base text-black dark:text-white mt-1 font-semibold">
                {typeof order.totalAmount === "number"
                  ? `$${Number(order.totalAmount).toFixed(2)}`
                  : order.totalAmount || "-"}
              </p>
            </div>
            {order.createdAt && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Created At</label>
                <p className="text-base text-black dark:text-white mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {order.updatedAt && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Updated At</label>
                <p className="text-base text-black dark:text-white mt-1">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          {(order.shippingAddress || order.shippingTrackingId || order.shippingProvider) && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Shipping Information
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md p-4 space-y-2">
                {order.shippingAddress && (
                  <div>
                    <p className="text-xs uppercase text-black/50 dark:text-white/50">Address</p>
                    <p className="text-sm text-black dark:text-white mt-1 whitespace-pre-wrap">
                      {order.shippingAddress}
                    </p>
                  </div>
                )}
                {order.shippingTrackingId && (
                  <div>
                    <p className="text-xs uppercase text-black/50 dark:text-white/50">Tracking ID</p>
                    <p className="text-sm text-black dark:text-white mt-1">{order.shippingTrackingId}</p>
                  </div>
                )}
                {order.shippingProvider && (
                  <div>
                    <p className="text-xs uppercase text-black/50 dark:text-white/50">Shipping Provider</p>
                    <p className="text-sm text-black dark:text-white mt-1">{order.shippingProvider}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Order Items ({order.items.length})
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/5 dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-black/70 dark:text-white/70">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-black/70 dark:text-white/70">
                          SKU
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-black/70 dark:text-white/70">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5">
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-black dark:text-white">
                            {item.product?.name || item.name || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-black/70 dark:text-white/70">
                            {item.product?.sku || item.sku || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white text-right">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-black dark:text-white text-right">
                            {typeof item.unitPrice === "number"
                              ? `$${Number(item.unitPrice).toFixed(2)}`
                              : item.unitPrice || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium text-black dark:text-white text-right">
                            {typeof item.totalPrice === "number"
                              ? `$${Number(item.totalPrice).toFixed(2)}`
                              : item.totalPrice || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

