import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const ThemeDetailModal = ({ theme, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={!!theme} onOpenChange={(v) => !v && onClose?.()}>
            <DialogContent className="max-h-[600px] overflow-y-auto max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Theme Details</DialogTitle>
                </DialogHeader>

                {theme && (
                    <div className="space-y-6 text-sm">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                    Theme Information
                                </h3>
                            </div>
                            <div className="overflow-hidden border border-black/10 dark:border-white/10 rounded-lg">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                                        <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5 w-1/3">
                                                Theme ID
                                            </td>
                                            <td className="px-4 py-3 font-semibold">
                                                {theme.id}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                Domain URL
                                            </td>
                                            <td className="px-4 py-3">
                                                {theme.domainUrl ? (
                                                    <a
                                                        href={theme.domainUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                    >
                                                        {theme.domainUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-black/40 dark:text-white/40">-</span>
                                                )}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                Logo Color Code
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {theme.logoColorCode ? (
                                                        <>
                                                            <div
                                                                className="w-8 h-8 rounded border border-black/20 dark:border-white/20"
                                                                style={{ backgroundColor: theme.logoColorCode }}
                                                            ></div>
                                                            <span className="font-semibold font-mono">{theme.logoColorCode}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-black/40 dark:text-white/40">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                Created At
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {formatDate(theme.createdAt)}
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-4 py-3 font-medium text-black/60 dark:text-white/60 bg-black/5 dark:bg-white/5">
                                                Last Updated
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {formatDate(theme.updatedAt)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Logo Preview Section */}
                        {theme.logo && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
                                    <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                                        Logo Preview
                                    </h3>
                                </div>
                                <div className="border border-black/10 dark:border-white/10 rounded-lg p-6 bg-black/5 dark:bg-white/5 flex items-center justify-center">
                                    <img
                                        src={theme.logo}
                                        alt="Theme Logo"
                                        className="max-h-32 max-w-full object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<p class="text-xs text-red-500">Failed to load logo image</p>';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ThemeDetailModal;
