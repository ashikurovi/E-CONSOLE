import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import { Button } from "@/components/ui/button";

const SuperAdminCustomerDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const numericId = useMemo(() => Number(id), [id]);

    const { data: users = [], isLoading } = useGetSystemusersQuery();

    const user = useMemo(
        () => users.find((u) => String(u.id) === String(numericId)),
        [users, numericId]
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer detail</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review details for a single customer system user.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/superadmin/customers")}
                    className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl"
                >
                    Back to customers
                </Button>
            </div>

            <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                {isLoading && <p className="text-sm text-slate-500">Loading customer…</p>}

                {!isLoading && !user && (
                    <p className="text-sm text-rose-500">
                        Customer not found or no longer available.
                    </p>
                )}

                {!isLoading && user && (
                    <div className="space-y-6 text-sm">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                                    Basic Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                        Name
                                    </label>
                                    <p className="font-semibold text-slate-900 dark:text-white">{user.name ?? "-"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                        Email
                                    </label>
                                    <p className="font-medium break-all text-slate-900 dark:text-white">
                                        {user.email ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                        Company Name
                                    </label>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {user.companyName ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                        Company ID
                                    </label>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {user.companyId ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                                        Status
                                    </label>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                                        user.isActive 
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                    }`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                                    Permissions
                                </h3>
                            </div>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 text-xs">
                                {Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {user.permissions.map((permission, index) => (
                                            <span key={index} className="px-2.5 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-md">
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 dark:text-slate-400">No permissions assigned</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminCustomerDetailPage;









