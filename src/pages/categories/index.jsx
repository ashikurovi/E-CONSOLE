// CategoriesPage component
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2, Pencil, MoreVertical } from "lucide-react";
import {
  Dialog,
} from "@/components/ui/dialog";
import {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryActiveMutation,
} from "@/features/category/categoryApiSlice";
import { useNavigate } from "react-router-dom";
import DeleteModal from "@/components/modals/DeleteModal";
import ConfirmModal from "@/components/modals/ConfirmModal";  
import { useSelector } from "react-redux";

const CategoriesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: categories = [], isLoading } = useGetCategoriesQuery({ companyId: authUser?.companyId });
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleCategoryActiveMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, category: null });

  const headers = useMemo(
    () => [
      { header: t("common.name"), field: "name" },
      { header: t("common.slug"), field: "slug" },
      { header: t("common.parent"), field: "parentName" },
      { header: t("common.status"), field: "status" },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MoreVertical className="h-4 w-4" />
            {t("common.actions")}
          </span>
        ),
        field: "actions",
        sortable: false
      },
    ],
    [t]
  );

  const parentOptions = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
    [categories]
  );

  const tableData = useMemo(
    () =>
      categories.map((cat) => ({
        name: cat.name,
        slug: cat.slug,
        parentName: cat.parent?.name || "-",
        status: cat.isActive ? t("common.active") : t("common.disabled"),
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/categories/${cat.id}/edit`)}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              title={t("common.edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setToggleModal({ isOpen: true, category: cat })}
              disabled={isToggling}
              className={`${cat.isActive
                ? "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400"
                : "bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"}`}
              title={cat.isActive ? t("common.disable") : t("common.activate")}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, category: cat })}
              disabled={isDeleting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              title={t("common.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [categories, deleteCategory, toggleActive, isDeleting, isToggling, t]
  );



  return (
    <div className=" bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center py-2 justify-between">
        <h3 className="text-lg font-medium">{t("nav.categories")}</h3>
        <Button size="sm" onClick={() => navigate("/categories/create")}>
          {t("common.add")} {t("nav.categories")}
        </Button>
      </div>

      {/* Removed inline Dialog+form here */}
      <ReusableTable
        data={tableData}
        headers={headers}
        total={categories.length}
        isLoading={isLoading}
        py="py-2"
      />


      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!deleteModal.category) return;
          const res = await deleteCategory(deleteModal.category.id);
          if (res?.data) {
            toast.success(t("modal.categoryDeleted"));
            setDeleteModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryDeleteFailed"));
          }
        }}
        title={t("modal.deleteCategory")}
        description={t("modal.deleteCategoryDesc")}
        itemName={deleteModal.category?.name}
        isLoading={isDeleting}
      />

      <ConfirmModal
        isOpen={toggleModal.isOpen}
        onClose={() => setToggleModal({ isOpen: false, category: null })}
        onConfirm={async () => {
          if (!toggleModal.category) return;
          const res = await toggleActive({ id: toggleModal.category.id });
          if (res?.data) {
            toast.success(t("modal.categoryUpdated", { status: toggleModal.category?.isActive ? t("common.disable") : t("common.enable") }));
            setToggleModal({ isOpen: false, category: null });
          } else {
            toast.error(t("modal.categoryUpdateFailed"));
          }
        }}
        title={toggleModal.category?.isActive ? t("modal.disableCategory") : t("modal.enableCategory")}
        description={toggleModal.category?.isActive ? t("modal.disableCategoryDesc") : t("modal.enableCategoryDesc")}
        itemName={`${toggleModal.category?.isActive ? t("common.disable") : t("common.enable")} "${toggleModal.category?.name}"?`}
        isLoading={isToggling}
        type={toggleModal.category?.isActive ? "warning" : "success"}
        confirmText={toggleModal.category?.isActive ? t("common.disable") : t("common.enable")}
      />
    </div>
  );
};

export default CategoriesPage;