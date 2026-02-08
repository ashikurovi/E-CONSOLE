import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetHelpQuery, useGetHelpStatsQuery } from "@/features/help/helpApiSlice";
import TicketListView from "@/pages/help/components/TicketListView";

const TAB_TO_STATUS = {
  active: ["pending", "in_progress"],
  open: ["pending"],
  pending: ["pending"],
  "on hold": ["in_progress"],
  closed: ["resolved"],
};

function HelpPage() {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const companyId = authUser?.companyId;
  const { data: apiTickets = [], isLoading } = useGetHelpQuery({ companyId });
  const { data: stats, isLoading: statsLoading } = useGetHelpStatsQuery({ companyId }, { skip: !companyId });

  const [activeTab, setActiveTab] = useState("active");

  // Map API tickets and filter by active tab
  const filteredTickets = useMemo(() => {
    const mapped = (apiTickets || []).map((t) => ({
      ...t,
      subject: t.issue,
      priority: t.priority ?? "medium",
      status: t.status ?? "pending",
    }));
    const statuses = TAB_TO_STATUS[activeTab];
    if (!statuses) return mapped;
    return mapped.filter((t) => statuses.includes(t.status));
  }, [apiTickets, activeTab]);

  const setActiveView = (view) => {
    if (view === "detail") return; // handled by setSelectedTicketId + navigate
    if (view === "create") navigate("/help/create");
    if (view === "list") navigate("/help");
  };

  const setSelectedTicketId = (id) => {
    if (id) navigate(`/help/${id}`);
  };

  const tabCounts = useMemo(
    () =>
      stats
        ? [
            { id: "active", label: "All Active", count: stats.active ?? 0 },
            { id: "open", label: "Open", count: stats.pending ?? 0 },
            { id: "pending", label: "Pending", count: stats.pending ?? 0 },
            { id: "on hold", label: "On Hold", count: stats.in_progress ?? 0 },
            { id: "closed", label: "Closed", count: stats.resolved ?? 0 },
          ]
        : [],
    [stats]
  );

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8 flex items-center justify-center min-h-[320px]">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading tickets…</div>
      </div>
    );
  }

  return (
    <TicketListView
      setActiveView={setActiveView}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      filteredTickets={filteredTickets}
      setSelectedTicketId={setSelectedTicketId}
      stats={stats}
      tabCounts={tabCounts}
      statsLoading={statsLoading}
    />
  );
}
export default HelpPage;
