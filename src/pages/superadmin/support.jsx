import React, { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    useGetHelpQuery,
    useGetHelpStatsQuery,
    useUpdateHelpMutation,
} from "@/features/help/helpApiSlice";
import { useNavigate } from "react-router-dom";
import {
    MessageSquare,
    Inbox,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Search as SearchIcon,
    MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { StatusBadge, PriorityIcon } from "@/pages/help/components/HelpComponents";

const TAB_TO_STATUS = {
    active: ["pending", "in_progress"],
    pending: ["pending"],
    in_progress: ["in_progress"],
    resolved: ["resolved"],
};

const SuperAdminSupportPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("active");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [searchQuery, setSearchQuery] = useState("");

    const { data: tickets = [], isLoading } = useGetHelpQuery();
    const { data: stats, isLoading: statsLoading } = useGetHelpStatsQuery();
    const [updateHelp, { isLoading: isUpdating }] = useUpdateHelpMutation();

    const filteredTickets = useMemo(() => {
        const statuses = TAB_TO_STATUS[activeTab];
        if (!statuses) return tickets;
        return tickets.filter((t) => statuses.includes(t.status ?? "pending"));
    }, [tickets, activeTab]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    const searchedTickets = useMemo(() => {
        if (!searchQuery.trim()) return filteredTickets;
        const q = searchQuery.toLowerCase();
        return filteredTickets.filter(
            (t) =>
                String(t.id).toLowerCase().includes(q) ||
                (t.email || "").toLowerCase().includes(q) ||
                (t.issue || "").toLowerCase().includes(q)
        );
    }, [filteredTickets, searchQuery]);

    const totalItems = searchedTickets.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentTickets = searchedTickets.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push("...");
            pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1);
            pages.push("...");
            for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push("...");
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const tabCounts = useMemo(
        () =>
            stats
                ? [
                    { id: "active", label: "All Active", count: stats.active ?? 0 },
                    { id: "pending", label: "Pending", count: stats.pending ?? 0 },
                    { id: "in_progress", label: "In progress", count: stats.in_progress ?? 0 },
                    { id: "resolved", label: "Resolved", count: stats.resolved ?? 0 },
                ]
                : [],
        [stats]
    );

    const statsCards = [
        { label: "Total Tickets", value: statsLoading ? "—" : String(stats?.total ?? 0), icon: Inbox, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-indigo-500" },
        { label: "Pending", value: statsLoading ? "—" : String(stats?.pending ?? 0), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-500 to-orange-500" },
        { label: "Resolved", value: statsLoading ? "—" : String(stats?.resolved ?? 0), icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-teal-500" },
        { label: "Open Issues", value: statsLoading ? "—" : String(stats?.active ?? 0), icon: AlertCircle, color: "text-violet-600", bg: "bg-violet-50", gradient: "from-violet-500 to-purple-500" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Support
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Monitor support volume, prioritize high-impact tickets and coordinate across all connected stores.
                    </p>
                </div>
            </div>

            {/* Stats from help API */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon className={cn("w-24 h-24", stat.color)} />
                        </div>
                        <div className="relative z-10">
                            <div className={cn("p-3 rounded-2xl w-fit mb-3", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</div>
                        </div>
                        <div className={cn("absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity", stat.gradient)} />
                    </motion.div>
                ))}
            </div>

            {/* Tab selector - aligned with help API */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl w-fit">
                {(tabCounts.length ? tabCounts : [
                    { id: "active", label: "All Active", count: 0 },
                    { id: "pending", label: "Pending", count: 0 },
                    { id: "in_progress", label: "In progress", count: 0 },
                    { id: "resolved", label: "Resolved", count: 0 },
                ]).map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-xl transition-all whitespace-nowrap flex items-center gap-2",
                            activeTab === tab.id
                                ? "bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 shadow-md ring-1 ring-black/5 dark:ring-white/10"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                        )}
                    >
                        {tab.label}
                        <span
                            className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px]",
                                activeTab === tab.id
                                    ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300"
                                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            )}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Ticket list - same layout as TicketListView */}
            <div className="flex flex-col flex-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                {/* Header */}
                <div className="relative px-6 md:px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 via-transparent to-transparent dark:from-violet-900/10 pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                            Support Tickets
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live updates from help API
                        </p>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 flex-1 md:justify-end">
                        <div className="relative w-full md:w-80 group">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by email or subject..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 bg-slate-50/80 dark:bg-slate-800/50 border-y border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider min-w-[800px] md:min-w-0">
                    <div className="col-span-1 flex items-center justify-center">
                        <input type="checkbox" className="rounded border-slate-300 w-4 h-4 text-violet-600 focus:ring-violet-500" />
                    </div>
                    <div className="col-span-1">ID</div>
                    <div className="col-span-3">Requester</div>
                    <div className="col-span-2">Priority</div>
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-2 text-right px-4">Status / Actions</div>
                </div>

                {/* Table rows */}
                <div className="flex-1 overflow-y-auto overflow-x-auto bg-white dark:bg-slate-900">
                    <div className="min-w-[800px] md:min-w-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                <div className="animate-pulse">Loading tickets…</div>
                            </div>
                        ) : currentTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <SearchIcon className="w-12 h-12 mb-3 opacity-20" />
                                <p>{searchQuery ? `No tickets found matching "${searchQuery}"` : "No tickets in this tab."}</p>
                            </div>
                        ) : (
                            currentTickets.map((ticket, index) => {
                                const subject = ticket.issue ?? "—";
                                const priority = ticket.priority ?? "medium";
                                const requesterPrimary = ticket.email ?? "—";
                                return (
                                    <motion.div
                                        key={ticket.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => navigate(`/superadmin/support/${ticket.id}`)}
                                        className="grid grid-cols-12 gap-4 px-6 md:px-8 py-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-violet-50/30 dark:hover:bg-violet-900/10 cursor-pointer transition-all items-center group relative"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="col-span-1 flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-slate-300 w-4 h-4 text-violet-600 focus:ring-violet-500"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                        <div className="col-span-1 font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                                            {ticket.id}
                                        </div>
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-bold ring-2 ring-transparent group-hover:ring-violet-200 dark:group-hover:ring-violet-800 transition-all shadow-sm">
                                                {(requesterPrimary || "?").charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                                    {requesterPrimary}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <PriorityIcon priority={priority} />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                                {priority}
                                            </span>
                                        </div>
                                        <div className="col-span-3 text-sm font-medium text-slate-600 dark:text-slate-300 truncate group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                            {subject.length > 80 ? `${subject.slice(0, 80)}…` : subject}
                                        </div>
                                        <div className="col-span-2 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                                            <div className="transform group-hover:scale-105 transition-transform">
                                                <StatusBadge status={ticket.status} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={ticket.status}
                                                    disabled={isUpdating}
                                                    onChange={async (e) => {
                                                        const newStatus = e.target.value;
                                                        if (!newStatus || newStatus === ticket.status) return;
                                                        try {
                                                            await updateHelp({
                                                                id: ticket.id,
                                                                body: { status: newStatus },
                                                            }).unwrap();
                                                        } catch {}
                                                    }}
                                                    className="h-8 pl-2 pr-7 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 cursor-pointer outline-none"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In progress</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20"
                                                    onClick={() => navigate(`/superadmin/support/${ticket.id}`)}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 font-medium">
                            Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Rows:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg p-1 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {getPageNumbers().map((pageNum, idx) =>
                            pageNum === "..." ? (
                                <span key={`dots-${idx}`} className="text-slate-400 text-xs px-1">...</span>
                            ) : (
                                <Button
                                    key={pageNum}
                                    size="sm"
                                    className={cn(
                                        "h-9 w-9 p-0 rounded-xl font-bold transition-all",
                                        currentPage === pageNum
                                            ? "bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-500/20"
                                            : "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                    )}
                                    onClick={() => setCurrentPage(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            )
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSupportPage;

