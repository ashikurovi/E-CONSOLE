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
import { useUpdateProductMutation } from "@/features/product/productApiSlice";

export default function ProductEditForm({ product, categoryOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const defaultCategory = useMemo(() => {
    const id = product?.category?.id ?? product?.categoryId;
    const found = categoryOptions.find((c) => c.value === id);
    return found || null;
  }, [product, categoryOptions]);

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: product?.name ?? product?.title ?? "",
      sku: product?.sku ?? "",
      price:
        typeof product?.price === "number"
          ? product?.price
          : Number(product?.price) || "",
      photo: product?.photo ?? "",
    },
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const onSubmit = async (data) => {
    const payload = {
      id: product.id,
      name: data.name,
      sku: data.sku,
      price: parseFloat(data.price),
      photo: data.photo || null,
      categoryId: selectedCategory?.value || null,
    };

    const res = await updateProduct(payload);
    if (res?.data) {
      toast.success("Product updated");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to update product");
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
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Product name" register={register} name="name" />
          <TextField placeholder="SKU (optional)" register={register} name="sku" />
          <TextField placeholder="Price" register={register} name="price" type="number" />
          <TextField placeholder="Photo URL (optional)" register={register} name="photo" />

          <Dropdown
            name="Category"
            options={categoryOptions}
            setSelectedOption={setSelectedCategory}
            className="py-2"
          >
            {selectedCategory?.label || (
              <span className="text-black/50 dark:text-white/50">Select Category</span>
            )}
          </Dropdown>

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