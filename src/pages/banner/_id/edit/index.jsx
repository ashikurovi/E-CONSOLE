import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
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

function BannerEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: banners = [] } = useGetBannersQuery({ companyId: user?.companyId });
  const banner = banners.find((b) => b.id === parseInt(id));

  const bannerEditSchema = useMemo(
    () =>
      yup.object().shape({
        title: yup
          .string()
          .required(t("banners.validation.titleRequired"))
          .min(2, t("banners.validation.titleMin"))
          .max(200, t("banners.validation.titleMax")),
        subtitle: yup.string().max(500, t("banners.validation.subtitleMax")),
        imageUrl: yup.string(),
        buttonText: yup.string().max(50, t("banners.validation.buttonTextMax")),
        buttonLink: yup.string().required(t("banners.validation.buttonLinkRequired")),
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
        toast.success(t("banners.bannerUpdated"));
        navigate("/banners");
      } else {
        toast.error(res?.error?.data?.message || t("banners.bannerUpdateFailed"));
      }
    } catch {
      toast.error(t("common.failed"));
    }
  };

  if (!banner) {
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
            <h1 className="text-2xl font-semibold">{t("banners.bannerNotFound")}</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("banners.bannerNotFoundDesc")}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-semibold">{t("banners.editBanner")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.updateBanner")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        <TextField
          label={t("banners.titleField")}
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

        <FileUpload
          placeholder={t("banners.chooseImageFile")}
          label={t("banners.uploadImage")}
          name="image"
          accept="image/*"
          onChange={setImageFile}
          value={banner?.imageUrl}
        />

        <div className="text-center text-sm text-black/50 dark:text-white/50">{t("banners.orLabel")}</div>

        <TextField
          label={t("banners.imageUrl")}
          placeholder={t("banners.imageUrlPlaceholder")}
          register={register}
          name="imageUrl"
          error={errors.imageUrl}
        />

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
        <TextField
          label={t("banners.displayOrder")}
          placeholder={t("banners.orderPlaceholder")}
          register={register}
          name="order"
          type="number"
          error={errors.order}
        />
        <div className="flex flex-col gap-2">
          <label className="text-black/50 dark:text-white/50 text-sm ml-1">{t("common.status")}</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register("isActive")} className="w-4 h-4 rounded border-black/20 dark:border-white/20" />
            <span className="text-sm">{t("common.active")}</span>
          </label>
          {errors.isActive && (
            <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" type="button" onClick={() => navigate("/banners")} className="bg-red-500 hover:bg-red-600 text-white">
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isUpdating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isUpdating || isUploading ? t("common.processing") : t("common.update")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default BannerEditPage;
