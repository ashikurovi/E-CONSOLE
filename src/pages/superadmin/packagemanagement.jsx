import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Star } from "lucide-react";
import {
    useGetPackagesQuery,
    useDeletePackageMutation,
} from "@/features/package/packageApiSlice";
import PackageCreateForm from "./package-components/PackageCreateForm";
import PackageEditForm from "./package-components/PackageEditForm";
import PackageDetailModal from "./package-components/PackageDetailModal";

const PackageManagementPage = () => {
    const { data: packages = [], isLoading } = useGetPackagesQuery();
    const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
    const [editingPackage, setEditingPackage] = useState(null);
    const [viewingPackage, setViewingPackage] = useState(null);

    const headers = useMemo(
        () => [
            { header: "Name", field: "name" },
            { header: "Description", field: "description" },
            { header: "Price", field: "price" },
            { header: "Discount Price", field: "discountPrice" },
            { header: "Theme", field: "theme" },
            { header: "Featured", field: "isFeatured" },
            { header: "Features", field: "featuresCount" },
            { header: "Actions", field: "actions" },
        ],
        []
    );

    const formatPrice = (price) => {
        if (!price) return "-";
        return `৳${parseFloat(price).toFixed(2)}`;
    };

    const tableData = useMemo(
        () =>
            packages.map((pkg) => ({
                name: (
                    <div className="flex items-center gap-2">
                        {pkg.isFeatured && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                        <span className="font-medium">{pkg.name || "-"}</span>
                    </div>
                ),
                description: (
                    <span className="text-xs line-clamp-2 max-w-xs">
                        {pkg.description || "-"}
                    </span>
                ),
                price: (
                    <span className="font-semibold">
                        {formatPrice(pkg.price)}
                    </span>
                ),
                discountPrice: pkg.discountPrice ? (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatPrice(pkg.discountPrice)}
                    </span>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                theme: pkg.theme ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {pkg.theme.domainUrl || `Theme #${pkg.theme.id}`}
                    </span>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                isFeatured: pkg.isFeatured ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        Yes
                    </span>
                ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        No
                    </span>
                ),
                featuresCount: (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {pkg.features?.length || 0} features
                    </span>
                ),
                actions: (
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setViewingPackage(pkg)}
                            title="View details"
                            className="border-slate-300"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingPackage(pkg)}
                            title="Edit"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={async () => {
                                if (!window.confirm(`Delete package "${pkg.name}"? This action cannot be undone.`))
                                    return;
                                const res = await deletePackage(pkg.id);
                                if (res?.data) {
                                    // Success handled by RTK Query
                                } else if (res?.error) {
                                    alert(res?.error?.data?.message || "Failed to delete package");
                                }
                            }}
                            disabled={isDeleting}
                            title="Delete"
                            className="bg-red-500 hover:bg-red-600 text-white"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            })),
        [packages, deletePackage, isDeleting]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">Package Management</h1>
                <p className="text-sm text-black/60 dark:text-white/60">
                    Create and manage subscription packages for your e-commerce platform. Define pricing, features, and benefits for each package tier.
                </p>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        Total Packages
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{packages.length}</p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        Featured Packages
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {packages.filter((p) => p.isFeatured).length}
                    </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        Average Price
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {packages.length > 0
                            ? formatPrice(
                                  packages.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) /
                                      packages.length
                              )
                            : "৳0.00"}
                    </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        Lowest Price
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {packages.length > 0
                            ? formatPrice(Math.min(...packages.map((p) => parseFloat(p.price || 0))))
                            : "৳0.00"}
                    </p>
                </div>
            </div>

            {/* Packages table */}
            <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium">All Packages</h2>
                        <p className="text-xs text-black/60 dark:text-white/60">
                            Manage subscription packages and pricing tiers.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PackageCreateForm />
                    </div>
                </div>
                <div className="p-4">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-3"
                        total={packages.length}
                        isLoading={isLoading}
                        searchable={false}
                    />
                </div>
            </div>

            {/* Edit Modal */}
            {editingPackage && (
                <PackageEditForm
                    pkg={editingPackage}
                    onClose={() => setEditingPackage(null)}
                />
            )}

            {/* Detail Modal */}
            {viewingPackage && (
                <PackageDetailModal
                    pkg={viewingPackage}
                    onClose={() => setViewingPackage(null)}
                />
            )}
        </div>
    );
};

export default PackageManagementPage;
