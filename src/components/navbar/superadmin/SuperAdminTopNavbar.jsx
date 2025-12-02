import React from "react";

const SuperAdminTopNavbar = () => {
  return (
    <header className="w-full bg-white/80 dark:bg-[#121212]/80 backdrop-blur border-b border-black/10 dark:border-white/10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
            Super Admin
          </span>
          <span className="text-sm font-semibold">Control Center</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
          <span className="hidden sm:inline">Environment:</span>
          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            Production
          </span>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;


