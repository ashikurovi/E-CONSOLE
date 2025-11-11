import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateProductMutation } from "@/features/product/productApiSlice";

function ProductForm({ categoryOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryOption, setCategoryOption] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      sku: data.sku,
      price: parseFloat(data.price),
      photo: data.photo || null,
      isActive: !!data.isActive,
      categoryId: categoryOption?.value || null,
    };

    const res = await createProduct(payload);
    if (res?.data) {
      toast.success("Product created");
      reset();
      setCategoryOption(null);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Product</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Product name" register={register} name="name" />
          <TextField placeholder="SKU (optional)" register={register} name="sku" />
          <TextField placeholder="Price" register={register} name="price" type="number" />
          <TextField placeholder="Photo URL (optional)" register={register} name="photo" />

          <Dropdown
            name="Category"
            options={categoryOptions}
            setSelectedOption={setCategoryOption}
            className="py-2"
          >
            {categoryOption?.label || (
              <span className="text-black/50 dark:text-white/50">Select Category</span>
            )}
          </Dropdown>

          <div className="flex items-center gap-2">
            <Checkbox name="isActive" value={true} setValue={() => {}} disabled>
              Active by default
            </Checkbox>
          </div>

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

export default ProductForm;