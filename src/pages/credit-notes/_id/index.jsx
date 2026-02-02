import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  User,
  Printer,
  Download,
  Trash2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGetCreditNoteQuery,
  useDeleteCreditNoteMutation,
} from "@/features/credit-note/creditNoteApiSlice";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

const CreditNoteDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);

  const { data: note, isLoading } = useGetCreditNoteQuery({
    id: parseInt(id),
    companyId: authUser?.companyId,
  });

  const [deleteCreditNote] = useDeleteCreditNoteMutation();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this credit note?")) {
      try {
        await deleteCreditNote({
          id: parseInt(id),
          companyId: authUser?.companyId,
        }).unwrap();
        toast.success("Credit note deleted successfully");
        navigate("/credit-notes");
      } catch (err) {
        toast.error("Failed to delete credit note");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f14]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#976DF7]"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-[#0b0f14] gap-4">
        <FileText className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Credit Note Not Found
        </h2>
        <Button onClick={() => navigate("/credit-notes")}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 bg-gray-50 dark:bg-[#0b0f14] min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 max-w-5xl mx-auto gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/credit-notes")}
            className="rounded-xl bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2c323c] transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {note.creditNoteNumber}
              </h1>
              <Badge
                className={`
                ${
                  note.status === "Paid"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : note.status === "Pending"
                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }
              `}
              >
                {note.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Created on{" "}
              {format(new Date(note.createdAt), "dd MMM yyyy, hh:mm a")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-white dark:bg-[#1a1f26]"
          >
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-white dark:bg-[#1a1f26]"
          >
            <Download className="w-4 h-4" /> Download
          </Button>
          <Button
            variant="destructive"
            className="gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-900"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Customer & Invoice */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#976DF7]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-[#976DF7]" /> Customer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900 dark:text-white text-lg">
                  {note.customer?.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {note.customer?.email}
                </p>
                <p className="text-sm text-gray-500">{note.customer?.phone}</p>
              </div>

              {note.relatedInvoice && (
                <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Related Invoice
                  </p>
                  <p
                    className="font-bold text-[#976DF7] text-lg cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/invoices/${note.relatedInvoice.id}`)
                    }
                  >
                    {note.relatedInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Invoice Amount: ${note.relatedInvoice.total}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Reason */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Reason for Return
            </h3>
            <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 text-gray-700 dark:text-gray-300 leading-relaxed">
              {note.reason || "No reason provided."}
            </div>
          </div>
        </div>

        {/* Sidebar: Financials */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#976DF7] to-[#7c3aed] rounded-2xl p-6 text-white shadow-lg shadow-[#976DF7]/25 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-purple-100 font-medium mb-1">Refund Amount</p>
              <h2 className="text-4xl font-bold tracking-tight">
                ${Number(note.amount).toLocaleString()}
              </h2>

              <div className="mt-6 pt-6 border-t border-white/20 flex items-center justify-between">
                <span className="text-purple-100 text-sm">Payment Mode</span>
                <span className="font-bold flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                  <CreditCard className="w-4 h-4" /> {note.paymentMode}
                </span>
              </div>
            </div>

            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
          </div>

          {/* Timeline / Activity (Placeholder) */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-xs">
              Activity
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-[#976DF7]"></div>
                  <div className="w-0.5 h-full bg-gray-100 dark:bg-gray-800 mx-auto mt-1"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Credit Note Created
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(note.createdAt), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${note.status === "Paid" ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"}`}
                  ></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Status Updated to {note.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(
                      new Date(note.updatedAt || note.createdAt),
                      "MMM dd, yyyy HH:mm",
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteDetailsPage;
