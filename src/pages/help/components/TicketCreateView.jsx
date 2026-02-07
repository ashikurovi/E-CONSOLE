import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  Filter,
  User,
  Sparkles,
  FileText,
  Tag,
  Send,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function TicketCreateView({ setActiveView }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-200 dark:border-gray-800 overflow-hidden shadow-md">
      <div className="relative px-8 py-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-50/50 via-white to-white dark:from-violet-900/10 dark:via-[#1a1f26] dark:to-[#1a1f26] pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveView("list")}
            className="hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all hover:scale-105 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 flex items-center gap-2"
            >
              Create New Ticket{" "}
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </motion.h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Fill in the details below to submit a new support request.
            </p>
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto p-6 md:p-10 bg-gray-50/50 dark:bg-gray-900/50"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Main Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  Ticket Information
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-violet-600 transition-colors">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief summary of the issue"
                      className="w-full h-14 px-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-violet-600 transition-colors">
                      Description
                    </label>
                    <textarea
                      rows={8}
                      className="w-full p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none resize-none transition-all placeholder:text-gray-400"
                      placeholder="Detailed description of the problem..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Attachments
                    </label>
                    <div className="p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors cursor-pointer text-center group">
                      <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Paperclip className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        SVG, PNG, JPG or GIF (max. 800x400px)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <User className="w-5 h-5" />
                  </div>
                  Requester Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-indigo-600 transition-colors">
                      Company Name / Requester
                    </label>
                    <div className="relative">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className="w-full h-14 pl-12 pr-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 group-focus-within:text-indigo-600 transition-colors">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      className="w-full h-14 px-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-6">
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 sticky top-6"
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-violet-500" /> Ticket Properties
                </h3>

                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Priority
                    </label>
                    <div className="relative">
                      <select className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none appearance-none transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 font-medium text-gray-700 dark:text-gray-200">
                        <option value="high">Important (High)</option>
                        <option value="medium">Mid Important (Medium)</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                      Tags
                    </label>
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Add tags..."
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                    <Button className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-base font-semibold group">
                      Create Ticket{" "}
                      <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setActiveView("list")}
                      className="w-full h-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
