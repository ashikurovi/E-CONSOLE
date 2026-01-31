import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Plus } from "lucide-react";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateProductMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import FileUpload from "@/components/input/FileUpload";
import { useSelector } from "react-redux";

// Yup validation schema
const productSchema = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required")
    .min(2, "Product name must be at least 2 characters")
    .max(200, "Product name must be less than 200 characters")
    .trim(),
  description: yup
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .trim(),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0")
    .test('decimal-places', 'Price can have at most 2 decimal places', (value) => {
      if (value === undefined || value === null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
  discountPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Discount price must be a number")
    .positive("Discount price must be greater than 0")
    .test('less-than-price', 'Discount price must be less than regular price', function(value) {
      const { price } = this.parent;
      if (!value || !price) return true;
      return value < price;
    })
    .test('decimal-places', 'Discount price can have at most 2 decimal places', (value) => {
      if (value === undefined || value === null) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
  stock: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
});

function CreateProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: user?.companyId });
  const [categoryOption, setCategoryOption] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const { uploadImage, isUploading } = useImageUpload();

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories]
  );

  const addImage = () => {
    setImageFiles([...imageFiles, { url: "", alt: "", isPrimary: imageFiles.length === 0 }]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const updateImage = (index, field, value) => {
    const updated = [...imageFiles];
    updated[index] = { ...updated[index], [field]: value };
    setImageFiles(updated);
  };

  const setPrimaryImage = (index) => {
    setImageFiles(imageFiles.map((img, i) => ({ ...img, isPrimary: i === index })));
  };

  const onSubmit = async (data) => {
    let thumbnailUrl = null;
    if (thumbnailFile) {
      try {
        thumbnailUrl = await uploadImage(thumbnailFile);
        if (!thumbnailUrl) {
          toast.error(t("productForm.failedUploadThumbnail"));
          // Don't return - allow user to proceed without thumbnail since it's optional
        }
      } catch (error) {
        console.error("Thumbnail upload error:", error);
        toast.error(t("productForm.failedUploadThumbnail"));
        // Don't return - allow user to proceed without thumbnail since it's optional
      }
    }

    // Upload all image files
    const uploadedImages = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const img = imageFiles[i];
      if (img.file) {
        const url = await uploadImage(img.file);
        if (url) {
          uploadedImages.push({
            url,
            alt: img.alt || `Product image ${i + 1}`,
            isPrimary: img.isPrimary || false,
          });
        }
      } else if (img.url) {
        uploadedImages.push({
          url: img.url,
          alt: img.alt || `Product image ${i + 1}`,
          isPrimary: img.isPrimary || false,
        });
      }
    }

    // Ensure at least one image is primary
    if (uploadedImages.length > 0 && !uploadedImages.some((img) => img.isPrimary)) {
      uploadedImages[0].isPrimary = true;
    }

    const payload = {
      name: data.name,
      price: parseFloat(data.price) || 0,
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
      description: data.description || "",
      images: uploadedImages,
      thumbnail: thumbnailUrl || null,
      categoryId: categoryOption?.value || null,
      status: saveAsDraft ? 'draft' : 'published',
      stock: data.stock ? parseInt(data.stock) : 0,
    };

    const params = { companyId: user.companyId };
    const res = await createProduct({ body: payload, params });
    if (res?.data) {
      toast.success(saveAsDraft ? t("productForm.productSavedAsDraft") : t("productForm.productCreated"));
      reset();
      setCategoryOption(null);
      setThumbnailFile(null);
      setImageFiles([]);
      setSaveAsDraft(false);
      navigate("/products");
    } else {
      toast.error(res?.error?.data?.message || t("productForm.productCreateFailed"));
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/products")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">{t("createEdit.createProduct")}</h1>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            {t("createEdit.createProductDesc")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("forms.basicInfo")}
            </h3>
          </div>
          <TextField
            label={`${t("productForm.productName")} *`}
            placeholder={t("productForm.productNamePlaceholder")}
            register={register}
            name="name"
            error={errors.name?.message}
          />
         
          <TextField 
            label={t("productForm.description")}
            placeholder={t("productForm.descriptionPlaceholder")}
            register={register}
            name="description"
            multiline
            rows={4}
            error={errors.description?.message}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("productForm.pricing")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={`${t("productForm.price")} *`}
              placeholder={t("productForm.pricePlaceholder")}
              register={register}
              name="price"
              type="number"
              step="0.01"
              error={errors.price?.message}
            />
            <TextField
              label={t("productForm.discountPrice")}
              placeholder={t("productForm.priceOptionalPlaceholder")}
              register={register}
              name="discountPrice"
              type="number"
              step="0.01"
              error={errors.discountPrice?.message}
            />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("productForm.inventory")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label={t("productForm.initialStock")}
              placeholder={t("productForm.stockOptionalPlaceholder")}
              register={register}
              name="stock"
              type="number"
              step="1"
              error={errors.stock?.message}
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("productForm.productImages")}
            </h3>
          </div>
          <FileUpload
            placeholder={t("productForm.chooseThumbnail")}
            label={t("productForm.thumbnail")}
            register={register}
            name="thumbnail"
            accept="image/*"
            onChange={setThumbnailFile}
            value={thumbnailFile}
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-black/50 dark:text-white/50 text-sm ml-1">{t("productForm.galleryImages")}</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addImage}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                {t("common.addImage")}
              </Button>
            </div>
            <div className="space-y-3">
              {imageFiles.map((img, index) => (
                <div key={index} className="border border-black/5 dark:border-gray-800 p-3 rounded-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-black/70 dark:text-white/70">
                      {t("productForm.imageNumber", { num: index + 1 })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        name={`primary_${index}`}
                        value={img.isPrimary}
                        setValue={() => setPrimaryImage(index)}
                      >
                        {t("productForm.primary")}
                      </Checkbox>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(index)}
                        className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          updateImage(index, "file", file);
                        }
                      }}
                      className="text-sm border border-black/5 dark:border-gray-800 py-2 px-3 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                    />
                    <input
                      type="text"
                      placeholder={t("productForm.orEnterImageUrl")}
                      value={img.url || ""}
                      onChange={(e) => updateImage(index, "url", e.target.value)}
                      className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder={t("productForm.altTextPlaceholder")}
                    value={img.alt || ""}
                    onChange={(e) => updateImage(index, "alt", e.target.value)}
                    className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                  />
                  {img.file && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(img.file)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}
                  {img.url && !img.file && (
                    <div className="mt-2">
                      <img
                        src={img.url}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {imageFiles.length === 0 && (
                <p className="text-sm text-black/50 dark:text-white/50 text-center py-4">
                  {t("common.noImagesAdded")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("productForm.categoryClassification")}
            </h3>
          </div>
          <Dropdown
            name={t("products.category")}
            options={categoryOptions}
            setSelectedOption={setCategoryOption}
            className="py-2"
          >
            {categoryOption?.label || (
              <span className="text-black/50 dark:text-white/50">{t("productForm.selectCategory")}</span>
            )}
          </Dropdown>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
          <Checkbox
            name="saveAsDraft"
            value={saveAsDraft}
            setValue={setSaveAsDraft}
          >
            {t("common.saveDraft")}
          </Checkbox>
          <div className="flex gap-3">
            <Button variant="ghost" type="button" className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700" onClick={() => navigate("/products")}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isCreating || isUploading} className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white">
              {isCreating || isUploading ? (saveAsDraft ? t("common.saving") : t("common.creating")) : (saveAsDraft ? t("common.saveDraft") : t("common.create"))}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateProductPage;
