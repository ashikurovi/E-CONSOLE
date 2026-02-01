import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Save, 
  X, 
  Plus, 
  Image as ImageIcon, 
  RefreshCw, 
  Calendar as CalendarIcon,
  CloudUpload,
  Info,
  DollarSign,
  Package,
  Clock,
  LayoutGrid,
  Hash,
  Monitor,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdateProductMutation, useGetProductsQuery, useGetDraftProductsQuery } from "@/features/product/productApiSlice";
import { useGetCategoriesQuery } from "@/features/category/categoryApiSlice";
import useImageUpload from "@/hooks/useImageUpload";
import { useSelector } from "react-redux";
import { format } from "date-fns";

// Yup validation schema for the redesigned product form
const productEditSchema = yup.object().shape({
  name: yup.string().required("Product name is required").min(2).max(200).trim(),
  description: yup.string().max(2000).trim(),
  price: yup.number().typeError("Price must be a number").required("Price is required").positive(),
  discountPrice: yup.number().nullable().transform((v, o) => o === "" ? null : v).typeError("Discount price must be a number").positive().lessThan(yup.ref('price'), "Discount must be less than price"),
  stock: yup.number().nullable().transform((v, o) => o === "" ? null : v).typeError("Stock must be a number").min(0).integer(),
  sku: yup.string().nullable().trim(),
});

/**
 * ProductEditPage Component - Redesigned
 * Provides a high-fidelity two-column editor for products.
 */
export default function ProductEditPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // 🔹 API State
  const { data: publishedProducts = [] } = useGetProductsQuery({ companyId: user?.companyId });
  const { data: draftProducts = [] } = useGetDraftProductsQuery({ companyId: user?.companyId });
  const { data: categories = [] } = useGetCategoriesQuery({ companyId: user?.companyId });
  
  const product = useMemo(() => 
    [...publishedProducts, ...draftProducts].find((p) => p.id === parseInt(id)),
  [publishedProducts, draftProducts, id]);

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { uploadImage, isUploading } = useImageUpload();

  // 🔹 Form State
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("In Stock");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState(["Visa", "Mastercard"]);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: yupResolver(productEditSchema),
    mode: "onChange"
  });

  // Initialize form with product data
  useEffect(() => {
    if (product) {
       setValue("name", product.name || product.title || "");
       setValue("price", product.price || "");
       setValue("discountPrice", product.discountPrice || "");
       setValue("description", product.description || "");
       setValue("stock", product.stock || 0);
       setValue("sku", product.sku || `SKU-${Math.floor(Math.random() * 90000)}`);
       
       setThumbnailPreview(product.thumbnail);
       if (product.images) {
          setGalleryImages(product.images.map(img => ({ url: img.url, file: null, isPrimary: img.isPrimary })));
       }
       
       if (product.category || product.categoryId) {
          const catId = product.category?.id || product.categoryId;
          const found = categories.find(c => c.id === catId);
          if (found) setSelectedCategory({ label: found.name, value: found.id });
       }
    }
  }, [product, categories, setValue]);

  /**
   * Handle image upload for gallery slots
   */
  const handleGalleryUpload = (index, file) => {
    const newImages = [...galleryImages];
    const previewUrl = URL.createObjectURL(file);
    newImages[index] = { file, url: previewUrl, isPrimary: false };
    setGalleryImages(newImages);
  };

  /**
   * Form submission logic
   */
  const onSubmit = async (data, status = "published") => {
    if (!product) return;

    try {
      let finalThumbnail = thumbnailPreview;
      if (thumbnailFile) {
        finalThumbnail = await uploadImage(thumbnailFile);
      }

      const uploadedGallery = [];
      for (const img of galleryImages) {
        if (img.file) {
          const url = await uploadImage(img.file);
          if (url) uploadedGallery.push({ url, isPrimary: img.isPrimary });
        } else if (img.url) {
          uploadedGallery.push({ url: img.url, isPrimary: img.isPrimary });
        }
      }

      const payload = {
        ...data,
        thumbnail: finalThumbnail,
        images: uploadedGallery,
        categoryId: selectedCategory?.value,
        status: status === "published" ? "published" : "draft",
        companyId: user?.companyId
      };

      await updateProduct({ id: product.id, body: payload, params: { companyId: user?.companyId } }).unwrap();
      toast.success(status === "published" ? "Product published!" : "Saved to drafts!");
      navigate("/products");
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  if (!product) return <div className="p-10 text-center">Loading product context...</div>;

  return (
    <div className="p-6 lg:p-10 bg-gray-50/50 dark:bg-[#0b0f14] min-h-screen">
      {/* 🔹 Dashboard Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button 
               variant="ghost" 
               size="icon" 
               onClick={() => navigate(-1)}
               className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Product Editor</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium ml-12">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
               <RefreshCw className="w-4 h-4" /> Data Refreshed
            </span>
            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 py-1 px-3 rounded-full">
               <Clock className="w-4 h-4" /> {format(new Date(), "MMMM dd, yyyy hh:mm a")}
            </span>
          </div>
        </div>
        
        {/* 🔹 Filter Tabs Style */}
        <div className="bg-white dark:bg-[#1a1f26] p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-1">
           {['All', 'Published', 'Drafts', 'Trash'].map((tab) => (
              <button 
                key={tab}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                  tab === 'All' 
                  ? "bg-[#7c3aed] text-white shadow-md shadow-purple-500/20" 
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
           ))}
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => onSubmit(d))} className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-[1600px] mx-auto">
        
        {/* 🔹 LEFT COLUMN: Media & Attributes (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
           <div className="bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
              <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-[#7c3aed]" /> Product Settings
                 </h2>
              </div>
              
              <div className="p-8 space-y-10">
                 {/* Image Gallery Slots */}
                 <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Product Images</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {/* Main Preview / Slot 1 */}
                       <div className="md:col-span-1 aspect-square relative group rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:border-[#7c3aed]/50 overflow-hidden">
                          {thumbnailPreview ? (
                             <>
                               <img src={thumbnailPreview} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                               <button 
                                 type="button"
                                 onClick={() => setThumbnailPreview(null)}
                                 className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                               >
                                  <X className="w-4 h-4" />
                               </button>
                             </>
                          ) : (
                             <div className="flex flex-col items-center gap-3">
                                <CloudUpload className="w-10 h-10 text-gray-300" />
                                <span className="text-xs font-bold text-[#7c3aed]">Browse Image</span>
                             </div>
                          )}
                          <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                   setThumbnailFile(file);
                                   setThumbnailPreview(URL.createObjectURL(file));
                                }
                             }}
                          />
                       </div>

                       {/* Mini Slots 2 & 3 */}
                       <div className="md:col-span-2 grid grid-cols-2 gap-6">
                          {[0, 1].map((idx) => (
                             <div key={idx} className="aspect-[4/3] relative rounded-2xl bg-gray-50 dark:bg-black/20 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-2 hover:border-[#7c3aed]/50 transition-all overflow-hidden group">
                                {galleryImages[idx] ? (
                                   <img src={galleryImages[idx].url} className="w-full h-full object-cover rounded-xl" alt="Secondary" />
                                ) : (
                                   <div className="flex flex-col items-center gap-2">
                                      <ImageIcon className="w-6 h-6 text-gray-300" />
                                      <span className="text-[10px] font-bold text-[#7c3aed]">Browse Image</span>
                                   </div>
                                )}
                                <input 
                                   type="file" 
                                   className="absolute inset-0 opacity-0 cursor-pointer"
                                   onChange={(e) => handleGalleryUpload(idx, e.target.files[0])}
                                />
                             </div>
                          ))}
                          {/* More Gallery Link */}
                          <div className="col-span-2 flex flex-col gap-2">
                             <span className="text-sm font-bold text-[#3b82f6] cursor-pointer hover:underline flex items-center gap-2">
                                More Gallery Options
                             </span>
                             <p className="text-xs text-gray-400 leading-relaxed italic">
                                Donec luctus metus nec enim imperdiet, in dignissim risus fringilla. Fusce bibendum vulputate scelerisque.
                             </p>
                             <span className="text-xs font-bold text-[#7c3aed] flex items-center gap-1.5 cursor-pointer mt-2">
                                <Hash className="w-3 h-3" /> Attachement files (1)
                             </span>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Attributes Row */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">Attributes</label>
                       <select className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all font-medium">
                          <option>Simpla</option>
                          <option>Variable</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">L * W * H, inches</label>
                       <input 
                         placeholder="e.g. 146.7 * 71.5 * 7.4" 
                         className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all font-bold placeholder:font-normal"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">Weight, kg</label>
                       <input 
                         placeholder="0,200" 
                         className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all font-bold placeholder:font-normal"
                       />
                    </div>
                 </div>

                 {/* Description */}
                 <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Description</label>
                    <textarea 
                      {...register("description")}
                      className="w-full h-40 px-6 py-5 rounded-3xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all resize-none text-gray-600 dark:text-gray-400 font-medium leading-relaxed"
                      placeholder="Enter product details..."
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* 🔹 RIGHT COLUMN: Details & Pricing (1/3 width) */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-8 space-y-8">
              
              {/* Basic Fields */}
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Product Name</label>
                    <input 
                      {...register("name")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none font-bold"
                    />
                    {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Brand Name</label>
                       <select className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-medium">
                          <option>Astro Retail</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Category</label>
                       <select 
                         className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-medium"
                         value={selectedCategory?.value}
                         onChange={(e) => setSelectedCategory({ value: e.target.value })}
                       >
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Regular Price</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input 
                            {...register("price")}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-blue-500/30 bg-blue-50/5 dark:bg-blue-500/5 outline-none font-bold text-blue-600 dark:text-blue-400"
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sale Price</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                          <input 
                            {...register("discountPrice")}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-bold"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Schedule
                       </label>
                       <div className="relative">
                          <input readOnly value="08/12/2023 - 08/24/2023" className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none text-[10px] font-bold text-blue-600" />
                          <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Date</label>
                       <select className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-medium text-xs">
                          <option>08/23/2023</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Product type</label>
                       <select className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-medium text-xs">
                          <option>Simple</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Stock status</label>
                       <select 
                         className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-medium text-xs"
                         value={selectedStatus}
                         onChange={(e) => setSelectedStatus(e.target.value)}
                       >
                          <option>In Stock</option>
                          <option>Out of Stock</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SKU</label>
                    <input 
                      {...register("sku")}
                      className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-black/10 focus:ring-2 focus:ring-[#7c3aed]/20 outline-none font-bold"
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-2">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Stock Status</label>
                       <select className="w-full px-2 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-bold text-[10px]">
                          <option>In Stock</option>
                       </select>
                    </div>
                    <div className="col-span-1 space-y-2">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Quantity in stock</label>
                       <input 
                         {...register("stock")}
                         type="number" 
                         className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-bold text-xs"
                       />
                    </div>
                    <div className="col-span-1 space-y-2">
                       <label className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Units</label>
                       <select className="w-full px-2 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-black/20 outline-none font-bold text-[10px]">
                          <option>Pieces</option>
                       </select>
                    </div>
                 </div>

                 {/* Payment Methods Simulation */}
                 <div className="space-y-4 pt-4">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Payment Methods</label>
                    <div className="flex flex-wrap gap-2">
                       {['Mastercard', 'Visa', 'GPay', 'ApplePay', 'PayPal', 'BitPay'].map((method) => (
                          <div 
                            key={method}
                            onClick={() => {
                               if (selectedPaymentMethods.includes(method)) {
                                  setSelectedPaymentMethods(selectedPaymentMethods.filter(m => m !== method));
                               } else {
                                  setSelectedPaymentMethods([...selectedPaymentMethods, method]);
                               }
                            }}
                            className={`flex-1 min-w-[60px] p-2 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                              selectedPaymentMethods.includes(method) 
                              ? "border-[#7c3aed] bg-[#7c3aed]/5" 
                              : "border-gray-50 dark:border-white/5 opacity-50 grayscale"
                            }`}
                          >
                             <div className="w-8 h-5 rounded bg-gray-200 flex items-center justify-center text-[8px] font-bold">{method[0]}</div>
                             <div className={`w-3 h-3 rounded-full border-2 ${selectedPaymentMethods.includes(method) ? "bg-[#7c3aed] border-[#7c3aed]" : "border-gray-300"}`} />
                          </div>
                       ))}
                       <div className="w-12 h-16 rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center text-gray-300 cursor-pointer hover:border-gray-300 transition-all">
                          <Plus className="w-4 h-4" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* 🔹 ACTION TRAY */}
           <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button"
                onClick={() => onSubmit(product, "draft")}
                className="h-14 rounded-2xl bg-[#0066ff] hover:bg-[#0052cc] text-white font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                 {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                 Save to Drafts
              </Button>
              <Button 
                type="submit"
                disabled={isUpdating || isUploading}
                className="h-14 rounded-2xl bg-[#0ac9a3] hover:bg-[#09b692] text-white font-bold shadow-lg shadow-teal-500/20 transition-all"
              >
                 {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                 Publish Product
              </Button>
           </div>
        </div>
      </form>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[11px] text-gray-400 font-medium">
         <span>Copyright © 2025 Kanakku. All Rights Reserved</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <div className="w-6 h-6 bg-[#7c3aed] rounded flex items-center justify-center text-white font-black">S</div>
         </div>
      </footer>
    </div>
  );
}
