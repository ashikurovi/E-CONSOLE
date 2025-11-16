import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
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
import useImageUpload from "@/hooks/useImageUpload";

// Validation schema
const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),
  slug: yup
    .string()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .max(100, "Slug must be less than 100 characters")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

function CategoryForm({ parentOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [parentOption, setParentOption] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(categorySchema),
  });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const onSubmit = async (data) => {
    let photoUrl = null;

    // Upload image to imgBB if file is selected
    if (selectedFile) {
      photoUrl = await uploadImage(selectedFile);
      if (!photoUrl) {
        // Upload failed, error already shown by hook
        return;
      }
    }

    const payload = {
      name: data.name,
      slug: data.slug || null, // Ensure null instead of empty string
      isActive: true,
      photo: photoUrl || null,
      parentId: parentOption?.value || null,
    };

    try {
      const res = await createCategory(payload);
      if (res?.data) {
        toast.success("Category created");
        reset();
        setParentOption(null);
        setSelectedFile(null);
        setIsOpen(false);
        // Force refetch to ensure new category appears
        // The cache invalidation should handle this, but we can also manually refetch if needed
      } else {
        // Log full error for debugging
        console.error("Category creation error:", res?.error);
        const errorMessage = res?.error?.data?.message || res?.error?.data?.error || "Failed to create category";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Category creation exception:", error);
      toast.error(error?.message || "Failed to create category");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Category</Button>
      </DialogTrigger>
      <DialogContent className="h-[600px]">
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex  flex-col gap-4 mt-4">
          <TextField
            placeholder="Category name"
            register={register}
            name="name"
            error={errors.name}
          />
          <TextField
            placeholder="Slug (optional)"
            register={register}
            name="slug"
            error={errors.slug}
          />
          <FileUpload
            placeholder="Choose photo (optional)"
            label="Category Photo"
            register={register}
            name="photo"
            accept="image/*"
            onChange={setSelectedFile}
          />
          <div className="flex items-center gap-2">
            {/* <Checkbox
              name="isActive"
              value={true}
              setValue={() => { }}
              disabled
            >
              Active by default
            </Checkbox> */}
          </div>

          <Dropdown
            name="Parent Category"
            options={parentOptions}
            setSelectedOption={setParentOption}
            className="py-2  "
          >
            {parentOption?.label || <span className="text-black/50 dark:text-white/50">Select Parent</span>}
          </Dropdown>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || isUploading}>
              {isCreating || isUploading ? "Processing..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;