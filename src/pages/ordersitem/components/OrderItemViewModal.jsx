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

export default function OrderItemViewModal({ orderItem }) {
  if (!orderItem) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
          title="View"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Item Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Order ID</label>
              <p className="text-base text-black dark:text-white mt-1">{orderItem.orderId || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Product Name</label>
              <p className="text-base text-black dark:text-white mt-1">{orderItem.productName || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">SKU</label>
              <p className="text-base text-black dark:text-white mt-1">{orderItem.sku || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Quantity</label>
              <p className="text-base text-black dark:text-white mt-1">{orderItem.quantity || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Unit Price</label>
              <p className="text-base text-black dark:text-white mt-1">
                {typeof orderItem.unitPrice === "number"
                  ? `$${Number(orderItem.unitPrice).toFixed(2)}`
                  : orderItem.unitPrice || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Total Price</label>
              <p className="text-base text-black dark:text-white mt-1 font-semibold">
                {typeof orderItem.totalPrice === "number"
                  ? `$${Number(orderItem.totalPrice).toFixed(2)}`
                  : orderItem.totalPrice || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Order Status</label>
              <p className="text-base text-black dark:text-white mt-1">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    orderItem.orderStatus === "completed" || orderItem.orderStatus === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : orderItem.orderStatus === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                  }`}
                >
                  {orderItem.orderStatus || "-"}
                </span>
              </p>
            </div>
            {orderItem.createdAt && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Created At</label>
                <p className="text-base text-black dark:text-white mt-1">
                  {new Date(orderItem.createdAt).toLocaleString()}
                </p>
              </div>
            )}
            {orderItem.updatedAt && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Updated At</label>
                <p className="text-base text-black dark:text-white mt-1">
                  {new Date(orderItem.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Additional Information */}
          {(orderItem.productId || orderItem.product) && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Product Information
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md p-4 space-y-2">
                {orderItem.productId && (
                  <div>
                    <p className="text-xs uppercase text-black/50 dark:text-white/50">Product ID</p>
                    <p className="text-sm text-black dark:text-white mt-1">{orderItem.productId}</p>
                  </div>
                )}
                {orderItem.product && typeof orderItem.product === "object" && (
                  <>
                    {orderItem.product.name && (
                      <div>
                        <p className="text-xs uppercase text-black/50 dark:text-white/50">Product Name</p>
                        <p className="text-sm text-black dark:text-white mt-1">{orderItem.product.name}</p>
                      </div>
                    )}
                    {orderItem.product.description && (
                      <div>
                        <p className="text-xs uppercase text-black/50 dark:text-white/50">Description</p>
                        <p className="text-sm text-black dark:text-white mt-1">{orderItem.product.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}



