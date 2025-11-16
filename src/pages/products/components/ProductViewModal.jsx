import React from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export default function ProductViewModal({ product }) {
    if (!product) return null;

    const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const otherImages = product.images?.filter((img) => !img.isPrimary) || [];

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                    title="View"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                    {/* Basic Information */}
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
                                    className={`px-2 py-1 rounded text-sm ${product.isActive
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                        }`}
                                >
                                    {product.isActive ? "Active" : "Disabled"}
                                </span>
                            </p>
                        </div>
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
                                <p className="text-base text-black dark:text-white mt-1">
                                    ${typeof product.discountPrice === "number"
                                        ? product.discountPrice.toFixed(2)
                                        : product.discountPrice}
                                </p>
                            </div>
                        )}
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
            </DialogContent>
        </Dialog>
    );
}

