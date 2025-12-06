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
                    <div className="space-y-4 text-sm">
                        <div className="flex flex-wrap gap-4 justify-between">
                            <div>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                    Name
                                </p>
                                <p className="font-semibold">{user.name ?? "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                    Email
                                </p>
                                <p className="font-medium break-all">
                                    {user.email ?? "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                    Company Name
                                </p>
                                <p className="font-medium">
                                    {user.companyName ?? "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                    Company ID
                                </p>
                                <p className="font-medium">
                                    {user.companyId ?? "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-black/60 dark:text-white/60">
                                    Active
                                </p>
                                <p className="font-medium">
                                    {user.isActive ? "Yes" : "No"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-black/60 dark:text-white/60">
                                Permissions
                            </p>
                            <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-black/5 dark:bg-white/5 text-xs whitespace-pre-wrap">
                                {Array.isArray(user.permissions) && user.permissions.length
                                    ? user.permissions.join(", ")
                                    : "-"}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminCustomerDetailPage;








