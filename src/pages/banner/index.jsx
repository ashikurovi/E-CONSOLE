import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import BannerForm from "./components/BannerForm";
import BannerEditForm from "./components/BannerEditForm";
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApiSlice";
import { Power, Trash2 } from "lucide-react";
import DeleteModal from "@/components/modals/DeleteModal";

const BannerPage = () => {
  const { data: banners = [], isLoading: isBannersLoading } = useGetBannersQuery();
  const [deleteBanner, { isLoading: isDeletingBanner }] = useDeleteBannerMutation();
  const [updateBanner, { isLoading: isUpdatingBanner }] = useUpdateBannerMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, banner: null });

  const headers = useMemo(
    () => [
      { header: "Title", field: "title" },
      { header: "Subtitle", field: "subtitle" },
      { header: "Image URL", field: "imageUrl" },
      { header: "Button Text", field: "buttonText" },
      { header: "Button Link", field: "buttonLink" },
      { header: "Order", field: "order" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
    ],
    []
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
        status: b.isActive ? "Active" : "Disabled",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <BannerEditForm banner={b} />
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                const res = await updateBanner({ id: b.id, isActive: !b.isActive });
                if (res?.data) {
                  toast.success("Banner state updated");
                } else {
                  toast.error("Failed to update banner");
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
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [banners, updateBanner, isDeletingBanner, isUpdatingBanner]
  );



  const bannerHeaders = useMemo(
    () => [
      { header: "Title", field: "title" },
      { header: "Subtitle", field: "subtitle" },
      { header: "Order", field: "order" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
    ],
    []
  );



  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Banner</h3>
        <BannerForm />
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
            toast.success("Banner deleted");
            setDeleteModal({ isOpen: false, banner: null });
          } else {
            toast.error(res?.error?.data?.message || "Failed to delete banner");
          }
        }}
        title="Delete Banner"
        description="This action cannot be undone. This will permanently delete the banner."
        itemName={deleteModal.banner?.title}
        isLoading={isDeletingBanner}
      />
    </div>
  );
};

export default BannerPage;