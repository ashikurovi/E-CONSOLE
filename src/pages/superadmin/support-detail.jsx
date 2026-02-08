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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Support ticket detail</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Review the full context of a single support request.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/superadmin/support")}
        >
          Back to list
        </Button>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
        {isLoading && <p className="text-sm">Loading ticket…</p>}

        {!isLoading && !ticket && (
          <p className="text-sm text-red-500">
            Ticket not found or no longer available.
          </p>
        )}

        {!isLoading && ticket && (
          <div className="space-y-6 text-sm">
            {/* Ticket Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Ticket Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Ticket ID
                  </label>
                  <p className="font-semibold">#{ticket.id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Email
                  </label>
                  <p className="font-medium break-all">
                    {ticket.email ?? "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    ticket.status === 'resolved' 
                      ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                      : ticket.status === 'closed'
                      ? "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                      : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                  }`}>
                    {ticket.status?.replace("_", " ") ?? "-"}
                  </span>
                </div>
                {ticket.companyId && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                      Company ID
                    </label>
                    <p className="font-medium">{ticket.companyId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Issue Description
                </h3>
              </div>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-4 bg-black/5 dark:bg-white/5">
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {ticket.issue ?? "-"}
                </p>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Timeline
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                    Created At
                  </label>
                  <p className="text-xs font-medium">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {ticket.updatedAt && (
                  <div>
                    <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">
                      Last Updated
                    </label>
                    <p className="text-xs font-medium">
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









