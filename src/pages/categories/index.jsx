// CategoriesPage component
import React, { useMemo, useState } from "react";
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
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: categories = [], isLoading } = useGetCategoriesQuery({ companyId: authUser?.companyId });
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleCategoryActiveMutation();
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [toggleModal, setToggleModal] = useState({ isOpen: false, category: null });

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "Slug", field: "slug" },
      { header: "Parent", field: "parentName" },
      { header: "Status", field: "status" },
      {
        header: (
          <span className="inline-flex items-center gap-1.5">
            <MoreVertical className="h-4 w-4" />
            Actions
          </span>
        ),
        field: "actions",
        sortable: false
      },
    ],
    []
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
        status: cat.isActive ? "Active" : "Disabled",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/categories/${cat.id}/edit`)}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              title="Edit"
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
              title={cat.isActive ? "Disable" : "Activate"}
            >
              <Power className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteModal({ isOpen: true, category: cat })}
              disabled={isDeleting}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [categories, deleteCategory, toggleActive, isDeleting, isToggling]
  );



  return (
    <div className=" bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center py-2 justify-between">
        <h3 className="text-lg font-medium">Categories</h3>
        <Button size="sm" onClick={() => navigate("/categories/create")}>
          Add Category
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
            toast.success("Category deleted");
            setDeleteModal({ isOpen: false, category: null });
          } else {
            toast.error("Failed to delete category");
          }
        }}
        title="Delete Category"
        description="This will permanently delete the category and cannot be undone."
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
            toast.success(`Category ${toggleModal.category.isActive ? "disabled" : "enabled"}`);
            setToggleModal({ isOpen: false, category: null });
          } else {
            toast.error("Failed to update category");
          }
        }}
        title={toggleModal.category?.isActive ? "Disable Category" : "Enable Category"}
        description={toggleModal.category?.isActive
          ? "This will disable the category and it will not be visible to users."
          : "This will enable the category and make it visible to users."}
        itemName={`Are you sure you want to ${toggleModal.category?.isActive ? "disable" : "enable"} "${toggleModal.category?.name}"?`}
        isLoading={isToggling}
        type={toggleModal.category?.isActive ? "warning" : "success"}
        confirmText={toggleModal.category?.isActive ? "Disable" : "Enable"}
      />
    </div>
  );
};

export default CategoriesPage;