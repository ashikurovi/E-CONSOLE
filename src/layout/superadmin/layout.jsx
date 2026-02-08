import React from "react";
import { Outlet } from "react-router-dom";
import SuperAdminTopNavbar from "@/components/navbar/superadmin/SuperAdminTopNavbar";
import SuperAdminSideNav from "@/components/navbar/superadmin/SuperAdminSideNav";

/**
 * Super Admin Layout
 * - Separate layout wrapper for all /superadmin routes
 * - Own sidebar + top navbar, independent from the main admin layout
 */
const SuperAdminLayout = () => {
    return (
        <main className="w-screen min-h-screen bg-gray-50 dark:bg-[#09090b] text-slate-900 dark:text-slate-50 transition-colors duration-300">
            <div className="w-full">
                <div className="lg:px-0">
                    <div className="lg:grid lg:grid-cols-[260px_1fr]">
                        {/* Sidebar (fixed for desktop) - Super Admin only */}
                        <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto border-r border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#09090b]">
                            <SuperAdminSideNav />
                        </div>

                        {/* Content area */}
                        <div className="flex flex-col min-w-0 min-h-screen">
                            <div className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#09090b]/80 border-b border-gray-200/50 dark:border-white/5 supports-[backdrop-filter]:bg-white/60">
                                <SuperAdminTopNavbar />
                            </div>
                            <div className="p-4 md:p-6 lg:p-8 overflow-x-hidden w-full mx-auto max-w-[1600px]">
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                                    <Outlet />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SuperAdminLayout;


