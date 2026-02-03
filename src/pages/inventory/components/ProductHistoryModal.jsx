import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  FileEdit,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";

const ProductHistoryModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  // Mock history data - in a real app, this would come from an API
  const history = [
    {
      id: 1,
      type: "stock_in",
      amount: 50,
      reason: "New shipment received",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: "Admin User",
    },
    {
      id: 2,
      type: "stock_out",
      amount: 12,
      reason: "Order #12345 fulfillment",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      user: "System",
    },
    {
      id: 3,
      type: "update",
      field: "price",
      oldValue: "$120.00",
      newValue: "$125.00",
      date: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      user: "Manager",
    },
    {
      id: 4,
      type: "stock_out",
      amount: 5,
      reason: "Damaged goods",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      user: "Admin User",
    },
    {
      id: 5,
      type: "created",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      user: "Admin User",
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case "stock_in":
        return <ArrowDownCircle className="w-4 h-4 text-emerald-500" />;
      case "stock_out":
        return <ArrowUpCircle className="w-4 h-4 text-red-500" />;
      case "update":
        return <FileEdit className="w-4 h-4 text-blue-500" />;
      case "created":
        return <Clock className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTitle = (item) => {
    switch (item.type) {
      case "stock_in":
        return `Stock Added (+${item.amount})`;
      case "stock_out":
        return `Stock Removed (-${item.amount})`;
      case "update":
        return `Product Updated`;
      case "created":
        return "Product Created";
      default:
        return "Activity Logged";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingCart className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div className="flex flex-col">
              <span>{product.name}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                History & Activity Log
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Current Stock
              </span>
              <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                {product.stock || 0}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-4" />
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Value
              </span>
              <span className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                $
                {((product.stock || 0) * (product.price || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          <ScrollArea className="h-[300px] pr-4 -mr-4">
            <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 py-2">
              {history.map((item, index) => (
                <div key={item.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      item.type === "stock_in"
                        ? "bg-emerald-500"
                        : item.type === "stock_out"
                          ? "bg-red-500"
                          : item.type === "update"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                    }`}
                  />

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {getIcon(item.type)}
                        {getTitle(item)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {format(item.date, "MMM d, h:mm a")}
                      </span>
                    </div>

                    {item.reason && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mt-1">
                        {item.reason}
                      </p>
                    )}

                    {item.type === "update" && (
                      <div className="flex items-center gap-2 text-xs mt-1">
                        <Badge
                          variant="outline"
                          className="text-slate-500 border-slate-200"
                        >
                          {item.field}
                        </Badge>
                        <span className="line-through text-slate-400">
                          {item.oldValue}
                        </span>
                        <ArrowDownCircle className="w-3 h-3 rotate-[-90deg] text-slate-300" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {item.newValue}
                        </span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 mt-0.5">
                      by {item.user}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductHistoryModal;
