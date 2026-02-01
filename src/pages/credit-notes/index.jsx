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
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGetCreditNotesQuery, useDeleteCreditNoteMutation } from "@/features/credit-note/creditNoteApiSlice";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

/**
 * CreditNotesPage Component
 * Renders a list of sales returns (credit notes) matching the Kanakku design.
 */
const CreditNotesPage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  // API State
  const { data: creditNotes, isLoading } = useGetCreditNotesQuery(authUser?.companyId);
  const [deleteCreditNote] = useDeleteCreditNoteMutation();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  /**
   * Handle deletion of a credit note
   */
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this credit note?")) {
      try {
        await deleteCreditNote({ id, companyId: authUser?.companyId }).unwrap();
        toast.success("Credit note deleted successfully");
      } catch (err) {
        toast.error("Failed to delete credit note");
      }
    }
  };

  /**
   * Filter credit notes based on search and status
   */
  const filteredNotes = creditNotes?.filter((note) => {
    const matchesSearch = 
      note.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || note.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  /**
   * Helper to render status badge with specific colors
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <Badge className="bg-green-100/50 text-green-600 hover:bg-green-100 border-none flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Paid
          </Badge>
        );
      case "Pending":
        return (
          <Badge className="bg-orange-100/50 text-orange-600 hover:bg-orange-100 border-none flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
      case "Cancelled":
        return (
          <Badge className="bg-red-100/50 text-red-600 hover:bg-red-100 border-none flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50/50 dark:bg-[#0b0f14] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Notes (Sales Returns)</h1>
          <nav className="text-sm text-gray-500 flex items-center gap-2 mt-1">
             <span className="hover:text-[#7c3aed] cursor-pointer" onClick={() => navigate("/")}>Home</span>
             <span>/</span>
             <span className="text-gray-900 dark:text-gray-300">Credit Notes</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800 shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button 
            className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg shadow-purple-500/20"
            onClick={() => navigate("/credit-notes/create")}
          >
            <Plus className="w-4 h-4 mr-2" /> New Credit Notes
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#1a1f26] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            placeholder="Search by ID or Customer..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 border-gray-100 dark:border-gray-800">
          <Filter className="w-4 h-4 mr-2" /> Filter
        </Button>
        <div className="flex bg-gray-100 dark:bg-black/20 p-1 rounded-lg">
           <button className="p-2 rounded-md bg-white dark:bg-[#1a1f26] shadow-sm text-[#7c3aed]">
              <LayoutGrid className="w-4 h-4" />
           </button>
        </div>
      </div>

      {/* Credit Notes Table */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/10">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Credit Note ID</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Customer</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Related To</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Payment Mode</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Created On</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {isLoading ? (
                <tr>
                   <td colSpan="8" className="px-6 py-10 text-center text-gray-500">Loading credit notes...</td>
                </tr>
              ) : filteredNotes?.length === 0 ? (
                <tr>
                   <td colSpan="8" className="px-6 py-10 text-center text-gray-500">No credit notes found.</td>
                </tr>
              ) : (
                filteredNotes?.map((note) => (
                  <tr key={note.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-[#7c3aed] cursor-pointer hover:underline">
                      {note.creditNoteNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center font-bold text-xs">
                            {note.customer?.name?.charAt(0) || "C"}
                         </div>
                         <span className="font-medium text-gray-900 dark:text-gray-200">{note.customer?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                      ${Number(note.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {note.relatedInvoice ? (
                        <span className="text-[#3b82f6] hover:underline cursor-pointer">
                          {note.relatedInvoice.invoiceNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No Invoice</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 dark:text-gray-400">
                      {note.paymentMode}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {format(new Date(note.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(note.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-[#7c3aed]" onClick={() => navigate(`/credit-notes/${note.id}`)}>
                             <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500" onClick={() => handleDelete(note.id)}>
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

        {/* Pagination Footer (Simulated) */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-black/10">
           <div className="text-sm text-gray-500">
              Showing <span className="font-bold">{filteredNotes?.length || 0}</span> Results
           </div>
           <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>&lt;</Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 bg-[#7c3aed] text-white">1</Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>&gt;</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNotesPage;
