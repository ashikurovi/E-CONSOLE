import React from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useGetProductQuery } from "@/features/product/productApiSlice";
import { useSelector } from "react-redux";

const ProductViewPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: product, isLoading } = useGetProductQuery(parseInt(id));

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-black/60 dark:text-white/60">{t("products.loadingProductDetails")}</p>
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
            <h1 className="text-2xl font-semibold">{t("products.productNotFound")}</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("products.productNotFoundDesc")}
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
            <h1 className="text-2xl font-semibold">{t("products.productDetails")}</h1>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">
              {t("products.viewProductInfo")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/products/${id}/edit`)}
          className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
        >
          <Pencil className="h-4 w-4 mr-2" />
          {t("products.editProduct")}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
            <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
              {t("products.basicInformation")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("common.name")}</label>
              <p className="text-base text-black dark:text-white mt-1">{product.name || product.title || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.sku")}</label>
              <p className="text-base text-black dark:text-white mt-1">{product.sku || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.category")}</label>
              <p className="text-base text-black dark:text-white mt-1">
                {product.category?.name || "-"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("common.status")}</label>
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
                  {product.status === 'draft' ? t("products.draft") : 
                   product.status === 'trashed' ? t("products.trashed") : 
                   product.isActive ? t("common.active") : t("common.disabled")}
                </span>
              </p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">
                {t("products.description")}
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
              {t("products.pricing")}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70">{t("products.price")}</label>
              <p className="text-base text-black dark:text-white mt-1">
                {typeof product.price === "number"
                  ? `$${product.price.toFixed(2)}`
                  : product.price || "-"}
              </p>
            </div>
            {product.discountPrice && (
              <div>
                <label className="text-sm font-medium text-black/70 dark:text-white/70">
                  {t("products.discountPrice")}
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
              {t("products.inventory")}
            </h3>
          </div>
          <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-black/5 dark:bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">{t("products.metric")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("products.value")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("common.status")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">{t("products.currentStock")}</td>
                  <td className={`px-4 py-3 font-semibold ${
                    (product.stock ?? 0) <= 5 
                      ? "text-red-600 dark:text-red-400" 
                      : "text-black dark:text-white"
                  }`}>
                    {product.stock ?? 0} {t("products.units")}
                  </td>
                  <td className="px-4 py-3">
                    {(product.stock ?? 0) <= 5 ? (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded">
                        {t("products.lowStock")}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded">
                        {t("products.inStock")}
                      </span>
                    )}
                  </td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">{t("products.sold")}</td>
                  <td className="px-4 py-3 text-black dark:text-white">{product.sold ?? 0} {t("products.units")}</td>
                  <td className="px-4 py-3">-</td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">{t("products.totalIncome")}</td>
                  <td className="px-4 py-3 font-semibold text-green-600 dark:text-green-400">
                    ${typeof product.totalIncome === "number"
                      ? product.totalIncome.toFixed(2)
                      : (product.totalIncome ?? "0.00")}
                  </td>
                  <td className="px-4 py-3">-</td>
                </tr>
                <tr className="border-t border-black/10 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-black/70 dark:text-white/70">{t("products.stockStatus")}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        product.isLowStock
                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      }`}
                    >
                      {product.isLowStock ? t("products.lowStock") : t("products.inStock")}
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
              {t("products.imagesAndMedia")}
            </h3>
          </div>

          {/* Thumbnail */}
          {product.thumbnail && (
            <div>
              <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
                {t("products.thumbnail")}
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
                <img
                  src={product.thumbnail}
                  alt={t("products.productThumbnailAlt")}
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
                {t("products.primaryImage")}
              </label>
              <div className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden">
                <img
                  src={primaryImage.url}
                  alt={primaryImage.alt || t("products.primaryProductImageAlt")}
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
                {t("products.additionalImages")} ({otherImages.length})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {otherImages.map((img, index) => (
                  <div
                    key={index}
                    className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${t("products.productImageAlt")} ${index + 1}`}
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
                {t("products.productImages")} ({product.images.length})
              </label>
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((img, index) => (
                  <div
                    key={index}
                    className="border border-black/5 dark:border-white/10 rounded-md overflow-hidden"
                  >
                    <img
                      src={img.url}
                      alt={img.alt || `${t("products.productImageAlt")} ${index + 1}`}
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
                        {t("products.primary")}
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
