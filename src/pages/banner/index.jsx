import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApiSlice";
import { Power, Trash2 } from "lucide-react";
import DeleteModal from "@/components/modals/DeleteModal";
import { useSelector } from "react-redux";

const BannerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: banners = [], isLoading: isBannersLoading } = useGetBannersQuery({ companyId: authUser?.companyId });
  const [deleteBanner, { isLoading: isDeletingBanner }] = useDeleteBannerMutation();
  const [updateBanner, { isLoading: isUpdatingBanner }] = useUpdateBannerMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null });

  const headers = useMemo(
    () => [
      { header: t("banners.titleField"), field: "title" },
      { header: t("banners.subtitle"), field: "subtitle" },
      { header: t("banners.imageUrl"), field: "imageUrl" },
      { header: t("banners.buttonText"), field: "buttonText" },
      { header: t("banners.buttonLink"), field: "buttonLink" },
      { header: t("banners.order"), field: "order" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );



  const bannerTableData = useMemo(

    () =>
      banners.map((b) => ({
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        buttonText: b.buttonText,
        buttonLink: b.buttonLink,
        order: b.order ?? "-",
        status: b.isActive ? t("common.active") : t("common.disabled"),
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              onClick={() => navigate(`/banners/${b.id}/edit`)}
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                const res = await updateBanner({ id: b.id, isActive: !b.isActive });
                if (res?.data) {
                  toast.success(t("banners.bannerStateUpdated"));
                } else {
                  toast.error(t("banners.bannerUpdateFailed"));
                }
              }}
              disabled={isUpdatingBanner}
              className={`${b.isActive
                ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                : "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"}`}
              title={b.isActive ? "Disable" : "Activate"}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, banner: b })}
              disabled={isDeletingBanner}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [banners, updateBanner, isDeletingBanner, isUpdatingBanner, t]
  );



  const bannerHeaders = useMemo(
    () => [
      { header: t("banners.titleField"), field: "title" },
      { header: t("banners.subtitle"), field: "subtitle" },
      { header: t("banners.order"), field: "order" },
      { header: t("common.status"), field: "status" },
      { header: t("common.actions"), field: "actions" },
    ],
    [t]
  );



  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("banners.title")}</h3>
        <Button size="sm" onClick={() => navigate("/banners/create")}>
          {t("banners.addBanner")}
        </Button>
      </div>
      <ReusableTable
        data={bannerTableData}
        headers={bannerHeaders}
        total={banners.length}
        isLoading={isBannersLoading}
        py="py-2"
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, banner: null })}
        onConfirm={async () => {
          if (!deleteModal.banner) return;
          const res = await deleteBanner(deleteModal.banner.id);
          if (res?.data) {
            toast.success(t("banners.bannerDeleted"));
            setDeleteModal({ isOpen: false, banner: null });
          } else {
            toast.error(res?.error?.data?.message || t("common.failed"));
          }
        }}
        title={t("banners.deleteBanner")}
        description={t("banners.deleteBannerDesc")}
        itemName={deleteModal.banner?.title}
        isLoading={isDeletingBanner}
      />
    </div>
  );
};

export default BannerPage;