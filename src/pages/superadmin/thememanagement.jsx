import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, ExternalLink, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [themeToDelete, setThemeToDelete] = useState(null);

  const handleDeleteTheme = async () => {
    if (!themeToDelete) return;

    try {
      const res = await deleteTheme(themeToDelete.id);
      if (res?.data) {
        // Success handled by RTK Query
        setThemeToDelete(null);
      } else if (res?.error) {
        // Error handling could be improved with toast
        console.error("Failed to delete theme:", res.error);
      }
    } catch (error) {
      console.error("Error deleting theme:", error);
    }
  };

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
    [],
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
                e.target.style.display = "none";
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
              className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-105"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditingTheme(theme)}
              title="Edit"
              className="h-9 w-9 rounded-xl border-indigo-200 dark:border-indigo-800 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 transition-all duration-200 hover:scale-105"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setThemeToDelete(theme)}
              disabled={isDeleting}
              title="Delete"
              className="h-9 w-9 rounded-xl border-rose-200 dark:border-rose-900/50 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-900/20 transition-all duration-200 hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [themes, deleteTheme, isDeleting],
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Theme Management
            </h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Create and manage themes for your e-commerce platform. Configure
              domain URLs, logos, and branding colors.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            Total Themes
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {themes.length}
          </p>
        </div>
        <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            With Domain URL
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {themes.filter((t) => t.domainUrl).length}
          </p>
        </div>
        <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            With Logo
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {themes.filter((t) => t.logo).length}
          </p>
        </div>
        <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            With Primary Color
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {themes.filter((t) => t.primaryColorCode).length}
          </p>
        </div>
        <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
          <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
            With Secondary Color
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300 origin-left">
            {themes.filter((t) => t.secondaryColorCode).length}
          </p>
        </div>
      </div>

      {/* Themes table */}
      <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1f26] shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Themes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!themeToDelete}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
      >
        <DialogContent className="max-w-md bg-white dark:bg-[#1a1f26] border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-0 overflow-hidden">
          <div className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-rose-500 dark:text-rose-400" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white text-center">
                Delete Theme?
              </DialogTitle>
              <DialogDescription className="text-center text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {themeToDelete?.domainUrl || `#${themeToDelete?.id}`}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex w-full gap-3 sm:justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => setThemeToDelete(null)}
                className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteTheme}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 border-0 h-11"
              >
                {isDeleting ? "Deleting..." : "Delete Theme"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ThemeManagementPage;
