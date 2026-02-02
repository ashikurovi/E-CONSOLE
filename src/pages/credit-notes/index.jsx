import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Download,
  LayoutGrid,
  CreditCard,
  Clock,
  XCircle,
  CheckCircle2,
  Calendar,
  Eye,
  Trash2,
  FileText,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetCreditNotesQuery,
  useDeleteCreditNoteMutation,
} from "@/features/credit-note/creditNoteApiSlice";
import { useSelector } from "react-redux";
import {
  format,
  subMonths,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { toast } from "react-hot-toast";

/**
 * CreditNotesPage Component
 * Redesigned with dashboard style and gradients matching primary color #976DF7
 */
const CreditNotesPage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  // API State
  const { data: creditNotes = [], isLoading } = useGetCreditNotesQuery(
    authUser?.companyId,
  );
  const [deleteCreditNote] = useDeleteCreditNoteMutation();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const itemsPerPage = 5;

  /**
   * Handle deletion of a credit note
   */
  const confirmDelete = (note) => {
    setNoteToDelete(note);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!noteToDelete) return;

    try {
      await deleteCreditNote({
        id: noteToDelete.id,
        companyId: authUser?.companyId,
      }).unwrap();
      toast.success("Credit note deleted successfully");
      setDeleteModalOpen(false);
      setNoteToDelete(null);
    } catch (err) {
      toast.error("Failed to delete credit note");
      console.error("Delete error:", err);
    }
  };

  /**
   * Filter credit notes based on search and status
   */
  const filteredNotes = creditNotes?.filter((note) => {
    const matchesSearch =
      note.creditNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || note.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil((filteredNotes?.length || 0) / itemsPerPage);
  const paginatedNotes = filteredNotes?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  // Calculate Stats
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const thisMonthNotes = creditNotes.filter(
    (note) => new Date(note.createdAt) >= currentMonthStart,
  );

  const lastMonthNotes = creditNotes.filter((note) =>
    isWithinInterval(new Date(note.createdAt), {
      start: lastMonthStart,
      end: lastMonthEnd,
    }),
  );

  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // 1. Total Credit Notes Trend
  const totalNotesTrend = calculateTrend(
    thisMonthNotes.length,
    lastMonthNotes.length,
  );

  // 2. Pending Refunds Trend (Newly created pending notes)
  const thisMonthPending = thisMonthNotes.filter(
    (n) => n.status === "Pending",
  ).length;
  const lastMonthPending = lastMonthNotes.filter(
    (n) => n.status === "Pending",
  ).length;
  const pendingTrend = calculateTrend(thisMonthPending, lastMonthPending);

  // 3. Total Refunded Amount Trend
  const thisMonthAmount = thisMonthNotes.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0,
  );
  const lastMonthAmount = lastMonthNotes.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0,
  );
  const amountTrend = calculateTrend(thisMonthAmount, lastMonthAmount);

  // 4. Successful Refunds Trend
  const thisMonthPaid = thisMonthNotes.filter(
    (n) => n.status === "Paid",
  ).length;
  const lastMonthPaid = lastMonthNotes.filter(
    (n) => n.status === "Paid",
  ).length;
  const paidTrend = calculateTrend(thisMonthPaid, lastMonthPaid);

  const totalAmount = creditNotes.reduce(
    (acc, curr) => acc + Number(curr.amount || 0),
    0,
  );
  const pendingCount = creditNotes.filter((n) => n.status === "Pending").length;
  const paidCount = creditNotes.filter((n) => n.status === "Paid").length;
  const cancelledCount = creditNotes.filter(
    (n) => n.status === "Cancelled",
  ).length;

  const stats = [
    {
      label: "Total Credit Notes",
      value: creditNotes.length,
      trend: `${totalNotesTrend > 0 ? "+" : ""}${totalNotesTrend.toFixed(1)}%`,
      trendDir: totalNotesTrend >= 0 ? "up" : "down",
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      wave: "text-blue-500",
    },
    {
      label: "Pending Refunds",
      value: pendingCount,
      trend: `${pendingTrend > 0 ? "+" : ""}${pendingTrend.toFixed(1)}%`,
      trendDir: pendingTrend >= 0 ? "neutral" : "up", // Less pending is usually better? Or neutral since it's "Action Required"?
      // Let's keep it consistent: More pending = "neutral" (Action Required), Less pending = "up" (Good)?
      // Actually, standard is: Increase = up arrow. Whether it's good or bad depends on context.
      // But here the code uses `trendDir` to color the badge.
      // Existing code: trendDir === "up" ? green : trendDir === "down" ? red : gray.
      // For Pending: If pending increases, it might be "bad" (red) or "action required" (gray).
      // Let's set it dynamically based on value.
      trendDir:
        pendingTrend === 0 ? "neutral" : pendingTrend > 0 ? "down" : "up",
      // If pending increased (down/red), if pending decreased (up/green).
      // Wait, "down" maps to red in the UI code below?
      // Check UI: trendDir === "up" ? green : trendDir === "down" ? red.
      // So if Pending INCREASES, we want RED (down)? Or usually "Growth" is green?
      // Let's stick to: Increase = Green (up), Decrease = Red (down) strictly for the arrow direction.
      // But semantically, more pending work is bad.
      // Let's just follow the math: Increase = "up", Decrease = "down".
      trendDir: pendingTrend >= 0 ? "up" : "down",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      wave: "text-orange-500",
    },
    {
      label: "Total Refunded",
      value: `$${totalAmount.toLocaleString()}`,
      trend: `${amountTrend > 0 ? "+" : ""}${amountTrend.toFixed(1)}%`,
      trendDir: amountTrend >= 0 ? "up" : "down",
      icon: CreditCard,
      color: "text-pink-600",
      bg: "bg-pink-50 dark:bg-pink-900/20",
      wave: "text-pink-500",
    },
    {
      label: "Successful Refunds",
      value: paidCount,
      trend: `${paidTrend > 0 ? "+" : ""}${paidTrend.toFixed(1)}%`,
      trendDir: paidTrend >= 0 ? "up" : "down",
      icon: CheckCircle2,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      wave: "text-purple-500",
    },
  ];

  /**
   * Helper to render status badge with specific colors
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Pending
          </span>
        );
      case "Cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Credit Notes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage sales returns and refunds efficiently
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button
            className="bg-[#976DF7] hover:bg-[#8250e5] text-white shadow-lg shadow-[#976DF7]/25 transition-all transform hover:scale-105"
            onClick={() => navigate("/credit-notes/create")}
          >
            <Plus className="w-4 h-4 mr-2" /> Create Credit Note
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                {stat.label}
              </p>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                {stat.value}
              </h3>

              <div className="flex items-center gap-2">
                <span
                  className={`
                  inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md
                  ${
                    stat.trendDir === "up"
                      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : stat.trendDir === "down"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }
                `}
                >
                  {stat.trendDir === "up" && (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                  {stat.trendDir === "down" && (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.trend}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  vs last month
                </span>
              </div>
            </div>

            {/* Wave Graphic */}
            <div
              className={`absolute bottom-0 right-0 w-24 h-16 opacity-20 ${stat.wave}`}
            >
              <svg
                viewBox="0 0 100 60"
                fill="currentColor"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <path d="M0 60 C 20 60, 20 20, 50 20 C 80 20, 80 50, 100 50 L 100 60 Z" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        {/* Filter Toolbar */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30 dark:bg-gray-900/10">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#976DF7] transition-colors" />
            <input
              placeholder="Search by ID or Customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#976DF7]/20 focus:border-[#976DF7] transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              {["all", "Pending", "Paid", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`
                      px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                      ${
                        selectedStatus === status
                          ? "bg-white dark:bg-gray-700 text-[#976DF7] shadow-sm"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }
                    `}
                >
                  {status === "all" ? "All" : status}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Filter className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold text-xs">
              <tr>
                <th className="px-6 py-4">Credit Note ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Related Invoice</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#976DF7]"></div>
                      <p className="text-gray-500">Loading credit notes...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedNotes?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-50">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 font-medium">
                        No credit notes found matching your criteria
                      </p>
                      <Button
                        variant="link"
                        className="text-[#976DF7]"
                        onClick={() => {
                          setSearchTerm("");
                          setSelectedStatus("all");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedNotes?.map((note) => (
                  <tr
                    key={note.id}
                    className="group hover:bg-[#976DF7]/5 dark:hover:bg-[#976DF7]/10 transition-colors cursor-pointer"
                    onClick={() => navigate(`/credit-notes/${note.id}`)}
                  >
                    <td className="px-6 py-4 font-bold text-[#976DF7]">
                      {note.creditNoteNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#976DF7] to-[#7c3aed] text-white flex items-center justify-center font-bold text-xs shadow-md shadow-[#976DF7]/20">
                          {note.customer?.name?.charAt(0) || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-200">
                            {note.customer?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {note.customer?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                        ${Number(note.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {note.relatedInvoice ? (
                        <div
                          className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/invoices/${note.relatedInvoice.id}`);
                          }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {note.relatedInvoice.invoiceNumber}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          No Invoice
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {format(new Date(note.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(note.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-[#976DF7] hover:bg-[#976DF7]/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/credit-notes/${note.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(note);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30 dark:bg-gray-900/10">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredNotes?.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}
              -
              {Math.min(currentPage * itemsPerPage, filteredNotes?.length || 0)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {filteredNotes?.length || 0}
            </span>{" "}
            Results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    className={`h-9 w-9 p-0 rounded-lg font-medium transition-all
                        ${
                          currentPage === pageNum
                            ? "bg-[#976DF7] text-white shadow-md shadow-[#976DF7]/20 hover:bg-[#8250e5]"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </Button>
          </div>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Delete Credit Note
            </DialogTitle>
            <DialogDescription className="pt-3">
              Are you sure you want to delete credit note{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {noteToDelete?.creditNoteNumber}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              className="mt-2 sm:mt-0"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Credit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditNotesPage;
