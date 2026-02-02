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
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
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
    .positive("Price must be greater than 0"),
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
      overflow-hidden p-6
      transition-all duration-300 ease-out
      ${hover ? "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

// ============= SECTION HEADER COMPONENT =============
const SectionHeader = ({ title, description, className = "" }) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-1">
      {title}
    </h2>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    )}
  </div>
);

// ============= FORM INPUT WRAPPER COMPONENT =============
const FormInput = ({
  label,
  error,
  required,
  hint,
  children,
  className = "",
  labelClassName = "",
}) => (
  <div className={`space-y-2 ${className}`}>
    {label && (
      <label className={`block ${labelClassName}`}>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      </label>
    )}
    {children}
    {hint && !error && (
      <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    )}
    {error && (
      <p className="text-xs text-red-500 font-medium flex items-center gap-1">
        <Info className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

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
  const [imageInputType, setImageInputType] = useState("file");
  const [sizes, setSizes] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSizeValue, setNewSizeValue] = useState("");
  const [variants, setVariants] = useState([]);
  const [isAddingVariant, setIsAddingVariant] = useState(false);
  const [newVariantName, setNewVariantName] = useState("");

  const handleAddVariant = () => {
    if (newVariantName.trim()) {
      setVariants([
        ...variants,
        { name: newVariantName.trim(), id: Date.now() },
      ]);
      setNewVariantName("");
      setIsAddingVariant(false);
    }
  };

  const removeVariant = (id) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

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

  const watchedName = watch("name");

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* ============= STATIC HEADER ============= */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/products")}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
            <div>
              <div className="text-xs text-slate-500">Back to product list</div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                Add New Product
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              View Shop
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 pt-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-12 gap-8"
        >
          {/* ============= LEFT COLUMN (8 cols) ============= */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            {/* 1. COVER IMAGE */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Cover Image
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Upload a cover image for your product. Recommended size
                  1200x300.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="w-full h-48 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 transition-colors group relative overflow-hidden">
                  {!thumbnailFile ? (
                    <>
                      <div className="w-12 h-12 mb-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center text-indigo-500">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-semibold text-indigo-600 mb-1">
                        Upload Cover Image
                      </h3>
                      <p className="text-xs text-slate-400">
                        Drag and drop or click to upload
                      </p>
                    </>
                  ) : (
                    <div className="absolute inset-0 w-full h-full group">
                      <img
                        src={URL.createObjectURL(thumbnailFile)}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                        }}
                        className="absolute top-4 right-4 p-2 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md hover:shadow-lg transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                        title="Remove image"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setThumbnailFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. PRODUCT IMAGES (Split Layout) */}
            <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  Product Images Variant{" "}
                  <Info className="w-4 h-4 text-slate-400" />
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Make your fashion products look more attractive with 3:4 size
                  photos.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setImageInputType("file")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${imageInputType === "file" ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputType("url")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${imageInputType === "url" ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200" : "text-slate-500 hover:bg-slate-50"}`}
                    >
                      Add from URL
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {/* Add Button */}
                    {imageInputType === "file" ? (
                      <div className="w-32 h-32 border-2 border-dashed border-indigo-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors relative shrink-0 group">
                        <div className="w-8 h-8 mb-2 text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-indigo-600">
                          Add Image
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files?.length) {
                              const newFiles = Array.from(e.target.files).map(
                                (file) => ({ file, isPrimary: false }),
                              );
                              setImageFiles((prev) => [...prev, ...newFiles]);
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="w-full flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL..."
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && e.target.value) {
                              e.preventDefault();
                              setImageFiles((prev) => [
                                ...prev,
                                { url: e.target.value, isPrimary: false },
                              ]);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Image List */}
                    {imageFiles.map(
                      (img, i) =>
                        (img.file || img.url) && (
                          <div
                            key={i}
                            className="w-32 h-32 bg-slate-100 rounded-xl relative group overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0"
                          >
                            <img
                              src={
                                img.file
                                  ? URL.createObjectURL(img.file)
                                  : img.url
                              }
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="p-2 bg-white text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. PRODUCT NAME */}
            <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Product Name<span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Add product title that buyers would likely use to search.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <input
                  {...register("name")}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-medium transition-all"
                  placeholder="Skechers Men's Go Max-Athletic Air Mesh Slip on Walking Shoe..."
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* 5. CATEGORY */}
            <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Category<span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Choose the category and sub-category most suitable for the
                  product.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="relative">
                    <Dropdown
                      name="Category"
                      options={categoryOptions}
                      setSelectedOption={setCategoryOption}
                      className="w-full"
                      triggerClassName="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:border-indigo-600 outline-none font-medium text-left flex justify-between items-center text-sm"
                    >
                      {categoryOption?.label || "Fashion"}
                    </Dropdown>
                  </div>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-medium flex justify-between items-center text-sm">
                    Clothes & Shoes
                    <ChevronLeft className="w-4 h-4 rotate-270 text-slate-400" />
                  </div>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-medium flex justify-between items-center text-sm">
                    Men's Shoes
                    <ChevronLeft className="w-4 h-4 rotate-270 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* 6. SIZE VARIANT */}
            <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Size Variant<span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Choose the size variants for the product.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        if (selectedSizes.includes(size)) {
                          setSelectedSizes(
                            selectedSizes.filter((s) => s !== size),
                          );
                        } else {
                          setSelectedSizes([...selectedSizes, size]);
                        }
                      }}
                      className={`min-w-[48px] h-12 px-2 rounded-xl flex items-center justify-center font-medium transition-all border text-sm ${
                        selectedSizes.includes(size)
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20"
                          : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsAddingSize(true)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-medium bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {isAddingSize && (
                  <div className="mt-3 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter size..."
                      className="w-24 px-3 py-2 rounded-lg border-2 border-indigo-600 text-center font-medium outline-none bg-white dark:bg-slate-900 text-slate-900 text-sm"
                      value={newSizeValue}
                      onChange={(e) => setNewSizeValue(e.target.value)}
                      onBlur={() => {
                        if (
                          newSizeValue.trim() &&
                          !sizes.includes(newSizeValue.trim())
                        ) {
                          setSizes([...sizes, newSizeValue.trim()]);
                          setSelectedSizes([
                            ...selectedSizes,
                            newSizeValue.trim(),
                          ]);
                        }
                        setNewSizeValue("");
                        setIsAddingSize(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.target.blur();
                        } else if (e.key === "Escape") {
                          setNewSizeValue("");
                          setIsAddingSize(false);
                        }
                      }}
                    />
                    <span className="text-xs text-slate-400">
                      Press Enter to add
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 7. PRODUCT VARIANT */}
            <div className="grid grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="col-span-12 lg:col-span-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  Product Variant<span className="text-red-500">*</span>
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Add variants like color, material, or style.
                </p>
              </div>
              <div className="col-span-12 lg:col-span-8">
                <div className="space-y-3 grid grid-cols-2 gap-5">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group hover:border-indigo-300 transition-all duration-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-500 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          defaultValue={variant.name}
                          placeholder="Variant Name"
                          className="w-full bg-transparent border-none outline-none font-medium text-slate-900 dark:text-slate-50 placeholder-slate-400 text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  {isAddingVariant ? (
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-indigo-600 shadow-md animate-in fade-in zoom-in-95 duration-200">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        placeholder="Variant name (e.g. Green)"
                        className="flex-1 bg-transparent border-none outline-none font-medium text-slate-900 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddVariant();
                          } else if (e.key === "Escape") {
                            setNewVariantName("");
                            setIsAddingVariant(false);
                          }
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddVariant}
                          className="h-8 px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold shadow-sm shadow-indigo-200"
                        >
                          Add
                        </Button>
                        <button
                          type="button"
                          onClick={() => setIsAddingVariant(false)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingVariant(true)}
                      className="px-5 py-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-2 w-fit"
                    >
                      <Plus className="w-4 h-4" />
                      Add new variant
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* KEEPING DESCRIPTION BELOW (Optional) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <DescriptionInputWithAI
                    {...field}
                    label="Business Description"
                    placeholder={t("productForm.descriptionPlaceholder")}
                    rows={6}
                    error={errors.description?.message}
                    type="product"
                    title={watchedName}
                  />
                )}
              />
            </div>
          </div>

          {/* ============= RIGHT COLUMN (4 cols) ============= */}
          <div className="col-span-12 lg:col-span-4 space-y-6 sticky top-24 h-fit">
            {/* 2. SHIPPING DELIVERY (Visual) */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
                Shipping and Delivery
              </h3>
              <PremiumCard>
                <div className="space-y-4">
                  <FormInput label="Items Weight">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="12.00"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-medium"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                        kg <ChevronLeft className="inline w-3 h-3 rotate-270" />
                      </span>
                    </div>
                  </FormInput>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Package Size(The package you use to ship your product)
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Length
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="12.00"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-center font-medium"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            in
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">
                          Breadth
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="12.00"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-center font-medium"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            in
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Width</div>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="12.00"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-center font-medium"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                            in
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </PremiumCard>
            </div>

            {/* 3. PRICING SECTION */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-4">
                Pricing
              </h3>
              <PremiumCard>
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Price" error={errors.price?.message}>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                        $
                      </span>
                      <input
                        {...register("price")}
                        type="number"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none font-medium transition-all duration-200"
                        placeholder="180.00"
                      />
                    </div>
                  </FormInput>
                  <FormInput label="Compare at Price" hint="">
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 outline-none font-medium transition-all duration-200"
                        placeholder="320.00"
                      />
                      <Info className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </FormInput>
                </div>
              </PremiumCard>
            </div>

            {/* 4. ACTIONS */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/products")}
                className="flex-1 border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold h-12 rounded-xl"
              >
                Discard
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-semibold h-12 rounded-xl"
                onClick={() => {
                  setSaveAsDraft(true);
                  handleSubmit(onSubmit)();
                }}
              >
                Schedule
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isCreating || isUploading || !isValid}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
              >
                {isCreating || isUploading ? "Creating..." : "Add Product"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductPage;
