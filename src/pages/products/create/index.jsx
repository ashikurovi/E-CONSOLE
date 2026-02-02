import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  X,
  Plus,
  ChevronLeft,
  Save,
  RefreshCw,
  Clock,
  ImageIcon,
  CloudUpload,
  Info,
  DollarSign,
  Package,
  LayoutGrid,
  Hash,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import Dropdown from "@/components/dropdown/dropdown";
import { useCreateProductMutation } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import FileUpload from "@/components/input/FileUpload";
import DescriptionInputWithAI from "@/components/input/DescriptionInputWithAI";
import { useSelector } from "react-redux";

// ============= VALIDATION SCHEMA =============
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
    .test(
      "decimal-places",
      "Price can have at most 2 decimal places",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
    ),
  discountPrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Discount price must be a number")
    .positive("Discount price must be greater than 0")
    .test(
      "less-than-price",
      "Discount price must be less than regular price",
      function (value) {
        const { price } = this.parent;
        if (!value || !price) return true;
        return value < price;
      },
    )
    .test(
      "decimal-places",
      "Discount price can have at most 2 decimal places",
      (value) => {
        if (value === undefined || value === null) return true;
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
    ),
  stock: yup
    .number()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .typeError("Stock must be a number")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
});

// ============= PREMIUM FORM CARD COMPONENT =============
const PremiumCard = ({ children, className = "", hover = true }) => (
  <div
    className={`
      bg-white dark:bg-slate-900 
      rounded-2xl border border-slate-200 dark:border-slate-800
      shadow-sm dark:shadow-none
      overflow-hidden p-8 
      transition-all duration-300 ease-out
      ${hover ? "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

// ============= SECTION HEADER COMPONENT =============
const SectionHeader = ({ icon: Icon, title, description, badge }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2.5 bg-gradient-to-br from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 rounded-lg text-cyan-600 dark:text-cyan-400">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">
          {title}
        </h2>
        {badge && (
          <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
        {description}
      </p>
    )}
  </div>
);

// ============= FORM INPUT WRAPPER COMPONENT =============
const FormInput = ({
  label,
  icon: Icon,
  error,
  required,
  hint,
  children,
  className = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className="block">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      </label>
    )}
    {children}
    {hint && !error && (
      <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

// ============= IMAGE CARD COMPONENT =============
const ImageCard = ({
  index,
  image,
  onUpdateImage,
  onRemoveImage,
  onSetPrimary,
}) => {
  const [imageError, setImageError] = useState(false);
  const previewUrl = image.file ? URL.createObjectURL(image.file) : image.url;

  return (
    <div className="border border-slate-200 dark:border-slate-800 p-5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
              Image {index + 1}
            </span>
            {image.file && (
              <p className="text-xs text-slate-500 mt-1">{image.file.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            name={`primary_${index}`}
            value={image.isPrimary}
            setValue={() => onSetPrimary(index)}
          >
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Primary
            </span>
          </Checkbox>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              onRemoveImage(index);
              if (image.file) {
                URL.revokeObjectURL(previewUrl);
              }
            }}
            className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload */}
        <FormInput label="File Upload" hint="JPG, PNG, WebP (Max 5MB)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("File size must be less than 5MB");
                  return;
                }
                onUpdateImage(index, "file", file);
                setImageError(false);
              }
            }}
            className="block w-full text-sm text-slate-500 dark:text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gradient-to-r file:from-cyan-50 file:to-indigo-50 
                  file:text-cyan-700
                  dark:file:bg-gradient-to-r dark:file:from-cyan-900/20 dark:file:to-indigo-900/20 
                  dark:file:text-cyan-400
                  hover:file:bg-gradient-to-r hover:file:from-cyan-100 hover:file:to-indigo-100
                  transition-all duration-200 cursor-pointer"
          />
        </FormInput>

        {/* URL Input */}
        <FormInput label="Or Image URL" hint="Enter external image URL">
          <input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={image.url || ""}
            onChange={(e) => {
              onUpdateImage(index, "url", e.target.value);
              setImageError(false);
            }}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 dark:focus:border-cyan-500 outline-none text-sm transition-all duration-200 placeholder:text-slate-400"
          />
        </FormInput>
      </div>

      {/* Image Preview */}
      {previewUrl && !imageError && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
          <img
            src={previewUrl}
            alt={`Preview ${index + 1}`}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-lg">
            <p className="text-xs text-white font-medium">Preview</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============= MAIN COMPONENT =============
function CreateProductPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: categories = [] } = useGetCategoriesQuery({
    companyId: user?.companyId,
  });

  const [categoryOption, setCategoryOption] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const { uploadImage, isUploading } = useImageUpload();

  const categoryOptions = useMemo(
    () => categories.map((cat) => ({ label: cat.name, value: cat.id })),
    [categories],
  );

  // ============= CALCULATED FIELDS =============
  const watchedName = watch("name");
  const watchedPrice = watch("price");
  const watchedDiscountPrice = watch("discountPrice");

  const discountPercentage = useMemo(() => {
    if (!watchedPrice || !watchedDiscountPrice) return null;
    return Math.round(
      ((watchedPrice - watchedDiscountPrice) / watchedPrice) * 100,
    );
  }, [watchedPrice, watchedDiscountPrice]);

  const savings = useMemo(() => {
    if (!watchedPrice || !watchedDiscountPrice) return null;
    return (watchedPrice - watchedDiscountPrice).toFixed(2);
  }, [watchedPrice, watchedDiscountPrice]);

  // ============= FORM PROGRESS CALCULATION =============
  useEffect(() => {
    const fields = [
      watchedName,
      categoryOption,
      watchedPrice,
      thumbnailFile,
      imageFiles.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    setFormProgress(Math.round((filledFields / fields.length) * 100));
  }, [watchedName, categoryOption, watchedPrice, thumbnailFile, imageFiles]);

  // ============= MEMOIZED CALLBACKS =============
  const addImage = useCallback(() => {
    setImageFiles((prev) => [
      ...prev,
      { url: "", alt: "", isPrimary: prev.length === 0, file: null },
    ]);
  }, []);

  const removeImage = useCallback((index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateImage = useCallback((index, field, value) => {
    setImageFiles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, []);

  const setPrimaryImage = useCallback((index) => {
    setImageFiles((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index })),
    );
  }, []);

  // ============= SUBMIT HANDLER =============
  const onSubmit = useCallback(
    async (data) => {
      try {
        // Upload thumbnail
        let thumbnailUrl = null;
        if (thumbnailFile) {
          try {
            thumbnailUrl = await uploadImage(thumbnailFile);
            if (!thumbnailUrl) {
              toast.error(t("productForm.failedUploadThumbnail"));
              return;
            }
          } catch (error) {
            console.error("Thumbnail upload error:", error);
            toast.error(t("productForm.failedUploadThumbnail"));
            return;
          }
        }

        // Upload gallery images
        const uploadedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
          const img = imageFiles[i];
          if (img.file) {
            try {
              const url = await uploadImage(img.file);
              if (url) {
                uploadedImages.push({
                  url,
                  alt: img.alt || `Product image ${i + 1}`,
                  isPrimary: img.isPrimary || false,
                });
              }
            } catch (error) {
              toast.error(`Failed to upload image ${i + 1}`);
              console.error(`Image ${i + 1} upload error:`, error);
            }
          } else if (img.url) {
            uploadedImages.push({
              url: img.url,
              alt: img.alt || `Product image ${i + 1}`,
              isPrimary: img.isPrimary || false,
            });
          }
        }

        // Ensure at least one primary image
        if (
          uploadedImages.length > 0 &&
          !uploadedImages.some((img) => img.isPrimary)
        ) {
          uploadedImages[0].isPrimary = true;
        }

        // Build payload
        const payload = {
          name: data.name.trim(),
          price: parseFloat(data.price) || 0,
          discountPrice: data.discountPrice
            ? parseFloat(data.discountPrice)
            : null,
          description: data.description?.trim() || "",
          images: uploadedImages,
          thumbnail: thumbnailUrl || null,
          categoryId: categoryOption?.value || null,
          status: saveAsDraft ? "draft" : "published",
          stock: data.stock ? parseInt(data.stock) : 0,
        };

        // Create product
        const params = { companyId: user.companyId };
        const res = await createProduct({ body: payload, params });

        if (res?.data) {
          toast.success(
            saveAsDraft
              ? t("productForm.productSavedAsDraft")
              : t("productForm.productCreated"),
          );
          reset();
          setCategoryOption(null);
          setThumbnailFile(null);
          setImageFiles([]);
          setSaveAsDraft(false);
          setFormProgress(0);
          navigate("/products");
        } else {
          toast.error(
            res?.error?.data?.message || t("productForm.productCreateFailed"),
          );
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast.error("An unexpected error occurred. Please try again.");
      }
    },
    [
      thumbnailFile,
      imageFiles,
      uploadImage,
      createProduct,
      user,
      navigate,
      saveAsDraft,
      t,
      reset,
    ],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top Progress Bar */}
      {isDirty && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-800 z-40">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${formProgress}%` }}
          />
        </div>
      )}

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto pt-8 lg:pt-14">
        {/* ============= HEADER SECTION ============= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div className="flex-1">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="pl-0 hover:bg-transparent text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors mb-4 group"
            >
              <ChevronLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Products
            </Button>

            <div className="mb-4">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-slate-50 mb-2">
                Create{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600">
                  Product
                </span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Add a new product to your inventory
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-slate-600 dark:text-slate-400">
                  {format(new Date(), "EEEE, MMMM dd, yyyy")}
                </span>
              </div>
              {formProgress > 0 && (
                <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                    {formProgress}% complete
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              type="button"
              onClick={() => {
                setSaveAsDraft(true);
                handleSubmit(onSubmit)();
              }}
              disabled={isCreating || isUploading}
              className="flex-1 lg:flex-none h-12 px-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isCreating || isUploading || !isValid}
              className="flex-1 lg:flex-none h-12 px-8 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform hover:-translate-y-0.5"
            >
              {isCreating || isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
          </div>
        </div>

        {/* ============= MAIN FORM ============= */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* LEFT COLUMN: Media & Description */}
          <div className="xl:col-span-2 space-y-8">
            {/* MEDIA SECTION */}
            <PremiumCard>
              <SectionHeader
                icon={ImageIcon}
                title="Media"
                description="Upload product images and thumbnail"
              />

              <div className="space-y-8">
                {/* Thumbnail */}
                <div className="space-y-4">
                  <FormInput
                    label="Thumbnail Image"
                    icon={CloudUpload}
                    required
                  >
                    <div className="relative group">
                      <FileUpload
                        placeholder={t("productForm.chooseThumbnail")}
                        label=""
                        register={register}
                        name="thumbnail"
                        accept="image/*"
                        onChange={setThumbnailFile}
                        value={thumbnailFile}
                        className="w-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors"
                      />
                    </div>
                    {thumbnailFile && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {thumbnailFile.name}
                      </div>
                    )}
                  </FormInput>
                </div>

                {/* Gallery Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                      Gallery Images
                    </span>
                  </div>
                </div>

                {/* Add Image Button */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Add up to 10 images to showcase your product
                  </p>
                  <Button
                    type="button"
                    onClick={addImage}
                    disabled={imageFiles.length >= 10}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 border border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:from-cyan-100 hover:to-indigo-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    Add Image{" "}
                    {imageFiles.length > 0 && `(${imageFiles.length}/10)`}
                  </Button>
                </div>

                {/* Images Grid */}
                <div className="space-y-4">
                  {imageFiles.map((img, index) => (
                    <ImageCard
                      key={index}
                      index={index}
                      image={img}
                      onUpdateImage={updateImage}
                      onRemoveImage={removeImage}
                      onSetPrimary={setPrimaryImage}
                    />
                  ))}

                  {/* Empty State */}
                  {imageFiles.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-50 to-indigo-50 dark:from-cyan-900/20 dark:to-indigo-900/20 text-cyan-500 dark:text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                        No gallery images yet
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Click "Add Image" to start uploading
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </PremiumCard>

            {/* DESCRIPTION SECTION */}
            <PremiumCard>
              <SectionHeader
                icon={Info}
                title="Description"
                description="Add detailed product information with AI assistance"
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <DescriptionInputWithAI
                    {...field}
                    label=""
                    placeholder={t("productForm.descriptionPlaceholder")}
                    rows={6}
                    error={errors.description?.message}
                    type="product"
                    title={watchedName}
                  />
                )}
              />
            </PremiumCard>
          </div>

          {/* RIGHT COLUMN: Details & Pricing */}
          <div className="space-y-8">
            {/* STICKY CARD */}
            <PremiumCard hover={false} className="sticky top-6 h-fit">
              {/* Product Name */}
              <FormInput
                label="Product Name"
                required
                error={errors.name?.message}
                className="mb-6"
              >
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 dark:focus:border-cyan-500 outline-none font-semibold transition-all duration-200 placeholder:text-slate-400"
                  placeholder="e.g. Wireless Headphones Pro"
                />
              </FormInput>

              {/* Category */}
              <FormInput label="Category" className="mb-6">
                <Dropdown
                  name={t("products.category")}
                  options={categoryOptions}
                  setSelectedOption={setCategoryOption}
                  className="w-full"
                  triggerClassName="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 dark:focus:border-cyan-500 outline-none font-semibold text-left flex justify-between items-center transition-all duration-200"
                >
                  {categoryOption?.label || (
                    <span className="text-slate-400">Select Category</span>
                  )}
                </Dropdown>
              </FormInput>

              {/* Price Section */}
              <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <FormInput
                  label="Regular Price"
                  icon={DollarSign}
                  required
                  error={errors.price?.message}
                  className="mb-4"
                >
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
                      $
                    </span>
                    <input
                      {...register("price")}
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-semibold text-slate-900 dark:text-slate-50 focus:border-cyan-600 dark:focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-200 placeholder:text-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                </FormInput>

                {/* Discount Price */}
                <FormInput
                  label="Discount Price"
                  icon={DollarSign}
                  error={errors.discountPrice?.message}
                >
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
                      $
                    </span>
                    <input
                      {...register("discountPrice")}
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 dark:focus:border-cyan-500 outline-none font-semibold transition-all duration-200 placeholder:text-slate-400"
                      placeholder="0.00"
                    />
                  </div>
                </FormInput>

                {/* Discount Badge */}
                {discountPercentage && savings && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Save ${savings}
                      </span>
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                        {discountPercentage}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stock */}
              <FormInput
                label="Initial Stock"
                icon={Package}
                error={errors.stock?.message}
              >
                <div className="relative group">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors" />
                  <input
                    {...register("stock")}
                    type="number"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-600 dark:focus:border-cyan-500 outline-none font-semibold transition-all duration-200 placeholder:text-slate-400"
                    placeholder="0"
                  />
                </div>
              </FormInput>
            </PremiumCard>

            {/* Form Status Card */}
            {isDirty && (
              <PremiumCard className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-300">
                      Unsaved changes
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      You have made changes. Click "Create Product" or "Save
                      Draft" to save.
                    </p>
                  </div>
                </div>
              </PremiumCard>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductPage;
