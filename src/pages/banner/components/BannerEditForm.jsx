import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useUpdateBannerMutation } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";

const bannerEditSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  subtitle: yup
    .string()
    .max(500, "Subtitle must be less than 500 characters"),
  imageUrl: yup
    .string(),
  buttonText: yup
    .string()
    .max(50, "Button text must be less than 50 characters"),
  buttonLink: yup
    .string()
    .required("Button link is required"),
  order: yup
    .number()
    .typeError("Order must be a number")
    .integer("Order must be an integer")
    .min(0, "Order must be 0 or greater")
    .required("Order is required"),
  isActive: yup
    .boolean()
    .required("Status is required"),
});

function BannerEditForm({ banner }) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(bannerEditSchema),
    defaultValues: {
      title: banner?.title || "",
      subtitle: banner?.subtitle || "",
      imageUrl: banner?.imageUrl || "",
      buttonText: banner?.buttonText || "",
      buttonLink: banner?.buttonLink || "",
      isActive: Boolean(banner?.isActive),
      order: banner?.order ?? 1,
    },
  });

  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    let imageUrl = sanitizeUrl(data.imageUrl);

    // If a file is selected, upload it first
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        toast.error("Failed to upload image");
        return;
      }
      imageUrl = uploadedUrl;
    }

    // If neither file nor URL is provided, show error
    if (!imageUrl) {
      toast.error("Please provide an image URL or upload an image file");
      return;
    }

    const payload = {
      id: banner?.id,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
    };

    try {
      const res = await updateBanner(payload);
      if (res?.data) {
        toast.success("Banner updated");
        reset();
        setImageFile(null);
        setIsOpen(false);
      } else {
        toast.error(res?.error?.data?.message || "Failed to update banner");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Banner</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField
            placeholder="Title *"
            register={register}
            name="title"
            error={errors.title}
          />
          <TextField
            placeholder="Subtitle *"
            register={register}
            name="subtitle"
            error={errors.subtitle}
          />

          <FileUpload
            placeholder="Choose image file"
            label="Upload Image"
            name="image"
            accept="image/*"
            onChange={setImageFile}
            value={banner?.imageUrl}
          />

          <div className="text-center text-sm text-black/50 dark:text-white/50">OR</div>

          <TextField
            placeholder="Image URL *"
            register={register}
            name="imageUrl"
            error={errors.imageUrl}
          />

          <TextField
            placeholder="Button Text *"
            register={register}
            name="buttonText"
            error={errors.buttonText}
          />
          <TextField
            placeholder="Button Link *"
            register={register}
            name="buttonLink"
            error={errors.buttonLink}
          />
          <TextField
            placeholder="Order *"
            register={register}
            name="order"
            type="number"
            error={errors.order}
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded border-black/20 dark:border-white/20" />
              <span className="text-sm">Active</span>
            </label>
            {errors.isActive && (
              <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)} className="bg-red-500 hover:bg-red-600 text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || isUploading} className="bg-black hover:bg-gray-600 text-white">
              {isUpdating || isUploading ? "Processing..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BannerEditForm;
