import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Minus, 
  MapPin,
  Circle
} from "lucide-react";
import { motion } from "framer-motion";
import { useGetStatisticsQuery } from "@/features/dashboard/dashboardApiSlice";

/**
 * StatisticsPage Component
 * A premium dashboard showing income statistics and a stylized world map.
 */
export default function StatisticsPage() {
  const { t } = useTranslation();
  const authUser = useSelector((s) => s?.auth?.user);
  const { data: statsData } = useGetStatisticsQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const incomeData = statsData?.incomeData ?? [
    { year: 2022, customers: "0", trend: "0%", revenue: "$0k", trendDir: "up" },
    { year: new Date().getFullYear(), customers: "0", trend: "0%", revenue: "$0k", trendDir: "up" },
  ];

  const cityProgress = [
    { city: "New York", amount: "$123k", color: "bg-[#0ac9a3]", width: "85%" },
    { city: "Los Angeles", amount: "$89k", color: "bg-[#0b121e]", width: "70%" },
    { city: "Houston", amount: "$67k", color: "bg-[#ff5d6d]", width: "60%" },
    { city: "Dallas", amount: "$23k", color: "bg-[#0ac9a3]", width: "45%" },
    { city: "Madrid", amount: "$10k", color: "bg-[#0b121e]", width: "30%" },
    { city: "Chicago", amount: "$5k", color: "bg-[#ff5d6d]", width: "20%" },
  ];

  // Helper for generating dots for the map (pseudo-randomized for a stylized look)
  const dots = Array.from({ length: 600 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.5 + 1
  }));

  const markers = [
    { x: 25, y: 35, color: "bg-[#0ac9a3]", city: "New York", amount: "$123k", active: true },
    { x: 38, y: 30, color: "bg-[#ff5d6d]", city: "Chicago", amount: "$45k" },
    { x: 45, y: 20, color: "bg-[#ff5d6d]" },
    { x: 50, y: 40, color: "bg-[#0ac9a3]" },
    { x: 75, y: 45, color: "bg-[#0b121e]" },
    { x: 18, y: 55, color: "bg-[#0b121e]" },
  ];

  return (
    <div className="p-6 lg:p-10 bg-white dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <h1 className="text-4xl font-extrabold text-[#0b121e] dark:text-white tracking-tight">Statistics</h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 text-xs font-bold text-[#0b121e]/60 dark:text-white/40">
            <span>Data Refreshed</span>
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 cursor-pointer" />
          </div>
          <div className="bg-gray-50 dark:bg-white/5 py-3 px-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm text-sm font-bold text-[#0b121e] dark:text-white">
            {format(new Date(), "MMMM dd, yyyy hh:mm a")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        
        {/* --- LEFT PANEL: Tables & Stats --- */}
        <div className="xl:col-span-1 space-y-12">
          
          {/* General Income Statistics Table */}
          <div className="space-y-6">
            <h2 className="text-lg font-black text-[#0b121e] dark:text-white">General Income Statistics</h2>
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 font-black border-b border-gray-50 dark:border-gray-800">
                    <th className="text-left pb-4">Year</th>
                    <th className="text-left pb-4">Customers</th>
                    <th className="text-left pb-4">Trend</th>
                    <th className="text-right pb-4">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {incomeData.map((row) => (
                    <tr key={row.year} className="text-xs font-bold text-[#0b121e] dark:text-white group">
                      <td className="py-5">{row.year}</td>
                      <td className="py-5">{row.customers}</td>
                      <td className="py-5 flex items-center gap-1.5">
                        {row.trend}
                        {row.trendDir === "up" ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                      </td>
                      <td className="py-5 text-right">{row.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Income Card */}
          <div className="bg-[#0066ff] rounded-[32px] p-8 text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L3 7l9 5 9-5-9-5zm0 13l-9-5 9 5 9-5-9 5zm0 5l-9-5 9 5 9-5-9 5z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight">
                  ${statsData?.totalRevenue != null
                    ? Number(statsData.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0.00"}
                </span>
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Total Income</span>
              </div>
            </div>
            {/* Background Decorations */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          </div>

          {/* Income level by city */}
          <div className="space-y-8">
            <h2 className="text-lg font-black text-[#0b121e] dark:text-white">Income level by city</h2>
            <div className="space-y-6">
              {cityProgress.map((item) => (
                <div key={item.city} className="space-y-2.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                    <span className="text-gray-400">{item.city}</span>
                    <span className="text-[#0b121e] dark:text-white">{item.amount}</span>
                  </div>
                  <div className="h-3 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: item.width }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full ${item.color} rounded-full`} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- MAIN PANEL: World Map --- */}
        <div className="xl:col-span-3 bg-white dark:bg-[#1a1f26]/50 rounded-[40px] border border-gray-50 dark:border-gray-800 p-10 relative shadow-sm overflow-hidden">
          
          {/* Dots World Map Background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1] flex items-center justify-center p-20 pointer-events-none">
             <div className="w-full h-full relative">
                {dots.map(dot => (
                   <div 
                      key={dot.id}
                      className="absolute bg-[#0b121e] dark:bg-white rounded-full"
                      style={{ 
                         left: `${dot.x}%`, 
                         top: `${dot.y}%`, 
                         width: dot.size, 
                         height: dot.size,
                         opacity: Math.random() * 0.8 + 0.2
                      }}
                   />
                ))}
             </div>
          </div>

          {/* Main Map Visualization Area */}
          <div className="w-full h-full min-h-[600px] relative flex items-center justify-center">
             
             {/* Styling markers over a centered "map" container */}
             <div className="w-[80%] aspect-[1.8/1] relative">
                
                {markers.map((marker, idx) => (
                   <motion.div
                     key={idx}
                     initial={{ scale: 0, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 0.1 * idx, type: "spring" }}
                     className="absolute"
                     style={{ left: `${marker.x}%`, top: `${marker.y}%`, transform: 'translate(-50%, -50%)' }}
                   >
                      <div className="relative group cursor-pointer">
                         
                         {/* Pulse Animation for Active */}
                         <div className={`w-4 h-4 ${marker.color} rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a1f26] relative z-10`}>
                            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                         </div>
                         <div className={`absolute inset-0 ${marker.color} rounded-full animate-ping opacity-20 scale-150`} />

                         {/* Tooltip Popup */}
                         {marker.city && (
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 rounded-2xl bg-white dark:bg-[#1a1f26] shadow-2xl border border-gray-100 dark:border-gray-800 min-w-[140px] transition-all duration-300 origin-bottom ${marker.active ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                               <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 ${marker.color} rounded-xl flex items-center justify-center`}>
                                     <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L3 7l1.83 1.02L12 13.19l7.17-5.17L21 7l-9-5zm0 13l-9-5 1.83-1.01L12 12.16l7.17-5.17L21 8l-9 5zm0 5l-9-5 1.83-1.01L12 17.14l7.17-5.17L21 13l-9 5z" />
                                     </svg>
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider leading-none mb-1">{marker.city}</span>
                                     <span className="text-sm font-black text-[#0b121e] dark:text-white">{marker.amount}</span>
                                  </div>
                               </div>
                               {/* Triangle arrow */}
                               <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-[#1a1f26]" />
                            </div>
                         )}
                      </div>
                   </motion.div>
                ))}
             </div>

             {/* Zoom Controls Overlay */}
             <div className="absolute bottom-10 right-10 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                   <Plus className="w-4 h-4 text-[#0ac9a3]" />
                </button>
                <button className="w-10 h-10 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                   <Minus className="w-4 h-4 text-[#ff5d6d]" />
                </button>
             </div>
          </div>

        </div>

      </div>

      {/* Footer Decoration */}
      <footer className="mt-20 pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
         <span>SquadCart Intelligence Hub</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-[#0066ff]">Kanakku Engine</span>
         </div>
      </footer>
    </div>
  );
}
