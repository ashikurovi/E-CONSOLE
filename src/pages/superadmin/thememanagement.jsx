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
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                        #{theme.id}
                    </span>
                ),
                domainUrl: theme.domainUrl ? (
                    <a
                        href={theme.domainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {theme.domainUrl.length > 30 
                            ? theme.domainUrl.substring(0, 30) + "..." 
                            : theme.domainUrl}
                        <ExternalLink className="h-3 w-3" />
                    </a>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                logo: theme.logo ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={theme.logo}
                            alt="Logo"
                            className="h-8 w-8 object-contain rounded border border-black/10 dark:border-white/10"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="text-xs text-green-600 dark:text-green-400">
                            Available
                        </span>
                    </div>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                primaryColor: theme.primaryColorCode ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border border-black/20 dark:border-white/20"
                            style={{ backgroundColor: theme.primaryColorCode }}
                        ></div>
                        <span className="text-xs font-mono font-semibold">
                            {theme.primaryColorCode}
                        </span>
                    </div>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                secondaryColor: theme.secondaryColorCode ? (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-6 h-6 rounded border border-black/20 dark:border-white/20"
                            style={{ backgroundColor: theme.secondaryColorCode }}
                        ></div>
                        <span className="text-xs font-mono font-semibold">
                            {theme.secondaryColorCode}
                        </span>
                    </div>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                createdAt: (
                    <span className="text-xs text-black/60 dark:text-white/60">
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
                            className="border-slate-300"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingTheme(theme)}
                            title="Edit"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
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
                            className="bg-red-500 hover:bg-red-600 text-white"
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
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">Theme Management</h1>
                <p className="text-sm text-black/60 dark:text-white/60">
                    Create and manage themes for your e-commerce platform. Configure domain URLs, logos, and branding colors.
                </p>
            </div>

            {/* Statistics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        Total Themes
                    </p>
                    <p className="mt-1 text-2xl font-semibold">{themes.length}</p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        With Domain URL
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {themes.filter((t) => t.domainUrl).length}
                    </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        With Logo
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {themes.filter((t) => t.logo).length}
                    </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        With Primary Color
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {themes.filter((t) => t.primaryColorCode).length}
                    </p>
                </div>
                <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
                    <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                        With Secondary Color
                    </p>
                    <p className="mt-1 text-2xl font-semibold">
                        {themes.filter((t) => t.secondaryColorCode).length}
                    </p>
                </div>
            </div>

            {/* Themes table */}
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium">All Themes</h2>
                        <p className="text-xs text-black/60 dark:text-white/60">
                            Manage themes and branding configurations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeCreateForm />
                    </div>
                </div>
                <div className="p-4">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-3"
                        total={themes.length}
                        isLoading={isLoading}
                        searchable={false}
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
