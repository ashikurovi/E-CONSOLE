import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical, 
  ChevronDown, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
export default function RecurringInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const summaryCards = [
    { title: "Total Recurring Invoices", value: "950", trend: "5.62%", trendDir: "up", icon: RefreshCw, color: "text-blue-600 bg-blue-50" },
    { title: "Paid Invoices", value: "800", trend: "11.4%", trendDir: "up", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { title: "Expired Invoices", value: "150", trend: "8.52%", trendDir: "up", icon: AlertCircle, color: "text-amber-500 bg-amber-50" },
    { title: "Total Revenue", value: "₹500,000", trend: "7.45%", trendDir: "down", icon: TrendingUp, color: "text-rose-500 bg-rose-50" },
  ];

  const invoices = [
    { id: "INV00025", customer: "Emily Clark", date: "22 Feb 2025", cycle: "6 Months", issueDate: "25 Feb 2025", dueDate: "04 Mar 2025", paid: "$5,000", due: "$10,000", status: "Paid", color: "text-emerald-500 bg-emerald-50" },
    { id: "INV00024", customer: "John Carter", date: "07 Feb 2025", cycle: "1 Year", issueDate: "10 Feb 2025", dueDate: "20 Feb 2025", paid: "$10,750", due: "$25,750", status: "Unpaid", color: "text-amber-500 bg-amber-50" },
    { id: "INV00023", customer: "Sophia White", date: "30 Jan 2025", cycle: "9 Months", issueDate: "03 Feb 2025", dueDate: "13 Feb 2025", paid: "$20,000", due: "$50,125", status: "Cancelled", color: "text-rose-500 bg-rose-50" },
    { id: "INV00022", customer: "Michael Johnson", date: "17 Jan 2025", cycle: "2 Years", issueDate: "20 Jan 2025", dueDate: "30 Jan 2025", paid: "$50,000", due: "$75,900", status: "Partially Paid", color: "text-blue-500 bg-blue-50" },
    { id: "INV00021", customer: "Olivia Harris", date: "04 Jan 2025", cycle: "3 Months", issueDate: "07 Jan 2025", dueDate: "17 Jan 2025", paid: "$80,000", due: "$99,999", status: "Overdue", color: "text-orange-500 bg-orange-50" },
  ];

  return (
    <div className="p-6 lg:p-10 bg-[#f8f9fa] dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
             <span>Home</span> / <span className="text-[#0b121e] dark:text-white">Recurring Invoices</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0b121e] dark:text-white tracking-tight">Recurring Invoices</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] font-bold flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button className="h-12 px-8 rounded-xl bg-[#6366f1] hover:bg-[#5558e3] text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Plus className="w-5 h-5" /> New Invoice
          </Button>
        </div>
      </div>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {summaryCards.map((card, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-6">
               <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase text-gray-400 tracking-wider leading-tight">{card.title}</p>
                  <h3 className="text-2xl font-black text-[#0b121e] dark:text-white tracking-tight">{card.value}</h3>
               </div>
               <div className={`p-3 rounded-2xl ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5" />
               </div>
            </div>
            <div className="flex items-center gap-2">
               <div className={`flex items-center gap-1 text-[11px] font-bold ${card.trendDir === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {card.trendDir === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {card.trend}
               </div>
               <span className="text-[11px] font-bold text-gray-400">from last month</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="relative w-full md:max-w-xs">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-6 pr-12 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0b0f14]/50 outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-500/10" 
              />
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" className="h-11 px-4 rounded-xl gap-2 font-bold text-gray-500">
                 <Filter className="w-4 h-4" /> Filter
              </Button>
              <div className="flex items-center gap-2 ml-auto">
                 <Button variant="outline" className="h-11 px-4 rounded-xl gap-2 font-bold text-gray-500">
                    Sort by : Latest <ChevronDown className="w-4 h-4" />
                 </Button>
                 <Button variant="outline" className="h-11 px-4 rounded-xl gap-2 font-bold text-gray-500">
                    Column <LayoutGrid className="w-4 h-4" />
                 </Button>
              </div>
           </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <th className="px-6 py-5"><input type="checkbox" className="rounded" /></th>
                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Customer</th>
                    <th className="px-6 py-5">Created On</th>
                    <th className="px-6 py-5">Recurring Cycle</th>
                    <th className="px-6 py-5">Issue Date</th>
                    <th className="px-6 py-5">Due Date</th>
                    <th className="px-6 py-5">Paid</th>
                    <th className="px-6 py-5">Due Amount</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                 {invoices.map((inv) => (
                    <tr key={inv.id} className="text-xs font-bold text-[#0b121e] dark:text-white/80 hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                       <td className="px-6 py-5"><input type="checkbox" className="rounded" /></td>
                       <td className="px-6 py-5 font-black text-[#6366f1]">{inv.id}</td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-2.5">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600">
                                {inv.customer.split(' ').map(n => n[0]).join('')}
                             </div>
                             {inv.customer}
                          </div>
                       </td>
                       <td className="px-6 py-5 text-gray-400">{inv.date}</td>
                       <td className="px-6 py-5">{inv.cycle}</td>
                       <td className="px-6 py-5 text-gray-400">{inv.issueDate}</td>
                       <td className="px-6 py-5 text-gray-400">{inv.dueDate}</td>
                       <td className="px-6 py-5">{inv.paid}</td>
                       <td className="px-6 py-5">{inv.due}</td>
                       <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${inv.color}`}>
                             {inv.status}
                          </span>
                       </td>
                       <td className="px-6 py-5 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical className="w-4 h-4" /></Button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="p-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
           <div className="text-xs font-bold text-gray-400">
              Showing <select className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 rounded px-1.5 py-0.5 mx-1 focus:outline-none"><option>10</option></select> Results
           </div>
           <div className="flex items-center gap-1">
              <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px] font-black bg-indigo-600 text-white border-none">1</Button>
              <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px] font-black text-gray-400 border-none hover:bg-gray-50 dark:hover:bg-white/5">2</Button>
              <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px] font-black text-gray-400 border-none hover:bg-gray-50 dark:hover:bg-white/5">3</Button>
              <span className="text-gray-400 mx-1">...</span>
              <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px] font-black text-gray-400 border-none hover:bg-gray-50 dark:hover:bg-white/5">15</Button>
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
