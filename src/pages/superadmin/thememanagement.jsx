import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, ExternalLink } from "lucide-react";
import {
    useGetThemesQuery,
    useDeleteThemeMutation,
} from "@/features/theme/themeApiSlice";
import ThemeCreateForm from "./theme-components/ThemeCreateForm";
import ThemeEditForm from "./theme-components/ThemeEditForm";
import ThemeDetailModal from "./theme-components/ThemeDetailModal";

const ThemeManagementPage = () => {
    const { data: themes = [], isLoading } = useGetThemesQuery();
    const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();
    const [editingTheme, setEditingTheme] = useState(null);
    const [viewingTheme, setViewingTheme] = useState(null);

    const headers = useMemo(
        () => [
            { header: "ID", field: "id" },
            { header: "Domain URL", field: "domainUrl" },
            { header: "Logo", field: "logo" },
            { header: "Primary Color", field: "primaryColor" },
            { header: "Secondary Color", field: "secondaryColor" },
            { header: "Created", field: "createdAt" },
            { header: "Actions", field: "actions" },
        ],
        []
    );

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const tableData = useMemo(
        () =>
            themes.map((theme) => ({
                id: (
                    <span className="font-semibold text-violet-600 dark:text-violet-400">
                        #{theme.id}
                    </span>
                ),
                domainUrl: theme.domainUrl ? (
                    <a
                        href={theme.domainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:underline text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {theme.domainUrl.length > 30 
                            ? theme.domainUrl.substring(0, 30) + "..." 
                            : theme.domainUrl}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                ) : (
                    <span className="text-slate-400">-</span>
                ),
                logo: theme.logo ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={theme.logo}
                            alt="Logo"
                            className="h-8 w-8 object-contain rounded border border-slate-200 dark:border-slate-700"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-medium">
                            Available
                        </span>
                    </div>
                ) : (
                    <span className="text-slate-400">-</span>
                ),
                primaryColor: theme.primaryColorCode ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                            style={{ backgroundColor: theme.primaryColorCode }}
                        ></div>
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {theme.primaryColorCode}
                        </span>
                    </div>
                ) : (
                    <span className="text-slate-400">-</span>
                ),
                secondaryColor: theme.secondaryColorCode ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                            style={{ backgroundColor: theme.secondaryColorCode }}
                        ></div>
                        <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                            {theme.secondaryColorCode}
                        </span>
                    </div>
                ) : (
                    <span className="text-slate-400">-</span>
                ),
                createdAt: (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(theme.createdAt)}
                    </span>
                ),
                actions: (
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setViewingTheme(theme)}
                            title="View details"
                            className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingTheme(theme)}
                            title="Edit"
                            className="h-8 w-8 text-violet-600 border-violet-200 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400 dark:hover:bg-violet-900/20"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={async () => {
                                if (!window.confirm(`Delete theme ${theme.domainUrl || `#${theme.id}`}? This action cannot be undone.`))
                                    return;
                                const res = await deleteTheme(theme.id);
                                if (res?.data) {
                                    // Success handled by RTK Query
                                } else if (res?.error) {
                                    alert(res?.error?.data?.message || "Failed to delete theme");
                                }
                            }}
                            disabled={isDeleting}
                            title="Delete"
                            className="h-8 w-8 text-red-500 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            })),
        [themes, deleteTheme, isDeleting]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Theme Management</h1>
                        <p className="text-violet-100 text-lg max-w-2xl">
                            Create and manage themes for your e-commerce platform. Configure domain URLs, logos, and branding colors.
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        Total Themes
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{themes.length}</p>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        With Domain URL
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        {themes.filter((t) => t.domainUrl).length}
                    </p>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        With Logo
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        {themes.filter((t) => t.logo).length}
                    </p>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        With Primary Color
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        {themes.filter((t) => t.primaryColorCode).length}
                    </p>
                </div>
                <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        With Secondary Color
                    </p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                        {themes.filter((t) => t.secondaryColorCode).length}
                    </p>
                </div>
            </div>

            {/* Themes table */}
            <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Themes</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Manage themes and branding configurations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeCreateForm />
                    </div>
                </div>
                <div className="p-0">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-4"
                        total={themes.length}
                        isLoading={isLoading}
                        searchable={false}
                        headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    />
                </div>
            </div>

            {/* Edit Modal */}
            {editingTheme && (
                <ThemeEditForm
                    theme={editingTheme}
                    onClose={() => setEditingTheme(null)}
                />
            )}

            {/* Detail Modal */}
            {viewingTheme && (
                <ThemeDetailModal
                    theme={viewingTheme}
                    onClose={() => setViewingTheme(null)}
                />
            )}
        </div>
    );
};

export default ThemeManagementPage;
