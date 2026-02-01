import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import TextField from "@/components/input/TextField";
import { useUpdateProductMutation } from "@/features/product/productApiSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const StockAdjustmentModal = ({ isOpen, onClose, product, type = 'in' }) => { // type: 'in' | 'out'
  const { user } = useSelector((state) => state.auth);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState(""); // Optional reason for history

  const isStockIn = type === 'in';
  const title = isStockIn ? "Stock In" : "Stock Out";
  const actionText = isStockIn ? "Add Stock" : "Remove Stock";
  const colorClass = isStockIn ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const currentStock = product.stock || 0;
    const qty = parseInt(quantity);

    if (!isStockIn && qty > currentStock) {
        toast.error("Cannot remove more stock than available");
        return;
    }

    const updatedStock = isStockIn ? currentStock + qty : currentStock - qty;

    try {
      const res = await updateProduct({
        id: product.id,
        body: { 
          stock: updatedStock,
          adjustment: isStockIn ? qty : -qty,
          reason: reason, // Assuming backend handles history logging if moved to inventory specific API
        },
        params: { companyId: user?.companyId },
      });

      if (res?.data) {
        toast.success(`Successfully ${isStockIn ? 'added' : 'removed'} ${qty} units.`);
        setQuantity("");
        setReason("");
        onClose();
      } else {
        toast.error(res?.error?.data?.message || "Failed to update stock");
      }
    } catch (error) {
      toast.error("Failed to update stock: " + error.message);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-sm font-bold ${colorClass}`}>
                {isStockIn ? "Stock In" : "Stock Out"}
            </span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="flex gap-3">
                <div className="h-12 w-12 rounded-lg bg-white dark:bg-black/20 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden shrink-0">
                     {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover"/> : <span className="text-xs font-bold text-gray-400">IMG</span>}
                </div>
                <div>
                   <div className="text-sm text-gray-500 dark:text-gray-400">Product</div>
                   <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</div>
                   <div className="text-xs text-gray-500 mt-1">Code: {product.sku || '-'}</div>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm">
                <span className="text-gray-500">Current Stock</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{product.stock ?? 0}</span>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Quantity"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            step="1"
            min="1"
            required
            className="font-mono text-lg"
          />
        
          <TextField
            label="Reason (Optional)"
            placeholder="e.g. Received new shipment / Damaged"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {quantity && parseInt(quantity) > 0 && (
             <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm">
                <span className="text-gray-500">New Balance</span>
                <div className="flex items-center gap-2">
                    <span className="line-through text-gray-400">{product.stock || 0}</span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className={`font-bold ${isStockIn ? 'text-green-600' : 'text-red-600'}`}>
                        {isStockIn 
                            ? (product.stock || 0) + parseInt(quantity) 
                            : (product.stock || 0) - parseInt(quantity)
                        }
                    </span>
                </div>
             </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading} className="border-gray-200 dark:border-gray-700">
              Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={isLoading || !quantity || parseInt(quantity) <= 0}
                className={isStockIn ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
            >
              {isLoading ? "Updating..." : actionText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
