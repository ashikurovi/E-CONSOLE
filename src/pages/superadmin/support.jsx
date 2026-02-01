import React, { useMemo } from "react";
import ReusableTable from "@/components/table/reusable-table";
import {
    useGetSuperadminHelpQuery,
    useUpdateSuperadminHelpMutation,
} from "@/features/superadmin/superadminApiSlice";
import { useNavigate } from "react-router-dom";

const SuperAdminSupportPage = () => {
    const navigate = useNavigate();
    const { data: tickets = [], isLoading } = useGetSuperadminHelpQuery();
    const [updateHelp, { isLoading: isUpdating }] = useUpdateSuperadminHelpMutation();

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
                id: t.id,
                email: t.email ?? "-",
                issue: t.issue ?? "-",
                status:
                    t.status === "pending"
                        ? "Pending"
                        : t.status === "in_progress"
                            ? "In progress"
                            : t.status === "resolved"
                                ? "Resolved"
                                : t.status ?? "-",
                createdAt: t.createdAt
                    ? new Date(t.createdAt).toLocaleString()
                    : "-",
                actions: (
                    <div className="flex items-center gap-2 justify-end">
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
                                        body: { status: newStatus },
                                    }).unwrap();
                                } catch {
                                    // ignore; no toast here
                                }
                            }}
                            className="border rounded px-2 py-1 text-xs bg-transparent"
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
                            className="text-xs px-3 py-1 rounded border border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                        >
                            View
                        </button>
                    </div>
                ),
            })),
        [tickets, updateHelp, isUpdating]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
                <h1 className="text-2xl font-semibold">Support</h1>
                <p className="text-sm text-black/60 dark:text-white/60">
                    Monitor support volume, prioritize high-impact tickets and
                    coordinate across all connected stores.
                </p>
            </div>

            {/* Support tickets table */}
            <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium">
                            Recent support tickets
                        </h2>
                        <p className="text-xs text-black/60 dark:text-white/60">
                            Showing tickets from backend `help` API. Update
                            status directly from this table.
                        </p>
                    </div>
                </div>
                <div className="p-4">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-3"
                        total={tickets.length}
                        isLoading={isLoading}
                        searchable={true}
                        searchPlaceholder="Search by ticket email or issue..."
                    />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSupportPage;

