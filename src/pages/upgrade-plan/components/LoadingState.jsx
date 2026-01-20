import React from "react";

export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-12 text-center">
        <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-sm text-black/60 dark:text-white/60">{message}</p>
      </div>
    </div>
  );
};
