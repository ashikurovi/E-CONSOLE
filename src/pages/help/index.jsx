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
    ],
    []
  );

  const tableData = useMemo(
    () =>
      tickets.map((t) => {
        const currentStatus = STATUS_OPTIONS.find((s) => s.value === t.status) || STATUS_OPTIONS[0];
        return {
          id: t.id,
          email: t.email,
          issue: (t.issue?.length > 120 ? `${t.issue.slice(0, 120)}…` : t.issue) || "-",
          status: currentStatus?.label || t("help.pending"),
          createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        };
      }),
    [tickets, t]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
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