import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import TextField from "@/components/input/TextField";
import { useUpdateProductMutation } from "@/features/product/productApiSlice";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const RestockModal = ({ isOpen, onClose, product }) => {
  const { user } = useSelector((state) => state.auth);
  const [updateProduct, { isLoading }] = useUpdateProductMutation();
  const [newStock, setNewStock] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !newStock || parseInt(newStock) <= 0) {
      toast.error("Please enter a valid stock quantity");
      return;
    }

    const currentStock = product.stock || 0;
    const stockToAdd = parseInt(newStock);
    const updatedStock = currentStock + stockToAdd;

    try {
      const res = await updateProduct({
        id: product.id,
        body: { 
          stock: updatedStock,
          newStock: stockToAdd,
        },
        params: { companyId: user?.companyId },
      });

      if (res?.data) {
        toast.success(`Successfully added ${stockToAdd} units. New stock: ${updatedStock}`);
        setNewStock("");
        onClose();
      } else {
        toast.error(res?.error?.data?.message || "Failed to restock product");
      }
    } catch (error) {
      toast.error("Failed to restock product: " + error.message);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70">
      <div className="bg-white dark:bg-[#242424] rounded-2xl border border-black/10 dark:border-white/10 p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Restock Product</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4 p-4 bg-black/5 dark:bg-white/5 rounded-lg">
          <div className="text-sm text-black/60 dark:text-white/60 mb-1">Product</div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-black/60 dark:text-white/60 mt-2">
            Current Stock: <span className="font-semibold">{product.stock ?? 0} units</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Quantity to Add"
            placeholder="Enter quantity"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            type="number"
            step="1"
            min="1"
            required
          />

          {newStock && parseInt(newStock) > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-black/70 dark:text-white/70">
                New stock will be:{" "}
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {(product.stock || 0) + parseInt(newStock)} units
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newStock || parseInt(newStock) <= 0}>
              {isLoading ? "Restocking..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestockModal;
