import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateInventoryMutation } from "@/features/inventory/inventoryApiSlice";

function InventoryForm({ productOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [createInventory, { isLoading: isCreating }] = useCreateInventoryMutation();

  const onSubmit = async (data) => {
    const payload = {
      productId: selectedProduct?.value || null,
      stock: parseInt(data.stock, 10) || 0,
      sold: data.sold !== "" && data.sold !== undefined ? parseInt(data.sold, 10) || 0 : undefined,
    };

    const res = await createInventory(payload);
    if (res?.data) {
      toast.success("Inventory created");
      reset();
      setSelectedProduct(null);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create inventory");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Inventory</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <Dropdown
            name="Product"
            options={productOptions}
            setSelectedOption={setSelectedProduct}
            className="py-2"
          >
            {selectedProduct?.label || (
              <span className="text-black/50 dark:text-white/50">Select Product</span>
            )}
          </Dropdown>

          <TextField placeholder="Stock" register={register} name="stock" type="number" />
          <TextField placeholder="Sold (optional)" register={register} name="sold" type="number" />

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InventoryForm;