// CategoriesPage component
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} from "@/features/category/categoryApiSlice";
import BannerForm from "./components/BannerForm";
import BannerEditForm from "./components/BannerEditForm";
import {
  useGetBannersQuery,
  useDeleteBannerMutation,
  useUpdateBannerMutation,
} from "@/features/banners/bannersApiSlice";
import { Power, Trash2 } from "lucide-react";

const BannerPage = () => {



  const { data: banners = [], isLoading: isBannersLoading } = useGetBannersQuery();
  const [deleteBanner, { isLoading: isDeletingBanner }] = useDeleteBannerMutation();
  const [updateBanner, { isLoading: isUpdatingBanner }] = useUpdateBannerMutation();

  console.log(banners)

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
              variant={b.isActive ? "outline" : "default"}
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
              title={b.isActive ? "Disable" : "Activate"}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (!confirm(`Delete banner "${b.title}"?`)) return;
                const res = await deleteBanner(b.id);
                if (res?.data) {
                  toast.success("Banner deleted");
                } else {
                  toast.error("Failed to delete banner");
                }
              }}
              disabled={isDeletingBanner}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [banners, deleteBanner, updateBanner, isDeletingBanner, isUpdatingBanner]
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
    </div>
  );
};

export default BannerPage;