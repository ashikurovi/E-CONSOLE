import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { superadminLoggedOut } from "@/features/superadminAuth/superadminAuthSlice";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

const SuperAdminTopNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(superadminLoggedOut());
    toast.success("Logged out successfully");
    navigate("/superadmin/login");
  };

  return (
    <header className="w-full bg-white/80 dark:bg-[#121212]/80 backdrop-blur border-b border-black/10 dark:border-white/10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
            Super Admin
          </span>
          <span className="text-sm font-semibold">Control Center</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-black/60 dark:text-white/60">
            <span className="hidden sm:inline">Environment:</span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              Production
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminTopNavbar;



