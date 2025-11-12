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

import { useCreateBannerMutation } from "@/features/banners/bannersApiSlice";

function BannerForm({ productOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
      isActive: true,
      order: 1,
    },
  });

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();

  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: sanitizeUrl(data.imageUrl),
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
      productId: selectedProduct?.value || null,
    };

    try {
      const res = await createBanner(payload);
      if (res?.data) {
        toast.success("Banner created");
        reset();
        setSelectedProduct(null);
        setIsOpen(false);
      } else {
        toast.error(res?.error?.data?.message || "Failed to create banner");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Banner</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Banner</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        

          <TextField placeholder="Title" register={register} name="title" />
          <TextField placeholder="Subtitle" register={register} name="subtitle" />
          <TextField placeholder="Image URL" register={register} name="imageUrl" />
          <TextField placeholder="Button Text" register={register} name="buttonText" />
          <TextField placeholder="Button Link" register={register} name="buttonLink" />
          <TextField placeholder="Order" register={register} name="order" type="number" />

          {/* Active Toggle */}
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("isActive")} />
            <span>Active</span>
          </label>

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

export default BannerForm;
