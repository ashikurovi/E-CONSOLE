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
        <main className="w-screen min-h-screen dark:bg-black bg-gray-100 dark:text-white/75 text-black/75">
            <div className="w-full">
                <div className="lg:px-0 px-2">
                    <div className="lg:grid lg:grid-cols-[260px_1fr]">
                        {/* Sidebar (fixed for desktop) - Super Admin only */}
                        <div className="lg:block hidden">
                            <SuperAdminSideNav />
                        </div>

                        {/* Content area */}
                        <div>
                            <div className="lg:sticky top-0 z-20">
                                <SuperAdminTopNavbar />
                            </div>
                            <div className="px-3 md:max-w-[1100px] lg:w-full xl:max-w-[1400px] 2xl:max-w-[1800px] pb-6 pt-3">
                                <Outlet />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default SuperAdminLayout;


