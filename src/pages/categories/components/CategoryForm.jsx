import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import { useCreateCategoryMutation } from "@/features/category/categoryApiSlice";

const CategoryForm = ({ parentOptions = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [parentOption, setParentOption] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();

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
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create category");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;