import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Layout,
  Inbox,
  FileText,
  Settings,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetHelpQuery } from "@/features/help/helpApiSlice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Mock Data & Helpers ---

const CATEGORIES = [
  {
    id: "billing",
    label: "Billing",
    icon: FileText,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: "technical",
    label: "Technical Issue",
    icon: Settings,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
  },
  {
    id: "account",
    label: "Account & Login",
    icon: User,
    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  },
  {
    id: "subscription",
    label: "Subscription",
    icon: Zap,
    color: "text-green-500 bg-green-50 dark:bg-green-900/20",
  },
];

const PRIORITIES = [
  {
    id: "urgent",
    label: "Urgent",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20",
  },
  {
    id: "high",
    label: "High",
    color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
  },
  {
    id: "medium",
    label: "Medium",
    color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20",
  },
  {
    id: "low",
    label: "Low",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20",
  },
];

const STATUSES = [
  {
    id: "open",
    label: "Open",
    color:
      "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
  },
  {
    id: "pending",
    label: "Pending",
    color:
      "text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800",
  },
  {
    id: "resolved",
    label: "Resolved",
    color:
      "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
  },
  {
    id: "escalated",
    label: "Escalated",
    color:
      "text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800",
  },
];

const MOCK_AI_DATA = {
  confidence: 92,
  summary:
    "Customer was charged twice for the same transaction on their credit card.",
  resolution: [
    "Verify the duplicate transaction in system.",
    "Check if both charges were processed successfully.",
    "Initiate refund for the duplicate charge.",
    "Send confirmation email with refund timeline.",
  ],
  kbRefs: [
    { title: "Duplicate Payment Handling", id: "KB-3041" },
    { title: "Refund Process", id: "KB-1872" },
  ],
};

// --- Components ---

function StatusBadge({ status }) {
  const style =
    STATUSES.find((s) => s.id === status?.toLowerCase()) || STATUSES[0];
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        style.color,
      )}
    >
      {style.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const style =
    PRIORITIES.find((p) => p.id === priority?.toLowerCase()) || PRIORITIES[2]; // Default Medium
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          style.color.split(" ")[0].replace("text-", "bg-"),
        )}
      />
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {style.label}
      </span>
    </div>
  );
}

function HelpPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const authUser = useSelector((state) => state.auth.user);

  // State
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeView, setActiveView] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Data Fetching
  const { data: tickets = [], isLoading } = useGetHelpQuery({
    companyId: authUser?.companyId,
  });

  // Enrich Data (Mocking missing fields for design)
  const enrichedTickets = useMemo(() => {
    return tickets.map((t, i) => ({
      ...t,
      // Ensure ID is a string to prevent slice errors
      id: String(t.id),
      // Mock fields if missing
      category: t.category || CATEGORIES[i % CATEGORIES.length].label,
      priority: t.priority || PRIORITIES[i % PRIORITIES.length].id,
      aiData: MOCK_AI_DATA, // Attach mock AI data to all for demo
    }));
  }, [tickets]);

  // Filtering
  const filteredTickets = useMemo(() => {
    let result = enrichedTickets;

    if (activeView !== "all") {
      result = result.filter((t) => t.status?.toLowerCase() === activeView);
    }

    if (searchTerm) {
      result = result.filter(
        (t) =>
          t.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return result;
  }, [enrichedTickets, activeView, searchTerm]);

  // Select first ticket by default on load
  useEffect(() => {
    if (!selectedTicketId && enrichedTickets.length > 0) {
      setSelectedTicketId(enrichedTickets[0].id);
    }
  }, [enrichedTickets, selectedTicketId]);

  const selectedTicket = useMemo(
    () => enrichedTickets.find((t) => t.id === selectedTicketId),
    [enrichedTickets, selectedTicketId],
  );

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-gray-50/50 dark:bg-[#0B1120] overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* --- Left Sidebar: Filters --- */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Tickets
            </h2>
          </div>

          <div className="space-y-6">
            {/* Views Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                <span>Views</span>
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded text-[10px]">
                  {tickets.length}
                </span>
              </div>
              <div className="space-y-1">
                {[
                  { id: "all", label: "All Tickets", icon: Layout },
                  { id: "open", label: "Open", icon: Inbox },
                  { id: "pending", label: "Pending", icon: Clock },
                  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
                ].map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      activeView === view.id
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <view.icon className="w-4 h-4" />
                      {view.label}
                    </div>
                    {view.id === "all" && (
                      <span className="text-xs font-semibold bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 px-2 py-0.5 rounded-full">
                        {tickets.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                <span>Categories</span>
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    <cat.icon className="w-4 h-4 opacity-70" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Middle: Ticket List --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/50 dark:bg-[#111827]/50">
        {/* Header */}
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#1a1f26]">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            {activeView === "all"
              ? "All Tickets"
              : activeView.charAt(0).toUpperCase() + activeView.slice(1)}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800 border-none text-sm focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-9 gap-2 text-gray-600"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/help/create")}
              className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
            >
              New Ticket
            </Button>
          </div>
        </div>

        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Issue Title</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-3 text-right">Status</div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading tickets...
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                layoutId={`ticket-${ticket.id}`}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  "grid grid-cols-12 gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent items-center group",
                  selectedTicketId === ticket.id
                    ? "bg-white dark:bg-[#1a1f26] shadow-md border-gray-100 dark:border-gray-700 relative z-10"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/50",
                )}
              >
                <div className="col-span-1 text-xs font-medium text-gray-400 text-center">
                  {ticket.id.slice(0, 6)}
                </div>
                <div className="col-span-5">
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate pr-4 text-sm">
                    {ticket.issue}
                  </div>
                </div>
                <div className="col-span-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {ticket.category}
                  </span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <StatusBadge status={ticket.status} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination (Visual only for now) */}
        <div className="h-12 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 bg-white dark:bg-[#1a1f26]">
          <span className="text-xs text-gray-500">
            Showing {filteredTickets.length} tickets
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-blue-50 text-blue-600"
            >
              <span className="text-xs">1</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <span className="text-xs">2</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <span className="text-xs">...</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Right: Ticket Details --- */}
      {selectedTicket && (
        <div className="w-[400px] flex-shrink-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] flex flex-col overflow-y-auto">
          {/* Details Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1a1f26] z-20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  #{selectedTicket.id.slice(0, 6)}
                </span>
                <StatusBadge status={selectedTicket.status} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {selectedTicket.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedTicket.email}
                </div>
                <div className="text-xs text-gray-500">Customer</div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-blue-600 bg-blue-50 dark:bg-blue-900/20 h-8 w-8 rounded-full"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </div>

            {/* AI Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Summary
                </span>
              </div>

              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                {selectedTicket.aiData.summary}
              </h3>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Confidence score</span>
                  <span className="font-bold text-blue-600">
                    {selectedTicket.aiData.confidence}%
                  </span>
                </div>
                <div className="h-2 w-full bg-white dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedTicket.aiData.confidence}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Suggested Resolution */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Suggested Resolution
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 mb-3">
                  Step-by-step recommended response
                </p>
                <ul className="space-y-3">
                  {selectedTicket.aiData.resolution.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{step}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  {selectedTicket.aiData.kbRefs.map((kb, i) => (
                    <a
                      key={i}
                      href="#"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                    >
                      <FileText className="w-3 h-3" />
                      {kb.id}: {kb.title}
                    </a>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs h-8"
                  >
                    Edit Draft
                  </Button>
                  <Button
                    size="sm"
                    className="w-full text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Apply Reply
                  </Button>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Activity Timeline
              </h4>
              <div className="relative pl-4 border-l border-gray-200 dark:border-gray-800 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-blue-500 border-2 border-white dark:border-[#1a1f26]" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Assigned to John Doe
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Today, 10:45 AM
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-purple-500 border-2 border-white dark:border-[#1a1f26]" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    AI generated summary
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Today, 10:32 AM
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-0 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-[#1a1f26]" />
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Ticket created
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Today, 10:30 AM
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 flex justify-center">
              <Button
                variant="destructive"
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
              >
                Remove Ticket
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HelpPage;
