import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
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
import { useSelector } from "react-redux";

function CategoryForm({ parentOptions = [] }) {
  const { t } = useTranslation();
  const categorySchema = useMemo(() => yup.object().shape({
    name: yup
      .string()
      .required(t("forms.categoryNameRequired"))
      .min(2, t("forms.categoryNameMin"))
      .max(100, t("forms.categoryNameMax")),
  }), [t]);
  const [isOpen, setIsOpen] = useState(false);
  const [parentOption, setParentOption] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useSelector((state) => state.auth);
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
      isActive: true,
      photo: photoUrl || null,
      parentId: parentOption?.value || null,

    };

    const params = {
      companyId: user ? user.companyId : null,
    };

    try {
      const res = await createCategory({ body: payload, params });
      if (res?.data) {
        toast.success(t("forms.categoryCreated"));
        reset();
        setParentOption(null);
        setSelectedFile(null);
        setIsOpen(false);
        // Force refetch to ensure new category appears
        // The cache invalidation should handle this, but we can also manually refetch if needed
      } else {
        // Log full error for debugging
        console.error("Category creation error:", res?.error);
        const errorMessage = res?.error?.data?.message || res?.error?.data?.error || t("forms.categoryCreateFailed");
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Category creation exception:", error);
      toast.error(error?.message || t("forms.categoryCreateFailed"));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">{t("common.add")} {t("nav.categories")}</Button>
      </DialogTrigger>
      <DialogContent className="h-[600px]">
        <DialogHeader>
          <DialogTitle>{t("forms.createCategory")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("forms.basicInfo")}
              </h3>
            </div>
            <TextField
              label={`${t("forms.categoryName")} *`}
              placeholder={t("forms.categoryName")}
              register={register}
              name="name"
              error={errors.name}
            />
          </div>

          {/* Media Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("forms.categoryImage")}
              </h3>
            </div>
            <FileUpload
              placeholder={t("forms.choosePhoto")}
              label={t("forms.categoryPhoto")}
              register={register}
              name="photo"
              accept="image/*"
              onChange={setSelectedFile}
            />
          </div>

          {/* Hierarchy Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                {t("forms.categoryHierarchy")}
              </h3>
            </div>
            <Dropdown
              name={t("forms.parentCategory")}
              options={parentOptions}
              setSelectedOption={setParentOption}
              className="py-2"
            >
              {parentOption?.label || <span className="text-black/50 dark:text-white/50">{t("forms.selectParent")}</span>}
            </Dropdown>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating || isUploading}>
              {isCreating || isUploading ? t("common.processing") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;