import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Eye,
  Plus,
  ExternalLink,
  AlertTriangle,
  Palette,
  Globe,
  Image,
  Layout,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import {
  useGetThemesQuery,
  useDeleteThemeMutation,
} from "@/features/theme/themeApiSlice";

const ThemeManagementPage = () => {
  const navigate = useNavigate();
  const { data: themes = [], isLoading } = useGetThemesQuery();
  const [deleteTheme, { isLoading: isDeleting }] = useDeleteThemeMutation();
  const [themeToDelete, setThemeToDelete] = useState(null);

  // Dynamic Stats Calculation
  const stats = useMemo(() => {
    const totalThemes = themes.length;
    const withDomain = themes.filter((t) => t.domainUrl).length;
    const withLogo = themes.filter((t) => t.logo).length;
    const withColors = themes.filter(
      (t) => t.primaryColorCode && t.secondaryColorCode,
    ).length;

    // Mock trend calculations (replace with real historical data if available)
    const calculateTrend = (value, total) => {
      if (total === 0) return { value: "+0%", dir: "up" };
      const percentage = Math.round((value / total) * 100);
      return { value: `+${percentage}%`, dir: "up" };
    };

    return [
      {
        label: "Total Themes",
        value: totalThemes,
        icon: Palette,
        trend: "+12%",
        trendDir: "up",
        bg: "bg-violet-100 dark:bg-violet-900/20",
        color: "text-violet-600 dark:text-violet-400",
        wave: "text-violet-500",
      },
      {
        label: "Active Domains",
        value: withDomain,
        icon: Globe,
        trend: calculateTrend(withDomain, totalThemes).value,
        trendDir: calculateTrend(withDomain, totalThemes).dir,
        bg: "bg-emerald-100 dark:bg-emerald-900/20",
        color: "text-emerald-600 dark:text-emerald-400",
        wave: "text-emerald-500",
      },
      {
        label: "Branded (Logo)",
        value: withLogo,
        icon: Image,
        trend: calculateTrend(withLogo, totalThemes).value,
        trendDir: calculateTrend(withLogo, totalThemes).dir,
        bg: "bg-blue-100 dark:bg-blue-900/20",
        color: "text-blue-600 dark:text-blue-400",
        wave: "text-blue-500",
      },
      {
        label: "Fully Styled",
        value: withColors,
        icon: Layout,
        trend: calculateTrend(withColors, totalThemes).value,
        trendDir: calculateTrend(withColors, totalThemes).dir,
        bg: "bg-amber-100 dark:bg-amber-900/20",
        color: "text-amber-600 dark:text-amber-400",
        wave: "text-amber-500",
      },
    ];
  }, [themes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50"
            >
              <DropdownMenuLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 py-2">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem
                onClick={() => navigate(`/superadmin/themes/${theme.id}`)}
                className="cursor-pointer text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:text-violet-400 dark:focus:bg-violet-900/20 py-2.5 px-3 rounded-lg m-1 font-medium text-sm transition-colors"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/superadmin/themes/${theme.id}/edit`)}
                className="cursor-pointer text-slate-600 dark:text-slate-300 focus:text-indigo-600 focus:bg-indigo-50 dark:focus:text-indigo-400 dark:focus:bg-indigo-900/20 py-2.5 px-3 rounded-lg m-1 font-medium text-sm transition-colors"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Theme
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(theme.id)}
                className="cursor-pointer text-slate-600 dark:text-slate-300 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:text-emerald-400 dark:focus:bg-emerald-900/20 py-2.5 px-3 rounded-lg m-1 font-medium text-sm transition-colors"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setThemeToDelete(theme)}
                className="cursor-pointer text-rose-500 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:text-rose-400 dark:focus:bg-rose-900/20 py-2.5 px-3 rounded-lg m-1 font-medium text-sm transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      })),
    [themes, deleteTheme, isDeleting],
  );

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
              <Palette className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Theme Management
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Create and manage themes for your e-commerce platform. Configure
            branding and styles.
          </p>
        </div>
        {/* <div className="flex-shrink-0">
          <ThemeCreateForm />
        </div> */}
      </div>

      {/* Statistics Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 rounded-[24px] p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md border ${
                    stat.trendDir === "up"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-500/20"
                      : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-500/20"
                  }`}
                >
                  {stat.trendDir === "up" ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {stat.trend}
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div
              className={`absolute bottom-0 right-0 w-32 h-24 opacity-10 ${stat.wave}`}
            >
              <svg
                viewBox="0 0 100 60"
                fill="currentColor"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Themes table */}
      <div className="rounded-[14px] p-5 pb-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1f26] shadow-xl shadow-slate-200/50 dark:shadow-black/20 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              All Themes
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage themes and branding configurations.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              onClick={() => navigate("/superadmin/themes/create")}
              className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Theme
            </Button>
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
            headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap px-4 md:px-6 text-left"
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!themeToDelete}
        onOpenChange={(open) => !open && setThemeToDelete(null)}
      >
        <DialogContent className="max-w-md mr-2 ml-2 bg-white dark:bg-[#1a1f26] border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-0 overflow-hidden">
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
    </motion.div>
  );
};

export default ThemeManagementPage;
