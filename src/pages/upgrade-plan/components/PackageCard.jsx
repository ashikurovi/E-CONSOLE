import React from "react";
import { Check, Star, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PackageCard = ({ pkg, isCurrentPackage, onSelect }) => {
  const price = parseFloat(pkg.discountPrice || pkg.price);
  const originalPrice = pkg.discountPrice ? parseFloat(pkg.price) : null;

  return (
    <div
      className={`rounded-2xl border p-6 transition-all ${
        isCurrentPackage
          ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
          : pkg.isFeatured
          ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-300 dark:border-amber-700 shadow-lg"
          : "bg-white dark:bg-[#1a1f26] border-gray-100 dark:border-gray-800 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md"
      }`}
    >
      {/* Package Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {pkg.name}
            {pkg.isFeatured && (
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
            )}
          </h3>
          <p className="text-xs text-black/60 dark:text-white/60 mt-1 line-clamp-2">
            {pkg.description}
          </p>
        </div>
        {isCurrentPackage && (
          <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <Check className="h-3 w-3" />
            Active
          </span>
        )}
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">৳{price.toFixed(2)}</span>
          <span className="text-sm text-black/60 dark:text-white/60">/month</span>
        </div>
        {originalPrice && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-black/40 dark:text-white/40 line-through">
              ৳{originalPrice.toFixed(2)}
            </span>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full font-medium">
              {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Features */}
      {pkg.features && pkg.features.length > 0 && (
        <div className="mb-4 space-y-2">
          {pkg.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-black/70 dark:text-white/70">
                {feature.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={() => onSelect(pkg)}
        disabled={isCurrentPackage}
        className={`w-full ${
          isCurrentPackage
            ? "bg-green-500/20 text-green-700 dark:text-green-300 cursor-not-allowed"
            : pkg.isFeatured
            ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            : "bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black"
        }`}
      >
        {isCurrentPackage ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Current Plan
          </>
        ) : (
          <>
            {pkg.isFeatured ? (
              <Zap className="h-4 w-4 mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Select Plan
          </>
        )}
      </Button>
    </div>
  );
};
