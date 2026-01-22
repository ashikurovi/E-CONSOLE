import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import { useUpdateBannerMutation, useGetBannersQuery } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";

const bannerEditSchema = yup.object().shape({
  title: yup.string().required("Title is required").min(2, "Title must be at least 2 characters").max(200, "Title must be less than 200 characters"),
  subtitle: yup.string().max(500, "Subtitle must be less than 500 characters"),
  imageUrl: yup.string(),
  buttonText: yup.string().max(50, "Button text must be less than 50 characters"),
  buttonLink: yup.string().required("Button link is required"),
  order: yup.number().typeError("Order must be a number").integer("Order must be an integer").min(0, "Order must be 0 or greater").required("Order is required"),
  isActive: yup.boolean().required("Status is required"),
});

function BannerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: banners = [] } = useGetBannersQuery({ companyId: user?.companyId });
  const banner = banners.find((b) => b.id === parseInt(id));
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

  useEffect(() => {
    if (banner) {
      reset({
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl || "",
        buttonText: banner.buttonText || "",
        buttonLink: banner.buttonLink || "",
        isActive: Boolean(banner.isActive),
        order: banner.order ?? 1,
      });
    }
  }, [banner, reset]);

  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

  const onSubmit = async (data) => {
    if (!banner) return;

    let imageUrl = sanitizeUrl(data.imageUrl);

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        toast.error("Failed to upload image");
        return;
      }
      imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      toast.error("Please provide an image URL or upload an image file");
      return;
    }

    const payload = {
      id: banner.id,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
    };

    try {
      const params = { companyId: user?.companyId };
      const res = await updateBanner({ id: banner.id, body: payload, params });
      if (res?.data) {
        toast.success("Banner updated");
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || "Failed to update banner");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (!banner) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/banners")}
            className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Banner Not Found</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              The banner you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/banners")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Banner</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Update banner information
          </p>
        </div>
      </div>

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
        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/banners")} className="bg-red-500 hover:bg-red-600 text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isUpdating || isUploading ? "Processing..." : "Update"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BannerEditPage;
