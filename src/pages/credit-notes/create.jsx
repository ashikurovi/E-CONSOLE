import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Save, 
  X, 
  PlusCircle, 
  FileText,
  User as UserIcon,
  DollarSign,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateCreditNoteMutation } from "@/features/credit-note/creditNoteApiSlice";
import { useGetSaleInvoicesQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { useGetUsersQuery } from "@/features/user/userApiSlice";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";

/**
 * CreateCreditNotePage Component
 * Form to create a new Sales Return / Credit Note.
 */
const CreateCreditNotePage = () => {
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  
  // API Mutations and Queries
  const [createCreditNote, { isLoading }] = useCreateCreditNoteMutation();
  const { data: invoices } = useGetSaleInvoicesQuery(authUser?.companyId);
  const { data: users } = useGetUsersQuery({ companyId: authUser?.companyId });

  // Form State
  const [formData, setFormData] = useState({
    creditNoteNumber: `CN${Math.floor(Math.random() * 90000) + 10000}`,
    customerId: "",
    invoiceId: "",
    amount: "",
    paymentMode: "Cash",
    reason: "",
    status: "Pending"
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.amount) {
      toast.error("Please fill in the required fields");
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        customerId: parseInt(formData.customerId),
        invoiceId: formData.invoiceId ? parseInt(formData.invoiceId) : undefined,
        companyId: authUser?.companyId
      };

      await createCreditNote(payload).unwrap();
      toast.success("Credit note created successfully");
      navigate("/credit-notes");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create credit note");
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50/50 dark:bg-[#0b0f14] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Credit Note</h1>
            <p className="text-sm text-gray-500">Create a sales return record</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 space-y-8">
            
            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Credit Note ID (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#7c3aed]" /> Credit Note Number
                </label>
                <input 
                  value={formData.creditNoteNumber}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/20 text-gray-500 font-bold focus:outline-none"
                />
              </div>

              {/* Customer Selection */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[#7c3aed]" /> Customer <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all"
                  value={formData.customerId}
                  onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                  required
                >
                  <option value="">Select Customer</option>
                  {users?.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email || u.phone})</option>
                  ))}
                </select>
              </div>

              {/* Related Invoice (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Related Invoice</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all"
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({...formData, invoiceId: e.target.value})}
                >
                  <option value="">Select Invoice (Optional)</option>
                  {invoices?.map(inv => (
                    <option key={inv.id} value={inv.id}>{inv.invoiceNumber}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#7c3aed]" /> Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                   <input 
                     type="number"
                     placeholder="0.00"
                     className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all"
                     value={formData.amount}
                     onChange={(e) => setFormData({...formData, amount: e.target.value})}
                     required
                   />
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Mode</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all"
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({...formData, paymentMode: e.target.value})}
                >
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Initial Status</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Reason / Notes */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-[#7c3aed]" /> Reason for Return
                </label>
                <textarea 
                  placeholder="Explain the reason for this credit note..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1f26] focus:ring-2 focus:ring-[#7c3aed]/20 focus:outline-none transition-all h-32 resize-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                />
              </div>

            </div>
          </div>

          {/* Form Footer */}
          <div className="px-8 py-6 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
             <Button 
               type="button"
               variant="outline" 
               className="px-8 h-12 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 font-semibold transition-all"
               onClick={() => navigate(-1)}
             >
                <X className="w-4 h-4 mr-2" /> Cancel
             </Button>
             <Button 
               type="submit"
               disabled={isLoading}
               className="px-10 h-12 bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg shadow-purple-500/20 font-bold transition-all"
             >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Credit Note
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCreditNotePage;
