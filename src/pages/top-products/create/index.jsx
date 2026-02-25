import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import { useCreateTopProductsItemMutation } from "@/features/topProducts/topProductsApiSlice";

const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

export default function TopProductsCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [createItem, { isLoading: isCreatingItem }] =
    useCreateTopProductsItemMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
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

      const res = await createItem(body);
      if (res?.data) {
        toast.success(t("topProducts.itemCreated", "Item created"));
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
          {t("topProducts.addItem", "Add Top Product Item")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t(
            "topProducts.addItemSubtitle",
            "Create a new item for the Top Products carousel.",
          )}
        </p>
      </div>

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
            disabled={isCreatingItem || isUploading}
            className="bg-green-500/20 hover:bg-green-500/20 text-green-600 dark:text-green-400"
          >
            {isCreatingItem || isUploading
              ? t("common.processing", "Processing")
              : t("common.create", "Create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

