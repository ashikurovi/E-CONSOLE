import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Sparkles, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DomainFinderPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");

  const tlds = [
    { name: ".com", price: "$19.99", sale: "$0.01" },
    { name: ".online", price: "$35.99", sale: "$0.99" },
    { name: ".shop", price: "$34.99", sale: "$0.99" },
    { name: ".pro", price: "$20.99", sale: "$2.99" },
    { name: ".net", price: "$17.99", sale: "$11.99", gift: true },
    { name: ".blog", price: "$29.99", sale: "$1.99" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] p-6 lg:p-8">
      {/* Hero Section */}
      <div className="relative text-gray-900 dark:text-white py-12 px-6 md:px-12 text-center">
        {/* Background Elements */}
        <div className="absolute top-10 left-10 text-lime-400 rotate-[-15deg] hidden md:block">
          <div className="bg-lime-400 text-black font-bold text-4xl p-4 rounded-xl shadow-lg shadow-lime-400/20">
            %
          </div>
        </div>
        <div className="absolute bottom-10 right-10 text-lime-400 rotate-[15deg] hidden md:block">
           <div className="bg-lime-400 text-black font-bold text-4xl p-4 rounded-xl shadow-lg shadow-lime-400/20">
            %
          </div>
        </div>
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-3xl mx-auto space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-white dark:to-gray-400">
              Search for and claim your domain name
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-light">
              Choose a domain with .ai, .io, .net, or .org for 2 years or longer and get 1 year of free email.
            </p>
          </div>

          {/* Toggle/Tabs */}
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-full inline-flex items-center gap-1 border border-gray-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("search")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === "search"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Domain search
              </button>
              <button
                onClick={() => setActiveTab("generator")}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "generator"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI domain generator
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl opacity-50 group-hover:opacity-75 blur transition duration-500"></div>
            <div className="relative flex items-center bg-white p-2 rounded-xl shadow-xl">
              <Search className="ml-4 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Type the domain you want"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 text-gray-900 text-lg placeholder:text-gray-400 h-14"
              />
              <Button 
                size="lg"
                className="h-12 px-8 rounded-lg bg-[#6366f1] hover:bg-[#5558dd] text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all active:scale-95"
              >
                Search
              </Button>
            </div>
          </div>

          {/* TLD Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-6">
            {tlds.map((tld, index) => (
              <motion.div
                key={tld.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 hover:border-indigo-500 transition-all cursor-pointer group shadow-sm"
              >
                <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tld.name}
                </span>
                <div className="flex flex-col items-center">
                   <span className="text-xs text-gray-400 line-through">{tld.price}</span>
                   <span className="text-lg font-bold text-gray-900 dark:text-white">{tld.sale}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-xs text-gray-500 pt-4">
            Free WHOIS privacy protection is included with every eligible domain registration.
          </p>
        </motion.div>
      </div>
      
      {/* Features / Upsell Section */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
         {/* Placeholder for more content */}
         <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="h-12 w-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
               <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Global Reach</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
               Connect with customers worldwide using our premium domain extensions and reliable DNS services.
            </p>
         </div>
         <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
               <Check className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Instant Activation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
               Get your domain up and running in minutes with our streamlined setup process and auto-configuration.
            </p>
         </div>
         <div className="bg-white dark:bg-[#1a1f26] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
               <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Suggestions</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
               Not sure what to pick? Let our AI generate creative and available domain names for your brand.
            </p>
         </div>
      </div>
    </div>
  );
};

export default DomainFinderPage;
