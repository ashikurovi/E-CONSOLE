import React from "react";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }) {
  const styles = {
    open: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
    pending:
      "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
    closed:
      "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
    "on hold":
      "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800",
  };
  const style = styles[status?.toLowerCase()] || styles.open;

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
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
