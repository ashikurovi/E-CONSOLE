import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
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
import { useUpdateInventoryMutation } from "@/features/inventory/inventoryApiSlice";

export default function InventoryEditForm({ item, productOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultProduct = useMemo(() => {
    const id = item?.product?.id ?? item?.productId;
    const found = productOptions.find((p) => p.value === id);
    return found || null;
  }, [item, productOptions]);

  const [selectedProduct, setSelectedProduct] = useState(defaultProduct);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      stock: item?.stock ?? 0,
      sold: item?.sold ?? 0,
    },
  });

  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();

  const onSubmit = async (data) => {
    const payload = {
      id: item.id,
      productId: selectedProduct?.value || undefined,
      stock: parseInt(data.stock, 10),
      sold: parseInt(data.sold, 10),
    };

    const res = await updateInventory(payload);
    if (res?.data) {
      toast.success("Inventory updated");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update inventory");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
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
          <TextField placeholder="Sold" register={register} name="sold" type="number" />

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}