import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
const CategoryEditForm = ({ category, parentOptions, onClose }) => {
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [selectedParent, setSelectedParent] = useState(
        parentOptions.find((p) => p.value === category?.parent?.id) || null
    );
    const [selectedFile, setSelectedFile] = useState(null);
    const { uploadImage, isUploading } = useImageUpload();
    const { user } = useSelector((state) => state.auth);
    console.log(user)
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: category?.name ?? "",
            slug: category?.slug ?? "",
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
            slug: data.slug,
            isActive: data.isActive,
            photo: photoUrl,
            parentId: selectedParent?.value || null,
        };

        const params = {
            companyId: user?.companyId,
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <TextField placeholder="Category name" register={register} name="name" />
                <TextField placeholder="Slug" register={register} name="slug" />
                <FileUpload
                    placeholder="Choose photo (optional)"
                    label="Category Photo"
                    register={register}
                    name="photo"
                    accept="image/*"
                    onChange={setSelectedFile}
                    value={category?.photo}
                />
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

