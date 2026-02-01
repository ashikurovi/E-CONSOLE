import { useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Edit3, 
  Mail, 
  Phone, 
  Briefcase, 
  Globe, 
  Plus, 
  MoreVertical, 
  ChevronRight,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  XCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * CustomerDetailsPage Component
 * High-fidelity 360-degree view of a customer matching the "Kanakku" mockup.
 */
export default function CustomerDetailsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("invoices");

  const stats = [
    { label: "Total Invoice", value: "$56900.54", color: "bg-indigo-500" },
    { label: "Outstanding", value: "$7484.54", color: "bg-blue-400" },
    { label: "Overdue", value: "$7485.54", color: "bg-rose-500" },
    { label: "Draft", value: "$745.54", color: "bg-purple-500" },
    { label: "Cancelled", value: "$221.54", color: "bg-red-500" },
  ];

  const invoices = [
    { id: "INV00025", date: "22 Feb 2025", amount: "$10,000", paid: "$5,000", status: "Paid", color: "text-emerald-500 bg-emerald-50", dueDate: "04 Mar 2025" },
    { id: "INV00024", date: "07 Feb 2025", amount: "$25,750", paid: "$10,750", status: "Unpaid", color: "text-amber-500 bg-amber-50", dueDate: "20 Feb 2025" },
    { id: "INV00023", date: "30 Jan 2025", amount: "$50,125", paid: "$20,000", status: "Cancelled", color: "text-rose-500 bg-rose-50", dueDate: "13 Feb 2025" },
    { id: "INV00022", date: "17 Jan 2025", amount: "$75,900", paid: "$50,000", status: "Partially Paid", color: "text-blue-500 bg-blue-50", dueDate: "30 Jan 2025" },
    { id: "INV00021", date: "04 Jan 2025", amount: "$99,999", paid: "$80,000", status: "Overdue", color: "text-orange-500 bg-orange-50", dueDate: "17 Jan 2025" },
  ];

  const payments = [
    { method: "Paypal", id: "#INV4578", amount: "$980", date: "19 Jan 2025", status: "Paid" },
    { method: "Stripe", id: "#INV4457", amount: "$241", date: "18 Jan 2025", status: "Paid" },
    { method: "Paypal", id: "#INV4565", amount: "$417", date: "18 Jan 2025", status: "Paid" },
    { method: "Stripe", id: "#INV4548", amount: "$142", date: "17 Jan 2025", status: "Paid" },
  ];

  const activities = [
    { title: "Status Changed to Partially Paid", date: "19 Jan 2025", icon: CheckCircle2, iconColor: "text-indigo-500 bg-indigo-50" },
    { title: "$300 Partial Amount Paid on Paypal", date: "18 Jan 2025", icon: DollarSign, iconColor: "text-blue-500 bg-blue-50" },
    { title: "New expenses added #TR018756", date: "18 Jan 2025", icon: FileText, iconColor: "text-purple-500 bg-purple-50" },
    { title: "Estimate Created #ES458789", date: "17 Jan 2025", icon: Plus, iconColor: "text-indigo-500 bg-indigo-50" },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Button 
             variant="ghost" 
             size="icon" 
             className="h-10 w-10 rounded-full bg-white dark:bg-[#1a1f26] shadow-sm"
             onClick={() => navigate("/customers")}
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <h1 className="text-2xl font-black text-[#0b121e] dark:text-white tracking-tight">Customers</h1>
        </div>
        
        <Button className="h-11 px-6 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
          Add New <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: Main Info --- */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
             <div className="px-8 pb-8 -mt-10">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                   <div className="flex items-end gap-6">
                      <div className="w-24 h-24 rounded-[28px] border-4 border-white dark:border-[#1a1f26] bg-indigo-100 flex items-center justify-center overflow-hidden shadow-lg">
                         <img src="https://i.pravatar.cc/150?u=Robert" alt="Robert" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1 pb-1">
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">CI-12345</p>
                         <h2 className="text-2xl font-black text-[#0b121e] dark:text-white flex items-center gap-2">
                           Robert George <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                         </h2>
                         <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                           <MapPin className="w-3.5 h-3.5" /> 4712 Cherry Ridge Drive Rochester, NY 14620.
                         </p>
                      </div>
                   </div>
                   <Button variant="outline" className="h-10 rounded-xl px-5 font-bold gap-2 text-gray-500 bg-gray-50/50 dark:bg-white/5 border-none">
                      <Edit3 className="w-4 h-4" /> Edit Profile
                   </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 pt-8 border-t border-gray-50 dark:border-gray-800">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Mail className="w-3 h-3" /> Email Address
                      </p>
                      <p className="text-xs font-bold text-[#0b121e] dark:text-white">john@example.com</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Phone className="w-3 h-3" /> Phone
                      </p>
                      <p className="text-xs font-bold text-[#0b121e] dark:text-white">+1 58578 54840</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Briefcase className="w-3 h-3" /> Company
                      </p>
                      <p className="text-xs font-bold text-[#0b121e] dark:text-white">TrueAI Technologies</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Globe className="w-3 h-3" /> Website
                      </p>
                      <p className="text-xs font-bold text-indigo-500 underline decoration-indigo-500/30">www.example.com</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Invoice Statistics */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-lg font-black text-[#0b121e] dark:text-white mb-8">Invoice Statistics</h3>
             <div className="flex flex-wrap items-center gap-x-12 gap-y-6">
                {stats.map((stat, idx) => (
                  <div key={idx} className="space-y-2">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">{stat.label}</span>
                     </div>
                     <p className="text-xl font-black text-[#0b121e] dark:text-white">{stat.value}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 dark:border-gray-800">
                <h3 className="text-lg font-black text-[#0b121e] dark:text-white">Invoices</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                         <th className="px-8 py-5">ID</th>
                         <th className="px-8 py-5">Created On</th>
                         <th className="px-8 py-5">Amount</th>
                         <th className="px-8 py-5">Paid</th>
                         <th className="px-8 py-5">Status</th>
                         <th className="px-8 py-5">Due Date</th>
                         <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {invoices.map((inv) => (
                         <tr key={inv.id} className="text-xs font-bold text-[#0b121e] dark:text-white/80 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                           <td className="px-8 py-6 font-black text-[#6366f1]">{inv.id}</td>
                           <td className="px-8 py-6 text-gray-400">{inv.date}</td>
                           <td className="px-8 py-6">{inv.amount}</td>
                           <td className="px-8 py-6">{inv.paid}</td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${inv.color}`}>
                                {inv.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-gray-400">{inv.dueDate}</td>
                           <td className="px-8 py-6 text-right">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                           </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             <div className="p-6 flex items-center justify-between border-t border-gray-50 dark:border-gray-800">
                <div className="text-xs font-bold text-gray-400">
                   Showing <span className="text-[#0b121e] dark:text-white">10</span> Results
                </div>
                <div className="flex items-center gap-1">
                   {[1, 2, 3, "...", 8].map((page, i) => (
                      <Button key={i} variant="outline" className={`h-8 px-3 rounded-lg text-[10px] font-black border-none ${page === 1 ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
                         {page}
                      </Button>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Panels --- */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* Notes Panel */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-lg font-black text-[#0b121e] dark:text-white mb-6">Notes</h3>
             <p className="text-sm font-medium text-gray-400 leading-relaxed">
               Keep in mind that in order to be deductible, your employees' pay must be reasonable and necessary for conducting business to qualify for...
             </p>
          </div>

          {/* Payments History */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-lg font-black text-[#0b121e] dark:text-white mb-8">Payments History</h3>
             <div className="space-y-6">
                {payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center group cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#0b0f14] flex items-center justify-center font-black text-indigo-500 text-xs">
                           {p.method[0]}
                        </div>
                        <div>
                           <p className="text-sm font-black text-[#0b121e] dark:text-white group-hover:text-indigo-500 transition-colors">{p.method}</p>
                           <p className="text-[10px] font-bold text-gray-400">{p.id}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-sm font-black text-[#0b121e] dark:text-white">{p.amount}</p>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{p.status}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Activities Timeline */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
             <h3 className="text-lg font-black text-[#0b121e] dark:text-white mb-10">Activities</h3>
             <div className="space-y-10 relative">
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
                {activities.map((act, idx) => (
                   <div key={idx} className="relative flex items-start gap-5">
                      <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a1f26] ${act.iconColor}`}>
                         <act.icon className="w-4 h-4" />
                      </div>
                      <div className="pt-1">
                         <p className="text-sm font-black text-[#0b121e] dark:text-white leading-tight">{act.title}</p>
                         <p className="text-[10px] font-bold text-gray-400 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> {act.date}
                         </p>
                      </div>
                   </div>
                ))}
             </div>
             <Button variant="ghost" className="w-full mt-10 text-[11px] font-black uppercase text-gray-400 tracking-widest hover:text-indigo-500">View All</Button>
          </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-20 pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
         <span>&copy; 2025 Kanakku, All Rights Reserved</span>
         <div className="flex items-center gap-2">
            <span>Version : 1.3.8</span>
         </div>
      </footer>
    </div>
  );
}
