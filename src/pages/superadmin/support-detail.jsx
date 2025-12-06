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

      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
        {isLoading && <p className="text-sm">Loading ticket…</p>}

        {!isLoading && !ticket && (
          <p className="text-sm text-red-500">
            Ticket not found or no longer available.
          </p>
        )}

        {!isLoading && ticket && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Ticket ID
                </p>
                <p className="font-semibold">#{ticket.id}</p>
              </div>
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Email
                </p>
                <p className="font-medium break-all">
                  {ticket.email ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Status
                </p>
                <p className="font-medium capitalize">
                  {ticket.status?.replace("_", " ") ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">
                  Created at
                </p>
                <p className="font-medium">
                  {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>
              {ticket.companyId && (
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Company ID
                  </p>
                  <p className="font-medium">{ticket.companyId}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-black/60 dark:text-white/60">
                Issue
              </p>
              <div className="border border-black/10 dark:border-white/10 rounded-lg p-3 bg-black/5 dark:bg-white/5 text-xs whitespace-pre-wrap">
                {ticket.issue ?? "-"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSupportDetailPage;








