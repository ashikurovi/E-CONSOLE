import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  useGetHelpQuery,
} from "@/features/help/helpApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function HelpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const STATUS_OPTIONS = useMemo(
    () => [
      { label: t("help.pending"), value: "pending" },
      { label: t("help.inProgress"), value: "in_progress" },
      { label: t("help.resolved"), value: "resolved" },
      { label: t("help.closed"), value: "closed" },
    ],
    [t]
  );
  const authUser = useSelector((state) => state.auth.user);
  const { data: tickets = [], isLoading } = useGetHelpQuery({ companyId: authUser?.companyId });

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Email", field: "email" },
      { header: "Issue", field: "issue" },
      { header: "Status", field: "status" },
      { header: "Created", field: "createdAt" },
      { header: t("common.actions") || "Actions", field: "actions", sortable: false },
    ],
    [t]
  );

  const tableData = useMemo(
    () =>
      tickets.map((ticket) => {
        const currentStatus = STATUS_OPTIONS.find((s) => s.value === ticket.status) || STATUS_OPTIONS[0];
        return {
          id: ticket.id,
          email: ticket.email,
          issue: (ticket.issue?.length > 120 ? `${ticket.issue.slice(0, 120)}…` : ticket.issue) || "-",
          status: currentStatus?.label || t("help.pending"),
          createdAt: ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : "-",
          actions: (
            <button
              type="button"
              onClick={() => navigate(`/help/${ticket.id}`)}
              className="text-xs px-3 py-1 rounded border border-primary/30 hover:bg-primary/10 text-primary font-medium"
            >
              {t("help.viewReply") || "View / Reply"}
            </button>
          ),
        };
      }),
    [tickets, t, navigate, STATUS_OPTIONS]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t("help.title")}</h3>
        <Button size="sm" onClick={() => navigate("/help/create")}>
          {t("help.createTicket")}
        </Button>
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={tickets.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default HelpPage;