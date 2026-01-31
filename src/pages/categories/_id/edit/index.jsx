import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import Dropdown from "@/components/dropdown/dropdown";
import { useUpdateCategoryMutation, useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";

const categoryEditSchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters")
    .trim(),
});

const CategoryEditPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: user?.companyId });
  const category = categories.find((c) => c.id === parseInt(id));
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  const parentOptions = useMemo(
    () => categories.filter((c) => c.id !== parseInt(id)).map((cat) => ({ label: cat.name, value: cat.id })),
    [categories, id]
  );

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

  useEffect(() => {
    if (category?.parent?.id) {
      const found = parentOptions.find((p) => p.value === category.parent.id);
      setSelectedParent(found || null);
    }
  }, [category, parentOptions]);

  const onSubmit = async (data) => {
    if (!category) return;

    let photoUrl = category?.photo || null;

    if (selectedFile) {
      photoUrl = await uploadImage(selectedFile);
      if (!photoUrl) {
        return;
      }
    }

    const payload = {
      name: data.name,
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
      navigate("/categories");
    } else {
      toast.error(res?.error?.data?.message || "Failed to update category");
    }
  };

  if (!category) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/categories")}
            className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Category Not Found</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              The category you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/categories")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("createEdit.editCategory")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.updateCategory")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
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
            error={errors.name?.message}
          />
        </div>

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
            value={category?.photo}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("forms.categoryHierarchy")}
            </h3>
          </div>
          <Dropdown
            name={t("forms.parentCategory")}
            options={parentOptions}
            setSelectedOption={setSelectedParent}
            className="py-2"
          >
            {selectedParent?.label || (
              <span className="text-black/50 dark:text-white/50">{t("forms.selectParent")}</span>
            )}
          </Dropdown>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("common.status")}
            </h3>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register("isActive")} />
            <span>{t("common.active")}</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/categories")}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isUpdating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isUpdating || isUploading ? t("common.processing") : t("common.update")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryEditPage;
