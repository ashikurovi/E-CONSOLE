import React from "react";
import { Palette, X } from "lucide-react";
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
            <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-[24px]">
                <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-8 py-6 relative">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <Palette className="h-6 w-6" />
                            Theme Details
                        </DialogTitle>
                        <p className="text-violet-100 mt-2">
                            Detailed information about this theme configuration.
                        </p>
                    </DialogHeader>
                </div>

                {theme && (
                    <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                        {/* Basic Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500"></div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                    Theme Information
                                </h3>
                            </div>
                            
                            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20 w-1/3">
                                                Theme ID
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                                                {theme.id}
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                                Domain URL
                                            </td>
                                            <td className="px-6 py-4">
                                                {theme.domainUrl ? (
                                                    <a
                                                        href={theme.domainUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline font-medium flex items-center gap-1"
                                                    >
                                                        {theme.domainUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-600">-</span>
                                                )}
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                                Primary Color
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {theme.primaryColorCode ? (
                                                        <>
                                                            <div
                                                                className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                                                                style={{ backgroundColor: theme.primaryColorCode }}
                                                            ></div>
                                                            <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700">
                                                                {theme.primaryColorCode}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-600">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                                Secondary Color
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {theme.secondaryColorCode ? (
                                                        <>
                                                            <div
                                                                className="w-8 h-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 ring-2 ring-white dark:ring-slate-900"
                                                                style={{ backgroundColor: theme.secondaryColorCode }}
                                                            ></div>
                                                            <span className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-200 dark:border-slate-700">
                                                                {theme.secondaryColorCode}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-600">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                                Created At
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                {formatDate(theme.createdAt)}
                                            </td>
                                        </tr>
                                        <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                                                Last Updated
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
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
                                <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500"></div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                                        Logo Preview
                                    </h3>
                                </div>
                                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005),linear-gradient(45deg,#00000005_25%,transparent_25%,transparent_75%,#00000005_75%,#00000005)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"></div>
                                    <img
                                        src={theme.logo}
                                        alt="Theme Logo"
                                        className="max-h-40 max-w-full object-contain relative z-10 drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<p class="text-sm text-rose-500 flex items-center gap-2"><span class="i-lucide-alert-circle"></span> Failed to load logo image</p>';
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
