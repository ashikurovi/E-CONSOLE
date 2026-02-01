import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Mail, 
  Edit3,
  Calendar,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSelector } from "react-redux";
import { useGetSaleInvoiceQuery } from "@/features/invoice/saleInvoiceApiSlice";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Invoice {invoice.invoiceNumber}
              </h1>
              <Badge className={getStatusColor(invoice.status)}>
                {invoice.status?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">Created on {format(new Date(invoice.createdAt), 'dd MMM yyyy')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
            <Mail className="w-4 h-4 mr-2" />
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Main Invoice Card */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[1000px] flex flex-col">
          
          {/* Top Banner-like Section */}
          <div className="p-8 lg:p-12 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start gap-8 bg-gray-50/50 dark:bg-black/10">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-[#7c3aed]/20">
                {invoice.companyName?.[0] || 'K'}
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">
                  {invoice.companyName || 'Your Company'}
                </h2>
                <p className="text-sm text-gray-500">Reg. No: 12345678</p>
              </div>
            </div>

            <div className="text-right space-y-2">
              <h1 className="text-4xl font-black text-[#7c3aed] tracking-tighter uppercase">Invoice</h1>
              <div className="text-sm space-y-1">
                <p className="font-bold dark:text-white">#{invoice.invoiceNumber}</p>
                <div className="flex items-center justify-end gap-2 text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 flex-1 space-y-12">
            
            {/* Bill To / From Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Billed By</p>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white uppercase">{invoice.companyName || 'Your Company'}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed italic block">
                    123 Business Avenue, Suite 100<br />
                    Dhaka, Bangladesh
                  </p>
                  <p className="text-sm text-gray-500">Email: billing@company.com</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Billed To</p>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 dark:text-white uppercase">
                    {invoice.customer?.name || invoice.customerName || 'Customer'}
                  </h4>
                  <p className="text-sm text-gray-500 leading-relaxed italic block">
                    Customer Address Line 1<br />
                    City, Country
                  </p>
                  <p className="text-sm text-gray-500">Email: {invoice.customer?.email || 'customer@email.com'}</p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Invoice Items</p>
               <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-900 dark:border-white">
                        <th className="py-4 text-left text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Item</th>
                        <th className="py-4 text-center text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Qty</th>
                        <th className="py-4 text-right text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Rate</th>
                        <th className="py-4 text-right text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Tax</th>
                        <th className="py-4 text-right text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invoice.items?.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-6">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{item.itemType || 'Product'}</p>
                          </td>
                          <td className="py-6 text-center text-sm font-medium text-gray-500">
                            {item.quantity} <span className="text-[10px] opacity-70">{item.unit || 'Unit'}</span>
                          </td>
                          <td className="py-6 text-right text-sm font-medium text-gray-500">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="py-6 text-right text-sm font-medium text-gray-500">
                            {item.tax || 0}%
                          </td>
                          <td className="py-6 text-right font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* Totals & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
              <div className="lg:col-span-7 space-y-8">
                {invoice.notes && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Notes</p>
                    <p className="text-sm text-gray-500 italic leading-relaxed py-2">
                       "{invoice.notes}"
                    </p>
                  </div>
                )}
                {invoice.termsAndConditions && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">Terms & Conditions</p>
                    <p className="text-sm text-gray-500 leading-relaxed py-2">
                       {invoice.termsAndConditions}
                    </p>
                  </div>
                )}
                
                {invoice.bankDetails && (
                  <div className="p-6 rounded-2xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="flex items-center gap-2 text-[#7c3aed]">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Bank Details</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Bank Name</p>
                        <p className="font-bold dark:text-white">HSBC Bank</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Account Name</p>
                        <p className="font-bold dark:text-white">{invoice.companyName || 'Adrian'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">Account Number</p>
                        <p className="font-bold dark:text-white">1234 5678 9012</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 text-[10px] font-bold uppercase">SWIFT Code</p>
                        <p className="font-bold dark:text-white">HSBCBDDH</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between">
                <div className="space-y-4 p-8 rounded-2xl bg-[#7c3aed]/5 border border-[#7c3aed]/10">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.subTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Tax</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(invoice.taxTotal)}</span>
                  </div>
                  {invoice.discountTotal > 0 && (
                    <div className="flex justify-between items-center text-sm text-red-500">
                      <span className="font-medium">Discount</span>
                      <span className="font-bold">-{formatCurrency(invoice.discountTotal)}</span>
                    </div>
                  )}
                  <div className="pt-4 mt-4 border-t-2 border-gray-900/10 flex justify-between items-center">
                    <span className="text-lg font-black uppercase tracking-tighter text-[#7c3aed]">Total Due</span>
                    <span className="text-2xl font-black text-[#7c3aed]">{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>

                <div className="pt-12 text-right space-y-4">
                  <div className="inline-block border-b-2 border-gray-900 dark:border-white pb-2 min-w-[200px]">
                     {invoice.signatureImage ? (
                        <img src={invoice.signatureImage} alt="Signature" className="h-16 ml-auto object-contain" />
                     ) : (
                        <p className="text-xl font-cursive text-gray-400 italic font-medium pt-8">Signature</p>
                     )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tighter">
                      {invoice.signatureName || 'Authorized Person'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Authorized Signatory</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-900 dark:bg-black text-center">
            <p className="text-xs text-white/50 font-bold tracking-[0.3em] uppercase">
              Thank you for your business!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleInvoiceDetailsPage;
