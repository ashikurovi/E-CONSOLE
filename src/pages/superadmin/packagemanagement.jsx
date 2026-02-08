import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
 import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Star, Package, Tag, TrendingDown } from "lucide-react";
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
                        <span className="font-medium text-slate-900 dark:text-white">{pkg.name || "-"}</span>
                    </div>
                ),
                description: (
                    <span className="text-xs line-clamp-2 max-w-xs text-slate-500 dark:text-slate-400">
                        {pkg.description || "-"}
                    </span>
                ),
                price: (
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {formatPrice(pkg.price)}
                    </span>
                ),
                discountPrice: pkg.discountPrice ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(pkg.discountPrice)}
                    </span>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">-</span>
                ),
                theme: pkg.theme ? (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-medium">
                        {pkg.theme.domainUrl || `Theme #${pkg.theme.id}`}
                    </span>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">-</span>
                ),
                isFeatured: pkg.isFeatured ? (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
                        Yes
                    </span>
                ) : (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-medium">
                        No
                    </span>
                ),
                featuresCount: (
                    <span className="px-2.5 py-1 text-xs rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium">
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
                            className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setEditingPackage(pkg)}
                            title="Edit"
                            className="h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 dark:shadow-violet-900/20"
                        >
                            <Pencil className="h-3.5 w-3.5" />
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
                            className="h-8 w-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 dark:shadow-rose-900/20"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
            })),
        [packages, deletePackage, isDeleting]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Package className="w-64 h-64 -rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Package Management</h1>
                    <p className="text-violet-100 text-lg">
                        Create and manage subscription packages for your e-commerce platform. Define pricing, features, and benefits for each package tier.
                    </p>
                </div>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                                Total Packages
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{packages.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                                Featured
                            </p>
                            <p className="mt-2 text-3xl font-bold text-amber-500">
                                {packages.filter((p) => p.isFeatured).length}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Star className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                                Average Price
                            </p>
                            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                                {packages.length > 0
                                    ? formatPrice(
                                          packages.reduce((sum, p) => sum + parseFloat(p.price || 0), 0) /
                                              packages.length
                                      )
                                    : "৳0.00"}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400 flex items-center justify-center">
                            <Tag className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                                Lowest Price
                            </p>
                            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                {packages.length > 0
                                    ? formatPrice(Math.min(...packages.map((p) => parseFloat(p.price || 0))))
                                    : "৳0.00"}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Packages table */}
            <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Packages</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage subscription packages and pricing tiers.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <PackageCreateForm />
                    </div>
                </div>
                <div className="p-0">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-4"
                        total={packages.length}
                        isLoading={isLoading}
                        searchable={false}
                        headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
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
