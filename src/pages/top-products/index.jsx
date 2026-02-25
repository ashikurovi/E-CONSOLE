import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  Power,
  Trash2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import ReusableTable from "@/components/table/reusable-table";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

import useImageUpload from "@/hooks/useImageUpload";
import {
  useDeleteTopProductsItemMutation,
  useGetTopProductsQuery,
  useUpdateTopProductsItemMutation,
  useUpdateTopProductsSectionMutation,
} from "@/features/topProducts/topProductsApiSlice";

const sanitizeUrl = (u) => (u || "").replace(/`/g, "").trim();

export default function TopProductsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetTopProductsQuery();
  const items = Array.isArray(data?.carouselItems) ? data.carouselItems : [];

  const [updateSection, { isLoading: isUpdatingSection }] =
    useUpdateTopProductsSectionMutation();
  const [updateItem, { isLoading: isUpdatingItem }] =
    useUpdateTopProductsItemMutation();
  const [deleteItem, { isLoading: isDeletingItem }] =
    useDeleteTopProductsItemMutation();

  const { uploadImage, isUploading } = useImageUpload();

  // Section form state
  const [leftImageUrl, setLeftImageUrl] = useState("");
  const [rightImageUrl, setRightImageUrl] = useState("");
  const [leftFile, setLeftFile] = useState(null);
  const [rightFile, setRightFile] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    item: null,
    nextIsActive: false,
  });

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((i) => i.isActive).length;
    const inactive = total - active;
    return [
      {
        label: t("topProducts.totalItems", "Total Items"),
        value: total,
        icon: Layers,
        color: "text-blue-600",
        bg: "bg-blue-100 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
      },
      {
        label: t("topProducts.activeItems", "Active Items"),
        value: active,
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-100 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800",
      },
      {
        label: t("topProducts.inactiveItems", "Inactive Items"),
        value: inactive,
        icon: XCircle,
        color: "text-rose-600",
        bg: "bg-rose-100 dark:bg-rose-900/20",
        border: "border-rose-200 dark:border-rose-800",
      },
    ];
  }, [items, t]);

  const onSaveSection = async (e) => {
    e.preventDefault();
    try {
      let left = sanitizeUrl(leftImageUrl);
      let right = sanitizeUrl(rightImageUrl);

      if (leftFile) {
        const url = await uploadImage(leftFile);
        if (!url) return;
        left = url;
      }
      if (rightFile) {
        const url = await uploadImage(rightFile);
        if (!url) return;
        right = url;
      }

      const body = {};
      if (left) body.leftImageUrl = left;
      if (right) body.rightImageUrl = right;

      if (!body.leftImageUrl && !body.rightImageUrl) {
        toast.error(
          t("topProducts.provideImage", "Provide image URL or upload"),
        );
        return;
      }

      const res = await updateSection(body);
      if (res?.data) {
        toast.success(
          t("topProducts.sectionUpdated", "Top Products section updated"),
        );
        setLeftImageUrl("");
        setRightImageUrl("");
        setLeftFile(null);
        setRightFile(null);
        refetch();
      } else {
        toast.error(res?.error?.data?.message || t("common.failed", "Failed"));
      }
    } catch {
      toast.error(t("common.failed", "Failed"));
    }
  };

  const headers = useMemo(
    () => [
      { header: t("common.image", "Image"), field: "image" },
      { header: t("common.title", "Title"), field: "title" },
      { header: t("common.order", "Order"), field: "order" },
      { header: t("common.status", "Status"), field: "status" },
      { header: t("common.actions", "Actions"), field: "actions" },
    ],
    [t],
  );

  const tableData = useMemo(
    () =>
      items.map((it) => ({
        image: (
          <div className="w-24 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 relative group">
            {it.image ? (
              <img
                src={it.image}
                alt={it.title || "item"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        ),
        title: (
          <div>
            <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {it.title || "-"}
            </p>
            {it.desc ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                {it.desc}
              </p>
            ) : null}
          </div>
        ),
        order: (
          <span className="font-mono font-medium text-gray-600 dark:text-gray-400">
            #{Number(it.order || 0)}
          </span>
        ),
        status: (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex w-fit items-center gap-1.5 ${
              it.isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                it.isActive ? "bg-emerald-500" : "bg-gray-500"
              }`}
            />
            {it.isActive ? t("common.active", "Active") : t("common.disabled", "Disabled")}
          </span>
        ),
        actions: (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
              onClick={() => navigate(`/top-products/${it.id}/edit`)}
              title={t("common.edit", "Edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setToggleModal({
                  isOpen: true,
                  item: it,
                  nextIsActive: !it.isActive,
                })
              }
              disabled={isUpdatingItem}
              className={`h-8 w-8 rounded-full transition-colors ${
                it.isActive
                  ? "hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400"
                  : "hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400"
              }`}
              title={
                it.isActive
                  ? t("common.disable", "Disable")
                  : t("common.enable", "Enable")
              }
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, item: it })}
              disabled={isDeletingItem}
              className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              title={t("common.delete", "Delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [items, isDeletingItem, isUpdatingItem, t],
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            {t("topProducts.title", "Top Products")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg text-base">
            {t(
              "topProducts.subtitle",
              "Manage Top Products section images and carousel items.",
            )}
          </p>
        </div>

        <Button
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1"
          onClick={() => navigate("/top-products/create")}
        >
          <div className="bg-white/20 p-1 rounded-lg">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-base">{t("topProducts.addItem", "Add Item")}</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`rounded-2xl p-5 border ${stat.bg} ${stat.border} flex flex-col justify-between h-28 relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start z-10">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}>
                  {stat.label}
                </p>
                <h3 className={`text-3xl font-black mt-2 ${stat.color}`}>{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl bg-white/50 dark:bg-black/20 backdrop-blur-sm ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <stat.icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12 ${stat.color} transition-transform group-hover:scale-110 duration-500`} />
          </motion.div>
        ))}
      </div>

      {/* Section Images */}
      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-100/50 dark:shadow-black/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("topProducts.sectionImages", "Section Images")}
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("topProducts.leftImage", "Left Image")}
            </div>
            {data?.leftImage ? (
              <img
                src={data.leftImage}
                alt="left"
                className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-44 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
                {t("topProducts.noImage", "No image")}
              </div>
            )}
            <FileUpload
              label={t("topProducts.uploadLeft", "Upload left image")}
              name="leftImage"
              accept="image/*"
              onChange={setLeftFile}
              value={leftFile}
            />
            <TextField
              label={t("topProducts.leftImageUrl", "Left image URL")}
              name="leftImageUrl"
              value={leftImageUrl}
              onChange={(e) => setLeftImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {t("topProducts.rightImage", "Right Image")}
            </div>
            {data?.rightImage ? (
              <img
                src={data.rightImage}
                alt="right"
                className="w-full h-44 object-cover rounded-xl border border-gray-200 dark:border-gray-700"
              />
            ) : (
              <div className="w-full h-44 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
                {t("topProducts.noImage", "No image")}
              </div>
            )}
            <FileUpload
              label={t("topProducts.uploadRight", "Upload right image")}
              name="rightImage"
              accept="image/*"
              onChange={setRightFile}
              value={rightFile}
            />
            <TextField
              label={t("topProducts.rightImageUrl", "Right image URL")}
              name="rightImageUrl"
              value={rightImageUrl}
              onChange={(e) => setRightImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={onSaveSection}
            disabled={isUpdatingSection || isUploading}
            className="bg-green-500/20 hover:bg-green-500/20 text-green-600 dark:text-green-400"
          >
            {isUpdatingSection || isUploading
              ? t("common.processing", "Processing")
              : t("common.save", "Save")}
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-100/50 dark:shadow-black/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("topProducts.items", "Carousel Items")}
          </h3>
        </div>

        <ReusableTable
          data={tableData}
          headers={headers}
          total={items.length}
          isLoading={isLoading}
          py="py-3"
        />
      </div>

      {/* Delete modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={async () => {
          if (!deleteModal.item?.id) return;
          const res = await deleteItem(deleteModal.item.id);
          if (res?.data) {
            toast.success(t("topProducts.itemDeleted", "Item deleted"));
            setDeleteModal({ isOpen: false, item: null });
            refetch();
          } else {
            toast.error(res?.error?.data?.message || t("common.failed", "Failed"));
          }
        }}
        title={t("topProducts.deleteItem", "Delete item")}
        description={t("topProducts.deleteItemDesc", "This action cannot be undone.")}
        itemName={deleteModal.item?.title}
        isLoading={isDeletingItem}
      />

      {/* Toggle active modal */}
      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, item: null, nextIsActive: false })}
        onConfirm={async () => {
          if (!toggleModal.item?.id) return;
          const res = await updateItem({
            id: toggleModal.item.id,
            body: { isActive: toggleModal.nextIsActive },
          });
          if (res?.data) {
            toast.success(t("topProducts.itemUpdated", "Item updated"));
            setToggleModal({ isOpen: false, item: null, nextIsActive: false });
            refetch();
          } else {
            toast.error(res?.error?.data?.message || t("common.failed", "Failed"));
          }
        }}
        isLoading={isUpdatingItem}
        type={toggleModal.nextIsActive ? "success" : "warning"}
        title={
          toggleModal.nextIsActive
            ? t("common.enable", "Enable")
            : t("common.disable", "Disable")
        }
        description={t("topProducts.toggleDesc", "Update item visibility on storefront.")}
        itemName={toggleModal.item?.title ? `"${toggleModal.item.title}"` : undefined}
        confirmText={toggleModal.nextIsActive ? t("common.enable", "Enable") : t("common.disable", "Disable")}
        cancelText={t("common.cancel", "Cancel")}
      />
    </div>
  );
}

