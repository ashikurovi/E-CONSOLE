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
import CategoryForm from "./components/CategoryForm";

const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleCategoryActiveMutation();


  console.log(categories)

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "Slug", field: "slug" },
      { header: "Parent", field: "parentName" },
      { header: "Status", field: "status" },
      { header: "Actions", field: "actions" },
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
              variant={cat.isActive ? "outline" : "default"}
              size="sm"
              onClick={async () => {
                const res = await toggleActive({ id: cat.id });
                if (res?.data) {
                  toast.success("Category state updated");
                } else {
                  toast.error("Failed to update category");
                }
              }}
              disabled={isToggling}
            >
              {cat.isActive ? "Disable" : "Activate"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!confirm(`Delete category "${cat.name}"?`)) return;
                const res = await deleteCategory(cat.id);
                if (res?.data) {
                  toast.success("Category deleted");
                } else {
                  toast.error("Failed to delete category");
                }
              }}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        ),
      })),
    [categories, deleteCategory, toggleActive, isDeleting, isToggling]
  );



  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categories</h3>
        {/* Moved form into its own component */}
        <CategoryForm parentOptions={parentOptions} />
      </div>

      {/* Removed inline Dialog+form here */}
      <ReusableTable
        data={tableData}
        headers={headers}
        total={categories.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default CategoriesPage;