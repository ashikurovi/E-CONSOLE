import React, { useMemo } from "react";
import ReusableTable from "@/components/table/reusable-table";
import {
  useGetHelpQuery,
} from "@/features/help/helpApiSlice";
import HelpForm from "./components/HelpForm";
import { useSelector } from "react-redux";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

function HelpPage() {
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
          status: currentStatus?.label || "Pending",
          createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
        };
      }),
    [tickets]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Help & Support</h3>
        {/* Create form trigger */}
        <HelpForm />
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