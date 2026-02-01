import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { 
  PlusCircle, 
  Search, 
  RefreshCw, 
  Clock, 
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

/**
 * ConnectedAppsPage Component
 * A premium dashboard for managing third-party integrations and app connections.
 */
export default function ConnectedAppsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { label: "All", count: 1234 },
    { label: "Developer Tools", count: 3 },
    { label: "Marketplace", count: 8 },
    { label: "Financial Accounting", count: 28 },
  ];

  const apps = [
    { id: 1, name: "Tracking App", description: "Real-time order tracking and a list of bestselling products from the shops", icon: "EA", status: true },
    { id: 2, name: "Data Shop Foundation", description: "Run Data PPC campaigns and adjust budgets, without leaving dashboard", icon: "DATA", status: false },
    { id: 3, name: "Optimized scheduling", description: "Real-time order tracking and a list of bestselling products from the shops", icon: "S", status: true },
    { id: 4, name: "Target's robust App", description: "Target Wallet that allows users can save their payment information", icon: "DATA", status: true },
    { id: 5, name: "Inventory administration", description: "Release calendar that neatly organizes all the different drops for new shop products", icon: "INV", status: false, iconColor: "text-orange-500 bg-orange-50" },
    { id: 6, name: "Employee management", description: "Manager of a brick-and-mortar store to use on a daily basis security transactions", icon: "EM", status: true },
    { id: 7, name: "Shop Email Service", description: "Real-time order tracking and a list of bestselling products from the shops", icon: "SE", status: true },
    { id: 8, name: "Offer online customer service", description: "Automate your daily business operations and decreases the effort required", icon: "OC", status: true },
    { id: 9, name: "Digital advertising", description: "Referal advertising", icon: "DA", status: true },
    { id: 10, name: "Crypto Wallet", description: "Cryptocurrency transaction operations", icon: "CW", status: false, iconColor: "text-red-500 bg-red-50" },
    { id: 11, name: "Tracking", description: "Real-time order tracking and a list of bestselling products from the shops", icon: "T", status: true },
    { id: 12, name: "Target's robust App", description: "Target Wallet that allows users can save their payment information", icon: "DATA", status: true },
  ];

  return (
    <div className="p-6 lg:p-10 bg-white dark:bg-[#0b0f14] min-h-screen font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <h1 className="text-4xl font-extrabold text-[#0b121e] dark:text-white tracking-tight">Connected Apps</h1>
        
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

      {/* --- TOOLBAR --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-10">
        <Button className="bg-[#0ac9a3] hover:bg-[#09b692] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-teal-500/10 flex items-center gap-2.5">
          <PlusCircle className="w-5 h-5" />
          Add New Application
        </Button>

        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
          <input 
            type="text"
            placeholder="Search Application"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-8 pr-14 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/5 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-medium"
          />
        </div>
      </div>

      {/* --- CATEGORY FILTERS --- */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-10 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        <span>Applications:</span>
        {categories.map((cat) => (
          <button 
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            className={`transition-colors whitespace-nowrap ${
              activeTab === cat.label 
              ? "text-blue-600 dark:text-blue-400" 
              : "hover:text-[#0b121e] dark:hover:text-white"
            }`}
          >
            {cat.label} <span className="opacity-40 ml-0.5">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* --- APP GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {apps.map((app, idx) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-[#1a1f26]/40 rounded-[28px] border border-gray-100 dark:border-gray-800 p-8 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl transition-all group"
          >
            <div className="flex justify-between items-start mb-8">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xs ${app.iconColor || 'bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40'}`}>
                  {app.icon}
               </div>
               <Switch checked={app.status} className="data-[state=checked]:bg-blue-600" />
            </div>

            <div className="space-y-4">
              <h3 className="text-base font-black text-[#0b121e] dark:text-white leading-tight">
                {app.name}
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium line-clamp-2">
                {app.description}
              </p>
              <button className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest pt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                View Settings
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* --- PAGINATION --- */}
      <div className="mt-16 flex items-center gap-2">
        <button className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-lg shadow-blue-500/20">1</button>
        <button className="w-10 h-10 rounded-lg border border-gray-100 dark:border-gray-800 text-[#0b121e] dark:text-white font-black text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">2</button>
        <button className="w-10 h-10 rounded-lg border border-gray-100 dark:border-gray-800 text-[#0b121e] dark:text-white font-black text-xs flex items-center justify-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">3</button>
        <button className="w-10 h-10 flex items-center justify-center text-blue-600">
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>

      {/* Footer Decoration */}
      <footer className="mt-20 pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest">
         <span>SquadCart App Ecosystem</span>
         <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="text-[#0066ff]">Kanakku Engine</span>
         </div>
      </footer>
    </div>
  );
}
