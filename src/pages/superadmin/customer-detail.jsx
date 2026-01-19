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
                    <h1 className="text-2xl font-semibold">Customer detail</h1>
                    <p className="text-sm text-black/60 dark:text-white/60">
                        Review details for a single customer system user.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/superadmin/customers")}
                >
                    Back to customers
                </Button>
            </div>

            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
                {isLoading && <p className="text-sm">Loading customer…</p>}

                {!isLoading && !user && (
                    <p className="text-sm text-red-500">
                        Customer not found or no longer available.
                    </p>
                )}

                {!isLoading && user && (
                    <div className="space-y-6 text-sm">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Basic Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                                        Name
                                    </label>
                                    <p className="font-semibold">{user.name ?? "-"}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                                        Email
                                    </label>
                                    <p className="font-medium break-all">
                                        {user.email ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                                        Company Name
                                    </label>
                                    <p className="font-medium">
                                        {user.companyName ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                                        Company ID
                                    </label>
                                    <p className="font-medium">
                                        {user.companyId ?? "-"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                                        Status
                                    </label>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                        user.isActive 
                                            ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                                    }`}>
                                        {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Permissions Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Permissions
                                </h3>
                            </div>
                            <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-black/5 dark:bg-white/5 text-xs">
                                {Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {user.permissions.map((permission, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded">
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-black/50 dark:text-white/50">No permissions assigned</p>
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









