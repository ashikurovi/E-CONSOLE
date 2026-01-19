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
import { useCreateProductMutation } from "@/features/product/productApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import FileUpload from "@/components/input/FileUpload";
import { X, Plus } from "lucide-react";
import { useSelector } from "react-redux";

function ProductForm({ categoryOptions = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryOption, setCategoryOption] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const { uploadImage, isUploading } = useImageUpload();
  const { user } = useSelector((state) => state.auth);
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
      thumbnailUrl = await uploadImage(thumbnailFile);
      if (!thumbnailUrl) {
        toast.error("Failed to upload thumbnail");
        return;
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
      sku: data.sku,
      price: parseFloat(data.price) || 0,
      discountPrice: data.discountPrice ? parseFloat(data.discountPrice) : null,
      description: data.description || "",
      images: uploadedImages,
      thumbnail: thumbnailUrl || null,
      category: categoryOption?.value || null,
    };

    const params = { companyId: user.companyId };
    const res = await createProduct({ body: payload, params });
    if (res?.data) {
      toast.success("Product created");
      reset();
      setCategoryOption(null);
      setThumbnailFile(null);
      setImageFiles([]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Product</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Basic Information
              </h3>
            </div>
            <TextField label="Product Name *" placeholder="Enter product name" register={register} name="name" required />
            <TextField label="SKU" placeholder="Enter SKU (optional)" register={register} name="sku" />
            <TextField 
              label="Description"
              placeholder="Enter product description"
              register={register}
              name="description"
              multiline
              rows={4}
            />
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Pricing
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Price *" placeholder="0.00" register={register} name="price" type="number" step="0.01" required />
              <TextField label="Discount Price" placeholder="0.00 (optional)" register={register} name="discountPrice" type="number" step="0.01" />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Product Images
              </h3>
            </div>
            <FileUpload
              placeholder="Choose thumbnail (optional)"
              label="Thumbnail"
              register={register}
              name="thumbnail"
              accept="image/*"
              onChange={setThumbnailFile}
              value={thumbnailFile}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-black/50 dark:text-white/50 text-sm ml-1">Gallery Images</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Image
                </Button>
              </div>
              <div className="space-y-3">
                {imageFiles.map((img, index) => (
                  <div key={index} className="border border-black/5 dark:border-white/10 p-3 rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-black/70 dark:text-white/70">
                        Image {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          name={`primary_${index}`}
                          value={img.isPrimary}
                          setValue={() => setPrimaryImage(index)}
                        >
                          Primary
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
                        className="text-sm border border-black/5 dark:border-white/10 py-2 px-3 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                      />
                      <input
                        type="text"
                        placeholder="Or enter image URL"
                        value={img.url || ""}
                        onChange={(e) => updateImage(index, "url", e.target.value)}
                        className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Alt text (optional)"
                      value={img.alt || ""}
                      onChange={(e) => updateImage(index, "alt", e.target.value)}
                      className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90"
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
                    No images added. Click "Add Image" to add product images.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Category & Classification
              </h3>
            </div>
            <Dropdown
              name="Category"
              options={categoryOptions}
              setSelectedOption={setCategoryOption}
              className="py-2"
            >
              {categoryOption?.label || (
                <span className="text-black/50 dark:text-white/50">Select Category</span>
              )}
            </Dropdown>
          </div>

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
              {isCreating || isUploading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ProductForm;