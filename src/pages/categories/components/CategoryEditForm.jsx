import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import Dropdown from "@/components/dropdown/dropdown";
import {
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateCategoryMutation } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";

// Yup validation schema
const categoryEditSchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
});
const CategoryEditForm = ({ category, parentOptions, onClose }) => {
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [selectedParent, setSelectedParent] = useState(
        parentOptions.find((p) => p.value === category?.parent?.id) || null
    );
    const [selectedFile, setSelectedFile] = useState(null);
    const { uploadImage, isUploading } = useImageUpload();
    const authUser = useSelector((state) => state.auth.user);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(categoryEditSchema),
        mode: "onChange",
        defaultValues: {
            name: category?.name ?? "",
            isActive: category?.isActive ?? false,
        },
    });

    const onSubmit = async (data) => {
        let photoUrl = category?.photo || null;

        // Upload new image to imgBB if file is selected
        if (selectedFile) {
            photoUrl = await uploadImage(selectedFile);
            if (!photoUrl) {
                // Upload failed, error already shown by hook
                return;
            }
        }

        // Backend uses path param for id and forbids extra fields (id in body)
        const payload = {
            name: data.name,
            isActive: data.isActive,
            photo: photoUrl,
            parentId: selectedParent?.value || null,
        };

        const params = {
            companyId: authUser?.companyId,
        };
        const res = await updateCategory({ id: category.id, body: payload, params });
        if (res?.data) {
            toast.success("Category updated");
            onClose();
        } else {
            toast.error(res?.error?.data?.message || "Failed to update category");
        }
    };

    return (
        <DialogContent className="h-[600px]">
            <DialogHeader>
                <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
                {/* Basic Information Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                        <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                            Basic Information
                        </h3>
                    </div>
                    <TextField
                        label="Category Name *"
                        placeholder="Enter category name"
                        register={register}
                        name="name"
                        error={errors.name?.message}
                    />
                </div>

                {/* Media Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                        <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                            Category Image
                        </h3>
                    </div>
                    <FileUpload
                        placeholder="Choose photo (optional)"
                        label="Category Photo"
                        register={register}
                        name="photo"
                        accept="image/*"
                        onChange={setSelectedFile}
                        value={category?.photo}
                    />
                </div>

                {/* Hierarchy Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                        <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                            Category Hierarchy
                        </h3>
                    </div>
                    <Dropdown
                        name="Parent Category"
                        options={parentOptions.filter((p) => p.value !== category?.id)}
                        setSelectedOption={setSelectedParent}
                        className="py-2"
                    >
                        {selectedParent?.label || (
                            <span className="text-black/50 dark:text-white/50">Select Parent (optional)</span>
                        )}
                    </Dropdown>
                </div>

                {/* Status Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                        <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                            Status
                        </h3>
                    </div>
                    <label className="flex items-center gap-2">
                        <input type="checkbox" {...register("isActive")} />
                        <span>Active</span>
                    </label>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={onClose}
                        className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isUpdating || isUploading}>
                        {isUpdating || isUploading ? "Processing..." : "Update"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

export default CategoryEditForm;

