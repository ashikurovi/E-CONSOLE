import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useGetProductQuery } from "@/features/product/productApiSlice";
import { useSelector } from "react-redux";

const ProductViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: product, isLoading } = useGetProductQuery(parseInt(id));

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-black/60 dark:text-white/60">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
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
            <h1 className="text-2xl font-semibold">Product Not Found</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              The product you're looking for doesn't exist
            </p>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const otherImages = product.images?.filter((img) => !img.isPrimary) || [];

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
            className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Product Details</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              View complete product information
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/products/${id}/edit`)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Product
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Basic Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Name</label>
              <p className="text-base text-black dark:text-white mt-1">{product.name || product.title || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">SKU</label>
              <p className="text-base text-black dark:text-white mt-1">{product.sku || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Category</label>
              <p className="text-base text-black dark:text-white mt-1">
                {product.category?.name || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Status</label>
              <p className="text-base text-black dark:text-white mt-1">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    product.status === 'published' && product.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : product.status === 'draft'
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : product.status === 'trashed'
                      ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }`}
                >
                  {product.status === 'draft' ? 'Draft' : 
                   product.status === 'trashed' ? 'Trashed' : 
                   product.isActive ? "Active" : "Disabled"}
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">
                Description
              </label>
              <p className="text-base text-black dark:text-white mt-1 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Pricing
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">Price</label>
              <p className="text-base text-black dark:text-white mt-1">
                {typeof product.price === "number"
                  ? `$${product.price.toFixed(2)}`
                  : product.price || "-"}
              </p>
            </div>
            {product.discountPrice && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  Discount Price
                </label>
                <p className="text-base text-green-600 dark:text-green-400 mt-1 font-semibold">
                  ${typeof product.discountPrice === "number"
                    ? product.discountPrice.toFixed(2)
                    : product.discountPrice}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Inventory
            </h3>
          </div>
          <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Metric</th>
                  <th className="px-4 py-3 text-left font-medium">Value</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">Current Stock</td>
                  <td className={`px-4 py-3 font-semibold ${
                    (product.stock ?? 0) <= 5 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-black dark:text-white"
                  }`}>
                    {product.stock ?? 0} units
                  </td>
                  <td className="px-4 py-3">
                    {(product.stock ?? 0) <= 5 ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded">
                        Low Stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded">
                        In Stock
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">Sold</td>
                  <td className="px-4 py-3 text-black dark:text-white">{product.sold ?? 0} units</td>
                  <td className="px-4 py-3">-</td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">Total Income</td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                    ${typeof product.totalIncome === "number"
                      ? product.totalIncome.toFixed(2)
                      : (product.totalIncome ?? "0.00")}
                  </td>
                  <td className="px-4 py-3">-</td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">Stock Status</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        product.isLowStock
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      }`}
                    >
                      {product.isLowStock ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-4 py-3">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Images & Media Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              Images & Media
            </h3>
          </div>

          {/* Thumbnail */}
          {product.thumbnail && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Thumbnail
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt="Product thumbnail"
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Primary Image */}
          {primaryImage && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Primary Image
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt || "Primary product image"}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                {primaryImage.alt && (
                  <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                    {primaryImage.alt}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Other Images */}
          {otherImages.length > 0 && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Additional Images ({otherImages.length})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {otherImages.map((img, index) => (
                  <div
                    key={index}
                    className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Product image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {img.alt && (
                      <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                        {img.alt}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Images (if no primary/secondary distinction) */}
          {product.images && product.images.length > 0 && !primaryImage && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                Product Images ({product.images.length})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `Product image ${index + 1}`}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    {img.alt && (
                      <p className="p-2 text-xs text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                        {img.alt}
                      </p>
                    )}
                    {img.isPrimary && (
                      <p className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Primary
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewPage;
