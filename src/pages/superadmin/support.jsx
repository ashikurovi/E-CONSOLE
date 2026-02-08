import React, { useMemo } from "react";
import ReusableTable from "@/components/table/reusable-table";
import {
    useGetHelpQuery,
    useUpdateHelpMutation,
} from "@/features/help/helpApiSlice";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const SuperAdminSupportPage = () => {
    const navigate = useNavigate();
    const { data: tickets = [], isLoading } = useGetHelpQuery();
    const [updateHelp, { isLoading: isUpdating }] = useUpdateHelpMutation();

    const headers = useMemo(
        () => [
            { header: "Ticket ID", field: "id" },
            { header: "Email", field: "email" },
            { header: "Issue", field: "issue" },
            { header: "Status", field: "status" },
            { header: "Created", field: "createdAt" },
            { header: "Status / Actions", field: "actions" },
        ],
        []
    );

    const tableData = useMemo(
        () =>
            tickets.map((t) => ({
                id: <span className="font-mono text-xs text-slate-500">{t.id}</span>,
                email: <span className="font-medium text-slate-900 dark:text-slate-100">{t.email ?? "-"}</span>,
                issue: <span className="text-slate-600 dark:text-slate-400 line-clamp-1">{t.issue ?? "-"}</span>,
                status: (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                        t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                        t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                        {t.status === "pending" ? "Pending" : 
                         t.status === "in_progress" ? "In progress" : 
                         t.status === "resolved" ? "Resolved" : t.status ?? "-"}
                    </span>
                ),
                createdAt: t.createdAt
                    ? <span className="text-slate-500 text-xs">{new Date(t.createdAt).toLocaleString()}</span>
                    : "-",
                actions: (
                    <div className="flex items-center gap-3 justify-end">
                        <select
                            value={t.status}
                            disabled={isUpdating}
                            onChange={async (e) => {
                                const newStatus = e.target.value;
                                if (!newStatus || newStatus === t.status)
                                    return;
                                try {
                                    await updateHelp({
                                        id: t.id,
                                        status: newStatus,
                                    }).unwrap();
                                } catch {
                                    // ignore; no toast here
                                }
                            }}
                            className="h-8 pl-2 pr-8 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer outline-none"
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In progress</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(`/superadmin/support/${t.id}`)
                            }
                            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            View
                        </button>
                    </div>
                ),
            })),
        [tickets, updateHelp, isUpdating, navigate]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MessageSquare className="w-64 h-64 -rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Support</h1>
                    <p className="text-violet-100 text-lg">
                        Monitor support volume, prioritize high-impact tickets and coordinate across all connected stores.
                    </p>
                </div>
            </div>

            {/* Support tickets table */}
            <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Recent support tickets
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Showing tickets from backend `help` API. Update status directly from this table.
                        </p>
                    </div>
                </div>
                <div className="p-0">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-4"
                        total={tickets.length}
                        isLoading={isLoading}
                        searchable={true}
                        searchPlaceholder="Search by ticket email or issue..."
                        headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSupportPage;

