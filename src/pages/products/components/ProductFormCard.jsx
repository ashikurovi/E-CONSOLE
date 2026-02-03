import React from "react";

/**
 * Card wrapper for product form sections (e.g. Shipping, Pricing).
 */
export default function ProductFormCard({ children, className = "", hover = true }) {
  return (
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
}
