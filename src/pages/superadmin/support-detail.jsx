import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetHelpQuery } from "@/features/help/helpApiSlice";
import { Button } from "@/components/ui/button";

const SuperAdminSupportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);

  const { data: tickets = [], isLoading } = useGetHelpQuery();

  const ticket = useMemo(
    () => tickets.find((t) => String(t.id) === String(numericId)),
    [tickets, numericId]
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Support Ticket Detail</h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Review the full context of a single support request.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/superadmin/support")}
            className="bg-white text-violet-600 hover:bg-violet-50 border-0 shadow-lg shadow-black/10"
          >
            Back to list
          </Button>
        </div>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
        {isLoading && <p className="text-sm text-slate-500">Loading ticket…</p>}

        {!isLoading && !ticket && (
          <p className="text-sm text-rose-500">
            Ticket not found or no longer available.
          </p>
        )}

        {!isLoading && ticket && (
          <div className="space-y-6 text-sm">
            {/* Ticket Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Ticket Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Ticket ID
                  </label>
                  <p className="font-semibold text-slate-900 dark:text-white">#{ticket.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Email
                  </label>
                  <p className="font-medium break-all text-slate-900 dark:text-white">
                    {ticket.email ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    ticket.status === 'resolved' 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : ticket.status === 'closed'
                      ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {ticket.status?.replace("_", " ") ?? "-"}
                  </span>
                </div>
                {ticket.companyId && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Company ID
                    </label>
                    <p className="font-medium text-slate-900 dark:text-white">{ticket.companyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Issue Description
                </h3>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
                  {ticket.issue ?? "-"}
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wide">
                  Timeline
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                    Created At
                  </label>
                  <p className="text-xs font-medium text-slate-900 dark:text-white">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {ticket.updatedAt && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Last Updated
                    </label>
                    <p className="text-xs font-medium text-slate-900 dark:text-white">
                      {new Date(ticket.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSupportDetailPage;









