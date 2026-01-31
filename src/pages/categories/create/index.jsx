import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateCategoryMutation } from "@/features/category/categoryApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";

const categorySchema = yup.object().shape({
  name: yup
    .string()
    .required("Category name is required")
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),
});

function CreateCategoryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: user?.companyId });
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

  const parentOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories]
  );

  const onSubmit = async (data) => {
    let photoUrl = null;

    if (selectedFile) {
      photoUrl = await uploadImage(selectedFile);
      if (!photoUrl) {
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
        navigate("/categories");
      } else {
        const errorMessage = res?.error?.data?.message || res?.error?.data?.error || t("forms.categoryCreateFailed");
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error(error?.message || t("forms.categoryCreateFailed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
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
          <h1 className="text-2xl font-semibold">{t("createEdit.createCategory")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.createCategoryDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
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

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
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

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
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

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button
            variant="ghost"
            type="button"
            onClick={() => navigate("/categories")}
            className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
          >
            {t("common.cancel")}
          </Button>
          <Button type="submit" disabled={isCreating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
            {isCreating || isUploading ? t("common.processing") : t("common.create")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateCategoryPage;
