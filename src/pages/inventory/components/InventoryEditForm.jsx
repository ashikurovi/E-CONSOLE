import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateInventoryMutation } from "@/features/inventory/inventoryApiSlice";

const editInventorySchema = yup.object().shape({
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .min(0, "Stock must be 0 or greater")
    .integer("Stock must be a whole number"),
  newStock: yup
    .number()
    .typeError("New Stock must be a number")
    .min(0, "New Stock must be 0 or greater")
    .integer("New Stock must be a whole number")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  sold: yup
    .number()
    .typeError("Sold must be a number")
    .required("Sold is required")
    .min(0, "Sold must be 0 or greater")
    .integer("Sold must be a whole number"),
});

export default function InventoryEditForm({ item, productOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(editInventorySchema),
    defaultValues: {
      stock: item?.stock ?? 0,
      sold: item?.sold ?? 0,
      newStock: "",
    },
  });

  const [updateInventory, { isLoading: isUpdating }] = useUpdateInventoryMutation();

  const onSubmit = async (data) => {
    const payload = {
      id: item.id,
      stock: parseInt(data.stock, 10),
      sold: parseInt(data.sold, 10),
      newStock: data.newStock !== null && data.newStock !== "" ? parseInt(data.newStock, 10) : undefined,
    };

    const res = await updateInventory(payload);
    if (res?.data) {
      toast.success("Inventory updated");
      reset({
        stock: res.data.stock ?? item?.stock ?? 0,
        sold: res.data.sold ?? item?.sold ?? 0,
        newStock: "",
      });
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update inventory");
    }
  };

  const handleDialogClose = (open) => {
    setIsOpen(open);
    if (!open) {
      reset({
        stock: item?.stock ?? 0,
        sold: item?.sold ?? 0,
        newStock: "",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className='h-[400px]'>
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField
            label="Stock"
            placeholder="Stock"
            register={(name) => register(name, { disabled: true })}
            name="stock"
            type="number"
            disabled={true}
            error={errors.stock}
          />
          <TextField
            label="New Stock"
            placeholder="New Stock"
            register={register}
            name="newStock"
            type="number"
            error={errors.newStock}
          />
          <TextField
            label="Sold"
            placeholder="Sold"
            register={register}
            name="sold"
            type="number"
            error={errors.sold}
          />

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-600 text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating} className="bg-black hover:bg-gray-600 text-white">
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}