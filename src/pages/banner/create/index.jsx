import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

function CreateBannerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bannerSchema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .required(t("banners.validation.titleRequired"))
          .min(2, t("banners.validation.titleMin"))
          .max(200, t("banners.validation.titleMax")),
        subtitle: yup.string().max(500, t("banners.validation.subtitleMax")),
        imageUrl: yup
          .string()
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .test("url-or-empty", t("banners.validation.urlOrEmpty"), function (value) {
            if (!value || value.trim() === "") return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }),
        buttonText: yup.string().max(50, t("banners.validation.buttonTextMax")),
        buttonLink: yup
          .string()
          .nullable()
          .transform((value, originalValue) => (originalValue === "" ? null : value))
          .test("url-or-empty", t("banners.validation.urlOrEmpty"), function (value) {
            if (!value || value.trim() === "") return true;
            try {
              new URL(value);
              return true;
            } catch {
              return false;
            }
          }),
        order: yup
          .number()
          .typeError(t("banners.validation.orderNumber"))
          .integer(t("banners.validation.orderInteger"))
          .min(0, t("banners.validation.orderMin"))
          .required(t("banners.validation.orderRequired")),
        isActive: yup.boolean().required(t("banners.validation.statusRequired")),
      }),
    [t]
  );
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
        toast.error(t("banners.failedToUploadImage"));
        return;
      }
      imageUrl = uploadedUrl;
    }

    if (!imageUrl) {
      toast.error(t("banners.provideImageUrlOrUpload"));
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
        toast.success(t("banners.bannerCreated"));
        reset();
        setImageFile(null);
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || t("banners.bannerCreateFailed"));
      }
    } catch (err) {
      toast.error(t("common.failed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
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
          <h1 className="text-2xl font-semibold">{t("createEdit.createBanner")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.createBannerDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("banners.bannerContent")}
            </h3>
          </div>
          <TextField
            label={t("banners.bannerTitle")}
            placeholder={t("banners.bannerTitlePlaceholder")}
            register={register}
            name="title"
            error={errors.title}
          />
          <TextField
            label={t("banners.subtitle")}
            placeholder={t("banners.subtitlePlaceholder")}
            register={register}
            name="subtitle"
            error={errors.subtitle}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("banners.bannerImage")}
            </h3>
          </div>
          <FileUpload
            placeholder={t("banners.chooseImageFile")}
            label={t("banners.uploadImage")}
            name="image"
            accept="image/*"
            onChange={setImageFile}
            value={imageFile}
          />
          <div className="text-center text-sm text-black/50 dark:text-white/50">{t("banners.orLabel")}</div>
          <TextField
            label={t("banners.imageUrl")}
            placeholder={t("banners.imageUrlPlaceholder")}
            register={register}
            name="imageUrl"
            error={errors.imageUrl}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("banners.callToAction")}
            </h3>
          </div>
          <TextField
            label={t("banners.buttonText")}
            placeholder={t("banners.buttonTextPlaceholder")}
            register={register}
            name="buttonText"
            error={errors.buttonText}
          />
          <TextField
            label={t("banners.buttonLink")}
            placeholder={t("banners.buttonLinkPlaceholder")}
            register={register}
            name="buttonLink"
            error={errors.buttonLink}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("banners.settings")}
            </h3>
          </div>
          <TextField
            label={t("banners.displayOrder")}
            placeholder={t("banners.orderPlaceholder")}
            register={register}
            name="order"
            type="number"
            error={errors.order}
          />
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register("isActive")} />
              <span>{t("common.active")}</span>
            </label>
            {errors.isActive && (
              <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" type="button" onClick={() => navigate("/banners")} className="bg-red-500 hover:bg-red-600 text-white">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isCreating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating || isUploading ? t("common.processing") : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateBannerPage;
