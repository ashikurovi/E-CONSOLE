import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import { useCreateBannerMutation } from "@/features/banners/bannersApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";

const bannerSchema = yup.object().shape({
  title: yup.string().required("Title is required").min(2, "Title must be at least 2 characters").max(200, "Title must be less than 200 characters"),
  subtitle: yup.string().max(500, "Subtitle must be less than 500 characters"),
  imageUrl: yup.string().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)).test("url-or-empty", "Please enter a valid URL or leave it empty", function (value) {
    if (!value || value.trim() === "") return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }),
  buttonText: yup.string().max(50, "Button text must be less than 50 characters"),
  buttonLink: yup.string().nullable().transform((value, originalValue) => (originalValue === "" ? null : value)).test("url-or-empty", "Please enter a valid URL or leave it empty", function (value) {
    if (!value || value.trim() === "") return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }),
  order: yup.number().typeError("Order must be a number").integer("Order must be an integer").min(0, "Order must be 0 or greater").required("Order is required"),
  isActive: yup.boolean().required("Status is required"),
});

function CreateBannerPage() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();
  const authUser = useSelector((state) => state.auth.user);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(bannerSchema),
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
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: imageUrl,
      buttonText: data.buttonText,
      buttonLink: data.buttonLink,
      isActive: Boolean(data.isActive),
      order: parseInt(data.order, 10) || 0,
      productId: null,
    };

    const params = { params: { companyId: authUser?.companyId } };
    try {
      const res = await createBanner({ body: payload, params });
      if (res?.data) {
        toast.success("Banner created");
        reset();
        setImageFile(null);
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || "Failed to create banner");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

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
          <h1 className="text-2xl font-semibold">Create Banner</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Add a new banner to your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Banner Content
            </h3>
          </div>
          <TextField
            label="Banner Title *"
            placeholder="Enter banner title"
            register={register}
            name="title"
            error={errors.title}
          />
          <TextField
            label="Subtitle *"
            placeholder="Enter banner subtitle"
            register={register}
            name="subtitle"
            error={errors.subtitle}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Banner Image
            </h3>
          </div>
          <FileUpload
            placeholder="Choose image file"
            label="Upload Image"
            name="image"
            accept="image/*"
            onChange={setImageFile}
            value={imageFile}
          />
          <div className="text-center text-sm text-black/50 dark:text-white/50">OR</div>
          <TextField
            label="Image URL"
            placeholder="https://example.com/image.jpg (optional)"
            register={register}
            name="imageUrl"
            error={errors.imageUrl}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Call to Action
            </h3>
          </div>
          <TextField
            label="Button Text *"
            placeholder="Shop Now"
            register={register}
            name="buttonText"
            error={errors.buttonText}
          />
          <TextField
            label="Button Link *"
            placeholder="https://example.com"
            register={register}
            name="buttonLink"
            error={errors.buttonLink}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Settings
            </h3>
          </div>
          <TextField
            label="Display Order *"
            placeholder="1"
            register={register}
            name="order"
            type="number"
            error={errors.order}
          />
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isActive")} />
              <span>Active</span>
            </label>
            {errors.isActive && (
              <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button variant="ghost" type="button" onClick={() => navigate("/banners")} className="bg-red-500 hover:bg-red-600 text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating || isUploading ? "Processing..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateBannerPage;
