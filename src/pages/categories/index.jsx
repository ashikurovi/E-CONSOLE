import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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

const CategoriesPage = () => {
  const { data: categories = [], isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleCategoryActiveMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parentOption, setParentOption] = useState(null);

  const { register, handleSubmit, reset } = useForm();

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

  const onSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      slug: formData.slug,
      isActive: !!formData.isActive,
      photo: formData.photo || undefined,
      parentId: parentOption?.value || undefined,
    };

    const res = await createCategory(payload);
    if (res?.data) {
      toast.success("Category created");
      reset();
      setParentOption(null);
      setIsDialogOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Categories</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
              <TextField placeholder="Category name" register={register} name="name" />
              <TextField placeholder="Slug (optional)" register={register} name="slug" />
              <TextField placeholder="Photo URL (optional)" register={register} name="photo" />
              <div className="flex items-center gap-2">
                <Checkbox
                  name="isActive"
                  value={true}
                  setValue={() => {}}
                  disabled
                >
                  Active by default
                </Checkbox>
              </div>
              <div className="flex items-center gap-2">
                <Dropdown
                  name="Parent Category"
                  options={parentOptions}
                  setSelectedOption={setParentOption}
                  className="py-2"
                >
                  {parentOption?.label || <span className="text-black/50 dark:text-white/50">Select Parent</span>}
                </Dropdown>
                {parentOption && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setParentOption(null)}
                    type="button"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <DialogFooter>
                <Button variant="ghost" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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