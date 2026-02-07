import React from "react";
import { ArrowLeft, ChevronRight, Filter, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TicketCreateView({ setActiveView }) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xl">
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white dark:from-[#1a1f26] dark:to-[#1a1f26]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveView("list")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
              Create New Ticket
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Fill in the details below to submit a new support request.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <div className="w-1 h-5 bg-violet-500 rounded-full" />
                  Ticket Information
                </h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of the issue"
                      className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <textarea
                      rows={8}
                      className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none resize-none transition-all"
                      placeholder="Detailed description of the problem..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                   <div className="w-1 h-5 bg-indigo-500 rounded-full" />
                   Requester Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Company Name / Requester
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Email
                    </label>
                     <input
                        type="email"
                        placeholder="user@example.com"
                        className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">
                  Ticket Properties
                </h3>
                
                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Priority
                    </label>
                    <div className="relative">
                      <select className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                        <option value="high">Important (High)</option>
                        <option value="medium">Mid Important (Medium)</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tags
                    </label>
                    <div className="relative group">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Add tags..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                    <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Create Ticket
                    </Button>
                    <Button variant="ghost" onClick={() => setActiveView("list")} className="w-full h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
