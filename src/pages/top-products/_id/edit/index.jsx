import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import {
  useGetTopProductsQuery,
  useUpdateTopProductsItemMutation,
} from "@/features/topProducts/topProductsApiSlice";

const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

export default function TopProductsEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useGetTopProductsQuery();
  const [updateItem, { isLoading: isUpdatingItem }] =
    useUpdateTopProductsItemMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!data || !id) return;
    const numericId = Number(id);
    const items = Array.isArray(data?.carouselItems) ? data.carouselItems : [];
    const found = items.find((it) => it.id === numericId);
    if (found) {
      setTitle(found.title || "");
      setDesc(found.desc || "");
      setImageUrl(found.image || "");
      setOrder(Number(found.order || 0));
      setIsActive(Boolean(found.isActive));
    }
  }, [data, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    try {
      let finalUrl = sanitizeUrl(imageUrl);
      if (file) {
        const uploaded = await uploadImage(file);
        if (!uploaded) return;
        finalUrl = uploaded;
      }
      if (!finalUrl) {
        toast.error(
          t("topProducts.provideItemImage", "Provide item image URL or upload"),
        );
        return;
      }

      const body = {
        title,
        desc,
        imageUrl: finalUrl,
        order: Number(order || 0),
        isActive: Boolean(isActive),
      };

      const res = await updateItem({ id: Number(id), body });
      if (res?.data) {
        toast.success(t("topProducts.itemUpdated", "Item updated"));
        navigate("/top-products");
      } else {
        toast.error(res?.error?.data?.message || t("common.failed", "Failed"));
      }
    } catch {
      toast.error(t("common.failed", "Failed"));
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("topProducts.editItem", "Edit Top Product Item")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t(
            "topProducts.editItemSubtitle",
            "Update the selected Top Products carousel item.",
          )}
        </p>
      </div>

      {isLoading ? (
        <p className="text-gray-500 dark:text-gray-400">
          {t("common.loading", "Loading...")}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
          <TextField
            label={t("common.title", "Title")}
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label={t("common.description", "Description")}
            name="desc"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <FileUpload
            label={t("topProducts.uploadItemImage", "Upload item image")}
            name="itemImage"
            accept="image/*"
            onChange={setFile}
            value={file}
          />
          <TextField
            label={t("topProducts.itemImageUrl", "Item image URL")}
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />

          <TextField
            label={t("common.order", "Order")}
            name="order"
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span>{t("common.active", "Active")}</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => navigate("/top-products")}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingItem || isUploading}
              className="bg-green-500/20 hover:bg-green-500/20 text-green-600 dark:text-green-400"
            >
              {isUpdatingItem || isUploading
                ? t("common.processing", "Processing")
                : t("common.update", "Update")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

