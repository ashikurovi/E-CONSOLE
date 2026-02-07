import React from "react";
import {
  ArrowLeft,
  BookOpen,
  Inbox,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Paperclip,
  Phone,
  Search as SearchIcon,
  Send,
  Smile,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { StatusBadge } from "./HelpComponents";
import { KNOWLEDGE_BASE, TICKETS, USERS } from "../data";

export default function TicketDetailView({
  sidebarOpen,
  setSidebarOpen,
  setActiveView,
  selectedTicketId,
  setSelectedTicketId,
}) {
  const selectedTicket =
    TICKETS.find((t) => t.id === selectedTicketId) || TICKETS[0];
  const requester = USERS.find((u) => u.id === selectedTicket?.requesterId);

  return (
    <div className="flex h-full bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden shadow-xl border border-gray-200 dark:border-gray-800">
      {/* Left Sidebar - Ticket List */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          "w-80 flex-shrink-0 bg-white dark:bg-[#1a1f26] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 hidden md:flex",
          !sidebarOpen && "w-0 overflow-hidden border-none",
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView("list")}
            className="gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Communications <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{TICKETS.length}</span>
          </h3>
          <div className="relative mb-4 group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {TICKETS.map((ticket) => {
            const user = USERS.find((u) => u.id === ticket.requesterId);
            const isSelected = ticket.id === selectedTicketId;

            return (
              <motion.div
                layoutId={`ticket-${ticket.id}`}
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  "p-4 border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition-all relative",
                  isSelected 
                    ? "bg-violet-50/50 dark:bg-violet-900/10" 
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                )}
              >
                {isSelected && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-indigo-500" 
                  />
                )}
                <div className="flex justify-between items-start mb-1">
                  <div className={cn("font-semibold text-sm truncate max-w-[180px]", isSelected ? "text-violet-700 dark:text-violet-300" : "text-gray-900 dark:text-white")}>
                    {user?.company || user?.name || "Unknown"}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(ticket.date || new Date(), "MMM d")}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">
                    #{ticket.id.replace("#", "")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1f26] relative z-0">
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveView("list")}
              className="md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              {sidebarOpen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedTicket.subject}
                <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 font-mono">
                  {selectedTicket.id}
                </span>
              </h2>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                Requested by <span className="font-medium text-gray-700 dark:text-gray-300">{requester?.name || "Unknown"}</span> via WhatsApp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
              <Phone className="w-3.5 h-3.5" />
              Call
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl h-9 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 hover:text-red-700 dark:text-red-400">
              Close Ticket
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-black/20">
          {selectedTicket.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Inbox className="w-10 h-10 opacity-40" />
              </div>
              <p>No messages yet</p>
            </div>
          ) : (
            selectedTicket.messages.map((msg, index) => {
              const isMe = msg.senderId === "me";
              const sender = isMe
                ? { name: "You", avatar: null }
                : USERS.find((u) => u.id === msg.senderId) || {
                    name: "Customer",
                    avatar: null,
                  };

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={msg.id}
                  className={cn(
                    "flex gap-4 max-w-3xl group",
                    isMe ? "ml-auto flex-row-reverse" : "",
                  )}
                >
                  <div className="flex-shrink-0 pt-1">
                    {isMe ? (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20">
                        YOU
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-xs shadow-sm">
                        {sender.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className={cn("flex items-center gap-2 mb-1", isMe ? "justify-end" : "")}>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(msg.timestamp || new Date(), "HH:mm")}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "p-5 rounded-2xl text-sm leading-relaxed shadow-sm max-w-xl",
                        isMe
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-none shadow-indigo-500/10"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700",
                      )}
                    >
                      {msg.content || msg.text}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-[#1a1f26]">
          {selectedTicket.messages?.length > 0 &&
            selectedTicket.messages.at(-1)?.senderId !== "me" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mb-3"
              >
                <div className="text-xs text-gray-500 font-medium py-1">
                  AI Suggested:
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Request ID proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Ask for screenshot
                </Button>
              </motion.div>
            )}

          <div className="relative group">
            <textarea
              placeholder="Type your reply..."
              className="w-full p-4 pr-32 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 min-h-[80px] transition-all"
              rows={3}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-500 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button className="h-9 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95">
                <Send className="w-4 h-4 mr-2" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Knowledge Base */}
      <div className="w-80 flex-shrink-0 bg-gray-50/50 dark:bg-[#111827]/50 border-l border-gray-200 dark:border-gray-800 flex flex-col hidden xl:flex">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            Knowledge Base
          </h3>
          <div className="relative group">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-violet-500 transition-colors" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all shadow-sm"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:scale-105 transition-transform"
            >
              <span className="text-lg leading-none">+</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {KNOWLEDGE_BASE.map((article, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              key={article.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    article.category === "Infrastructure"
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50"
                      : article.category === "User Guide"
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50"
                        : article.category === "Sales"
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50"
                          : "bg-green-100 text-green-600 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50",
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {article.description || article.excerpt}
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md font-medium">
                  {article.category}
                </span>
                <span>{article.date || "Recent"}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
