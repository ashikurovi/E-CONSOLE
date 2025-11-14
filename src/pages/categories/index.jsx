// CategoriesPage component
import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Power, Trash2, Pencil } from "lucide-react";
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
  useUpdateCategoryMutation,
} from "@/features/category/categoryApiSlice";
import CategoryForm from "./components/CategoryForm";
import { useForm } from "react-hook-form";

const CategoryEditForm = ({ category, parentOptions, onClose }) => {
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [selectedParent, setSelectedParent] = useState(
    parentOptions.find((p) => p.value === category?.parent?.id) || null
  );

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? false,
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      id: category.id,
      name: data.name,
      slug: data.slug,
      isActive: data.isActive,
      parentId: selectedParent?.value || null,
    };

    const res = await updateCategory(payload);
    if (res?.data) {
      toast.success("Category updated");
      onClose();
    } else {
      toast.error(res?.error?.data?.message || "Failed to update category");
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Category</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
        <TextField placeholder="Category name" register={register} name="name" />
        <TextField placeholder="Slug" register={register} name="slug" />
        <Dropdown
          name="Parent Category (optional)"
          options={parentOptions.filter((p) => p.value !== category?.id)}
          setSelectedOption={setSelectedParent}
          className="py-2"
        >
          {selectedParent?.label || (
            <span className="text-black/50 dark:text-white/50">Select Parent (optional)</span>
          )}
        </Dropdown>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} />
          <span>Active</span>
        </label>
        <DialogFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleCategoryActiveMutation();
  const [editingCategory, setEditingCategory] = useState(null);

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
              variant="ghost"
              size="icon"
              onClick={() => setEditingCategory(cat)}
              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                const res = await toggleActive({ id: cat.id });
                if (res?.data) {
                  toast.success("Category state updated");
                } else {
                  toast.error("Failed to update category");
                }
              }}
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

      {editingCategory && (
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <CategoryEditForm
            category={editingCategory}
            parentOptions={parentOptions}
            onClose={() => setEditingCategory(null)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default CategoriesPage;