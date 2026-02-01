import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Mail, 
  Edit3,
  Calendar,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useGetSaleInvoiceQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { format } from "date-fns";

const SaleInvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: invoice, isLoading, error } = useGetSaleInvoiceQuery({ 
    id, 
    companyId: authUser?.companyId 
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7c3aed]" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/10 text-red-500">
          <FileText className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <Button onClick={() => navigate("/invoices")}>Back to Invoices</Button>
      </div>
    );
  }

  const formatCurrency = (amt) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: invoice.currency || 'BDT' 
  }).format(amt);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f14] p-4 lg:p-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/invoices")}
            className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Invoice (Admin)
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" size="sm" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white" size="sm">
            View Details
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Main Invoice Card */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden relative">
          
          {/* Top Decorative Banner */}
          <div className="relative h-48 w-full overflow-hidden bg-white dark:bg-[#1a1f26]">
             <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-purple-100/50 to-transparent dark:from-purple-900/10" />
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
             <div className="absolute top-0 right-0 p-12 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white shadow-lg">
                   <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Kanakku</span>
             </div>
             
             <div className="absolute top-0 left-0 p-12">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white uppercase tracking-tight">Invoice</h1>
                <p className="text-gray-900 dark:text-gray-300 font-bold mt-2">Dreams Technologies Pvt Ltd.,</p>
                <p className="text-sm text-gray-500">15 Hodges Mews, HP12 3JL, United Kingdom</p>
             </div>

             {/* Status Stamp */}
             {invoice.status?.toLowerCase() !== 'paid' && (
               <div className="absolute top-12 left-1/2 -ml-16 transform -rotate-12 border-4 border-red-500/30 text-red-500/40 text-xs font-black px-4 py-1 rounded-lg uppercase tracking-widest flex flex-col items-center">
                  <span>NOT</span>
                  <span>PAID</span>
                  <div className="absolute inset-x-0 bottom-0 h-px bg-red-500/20" />
               </div>
             )}
          </div>

          <div className="px-12 pb-12 space-y-12">
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-base">Invoice Details</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex gap-2">
                      <span className="text-gray-500">Invoice number :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500">Issued On :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{format(new Date(invoice.createdAt), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-gray-500">Due Date :</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '31 Jan 2025'}</span>
                    </div>
                    {invoice.recurring && (
                      <div className="flex gap-2">
                        <span className="text-gray-500">Recurring Invoice :</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{invoice.recurringInterval || 'Monthly'}</span>
                      </div>
                    )}
                    <div className="mt-2">
                       <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">Due in 8 days</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-base">Billing From</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-gray-800 dark:text-gray-200">Kanakku Invoice Management</p>
                    <p className="text-gray-500">15 Hodges Mews, HP12 3JL, United Kingdom</p>
                    <p className="text-gray-500">Phone : +1 54664 75945</p>
                    <p className="text-gray-500">Email : info@example.com</p>
                    <p className="text-gray-500">GST : 243E45767889</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-gray-900 dark:text-white font-bold text-base">Billing To</h4>
                  <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-4 border border-gray-100 dark:border-gray-800 flex items-start gap-4">
                     <div className="w-10 h-10 rounded-lg bg-[#1a1f26] text-white flex items-center justify-center font-bold text-lg">
                        T
                     </div>
                     <div className="space-y-1 text-sm flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">{invoice.customer?.name || 'Timesquare Tech'}</p>
                        <p className="text-gray-500 text-xs truncate">299 Star Trek Drive, Florida, 3240, USA</p>
                        <p className="text-gray-500 text-xs">Phone : +1 54664 75945</p>
                        <p className="text-gray-500 text-xs">Email : info@example.com</p>
                        <p className="text-gray-500 text-xs">GST : 243E45767889</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Table Section */}
            <div className="space-y-4">
               <h4 className="text-gray-900 dark:text-white font-bold text-base">Product / Service Items</h4>
               <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-900 dark:bg-black">
                        <th className="py-4 px-4 text-left text-xs font-bold text-white uppercase w-[50px]">#</th>
                        <th className="py-4 px-4 text-left text-xs font-bold text-white uppercase">Product/Service</th>
                        <th className="py-4 px-4 text-center text-xs font-bold text-white uppercase">Quantity</th>
                        <th className="py-4 px-4 text-center text-xs font-bold text-white uppercase">Unit</th>
                        <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">Rate</th>
                        <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">Discount</th>
                        <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">Tax</th>
                        <th className="py-4 px-4 text-right text-xs font-bold text-white uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invoice.items?.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-sm font-medium text-gray-500">{idx + 1}</td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                          </td>
                          <td className="py-4 px-4 text-center text-sm font-medium text-gray-500">{item.quantity}</td>
                          <td className="py-4 px-4 text-center text-sm font-medium text-gray-500">{item.unit || 'Pcs'}</td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">{formatCurrency(item.rate)}</td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">{item.discount || 0}%</td>
                          <td className="py-4 px-4 text-right text-sm font-medium text-gray-500">{item.tax || 0}%</td>
                          <td className="py-4 px-4 text-right font-bold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* Bottom Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <div className="flex gap-6 items-start">
                     {/* QR Code Placeholder */}
                     <div className="p-2 bg-white dark:bg-white/10 rounded-lg border border-gray-100 dark:border-gray-800 shrink-0">
                        <div className="w-24 h-24 bg-gray-50 dark:bg-black/40 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
                           <div className="text-[10px] text-gray-400 font-bold uppercase text-center px-1">Scan to the pay</div>
                        </div>
                     </div>
                     <div className="flex-1 space-y-4 pt-2">
                        <h4 className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-wider">Bank Details</h4>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                          <div className="flex gap-2">
                            <span className="text-gray-400">Bank Name :</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">ABC Bank</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-400">Account Number :</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">782459739212</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-400">IFSC Code :</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">ABC0001345</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-400">Payment Reference :</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300">{invoice.invoiceNumber}</span>
                          </div>
                        </div>
                     </div>
                  </div>
                  
                  <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Terms and Conditions</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed italic">
                        {invoice.termsAndConditions || 'The Payment must be returned in the same condition.'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">Notes</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed italic">
                         {invoice.notes || 'All charges are final and include applicable taxes, fees, and additional costs'}
                      </p>
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-400 font-bold">Amount</span>
                        <span className="font-black text-gray-900 dark:text-white">{formatCurrency(invoice.subTotal)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-400 font-bold">CGST (9%)</span>
                        <span className="font-black text-gray-900 dark:text-white">{formatCurrency(invoice.subTotal * 0.09)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-400 font-bold">SGST (9%)</span>
                        <span className="font-black text-gray-900 dark:text-white">{formatCurrency(invoice.subTotal * 0.09)}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-red-500 font-bold">Discount (25%)</span>
                        <span className="font-black text-red-500">-{formatCurrency(invoice.discountTotal || 0)}</span>
                     </div>
                  </div>
                  
                  <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-800 mt-6 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Total (USD)</span>
                        <span className="text-3xl font-black text-[#7c3aed]">{formatCurrency(invoice.totalAmount)}</span>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total In Words</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium italic">Five Hundred & Ninety Six Dollars</p>
                     </div>
                  </div>

                  <div className="pt-12 flex flex-col items-end gap-2">
                      <div className="h-16 w-32 relative">
                         <p className="text-2xl font-cursive text-gray-800 dark:text-white/80 opacity-60 italic">Ted M. Davis</p>
                         <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gray-900 dark:bg-white/20" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Ted M. Davis</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Manager</p>
                      </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Bottom Decorative Banner */}
          <div className="relative h-24 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 overflow-hidden px-12 flex items-center justify-between">
              <div className="absolute right-0 top-0 h-full w-[40%] bg-gradient-to-l from-[#7c3aed]/5 to-transparent" />
              <div className="space-y-1 relative z-10">
                 <p className="text-xs font-black text-gray-900 dark:text-white uppercase">Dreams Technologies Pvt Ltd.,</p>
                 <p className="text-[10px] text-gray-400">15 Hodges Mews, High Wycombe HP12 3JL, United Kingdom</p>
              </div>
              <div className="flex items-center gap-2 relative z-10">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#3b82f6] flex items-center justify-center text-white scale-75">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                 </div>
                 <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Kanakku</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceDetailsPage;
