import React from "react";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
  const styles = {
    open: "text-emerald-700 bg-emerald-50 border-emerald-200 ring-1 ring-emerald-600/20 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400",
    pending:
      "text-violet-700 bg-violet-50 border-violet-200 ring-1 ring-violet-600/20 dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-400",
    closed:
      "text-blue-700 bg-blue-50 border-blue-200 ring-1 ring-blue-600/20 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400",
    "on hold":
      "text-orange-700 bg-orange-50 border-orange-200 ring-1 ring-orange-600/20 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400",
  };
  const style = styles[status?.toLowerCase()] || styles.open;

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-semibold border capitalize shadow-sm",
        style
      )}
    >
      {status}
    </span>
  );
}

export function PriorityIcon({ priority }) {
  const p = priority?.toLowerCase();
  if (p === "highest" || p === "high")
    return (
      <div className="text-red-500">
        <ArrowLeft className="w-4 h-4 rotate-90" />
      </div>
    );
  if (p === "medium")
    return (
      <div className="text-yellow-500">
        <LayoutGrid className="w-3 h-3" />
      </div>
    );
  return (
    <div className="text-blue-500">
      <ArrowLeft className="w-4 h-4 -rotate-90" />
    </div>
  );
}
