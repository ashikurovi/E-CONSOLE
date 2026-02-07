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
import { StatusBadge } from "./HelpComponents";
import { KNOWLEDGE_BASE, TICKETS, USERS } from "../data";

export default function TicketDetailView({
  sidebarOpen,
  setSidebarOpen,
  setActiveView,
  selectedTicketId,
  setSelectedTicketId,
}) {
  const selectedTicket = TICKETS.find((t) => t.id === selectedTicketId) || TICKETS[0];
  const requester = USERS.find((u) => u.id === selectedTicket?.requesterId);

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Left Sidebar - Ticket List */}
      <div
        className={cn(
          "w-80 flex-shrink-0 bg-white dark:bg-[#1a1f26] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 hidden md:flex",
          !sidebarOpen && "w-0 overflow-hidden border-none"
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView("list")}
            className="gap-2 text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Communications</h3>
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {TICKETS.map((ticket) => {
            const user = USERS.find((u) => u.id === ticket.requesterId);
            const isSelected = ticket.id === selectedTicketId;

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  "p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  isSelected && "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[180px]">
                    {user?.company || user?.name || "Unknown"}
                  </div>
                  <span className="text-xs text-gray-500">
                    {format(ticket.date || new Date(), "MMM d")}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">#{ticket.id.replace("#", "")}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1a1f26]">
        {/* Header */}
        <div className="h-16 px-4 md:px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1a1f26]">
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
              className="hidden md:flex"
            >
              {sidebarOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>

            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {selectedTicket.id} • {selectedTicket.subject}
              </h2>
              <span className="text-xs text-gray-500">
                Requested by {requester?.name || "Unknown"} via WhatsApp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button variant="outline" size="sm">
              Close
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedTicket.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Inbox className="w-16 h-16 mb-4 opacity-40" />
              <p>No messages yet</p>
            </div>
          ) : (
            selectedTicket.messages.map((msg) => {
              const isMe = msg.senderId === "me";
              const sender = isMe
                ? { name: "You", avatar: null }
                : USERS.find((u) => u.id === msg.senderId) || { name: "Customer", avatar: null };

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-4 max-w-3xl",
                    isMe ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className="flex-shrink-0">
                    {isMe ? (
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        YOU
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold text-xs">
                        {sender.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {sender.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(msg.timestamp || new Date(), "HH:mm")}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none"
                      )}
                    >
                      {msg.content || msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {selectedTicket.messages?.length > 0 &&
            selectedTicket.messages.at(-1)?.senderId !== "me" && (
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="text-xs text-gray-500 font-medium">Suggested replies:</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Request ID proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full"
                >
                  Ask for screenshot of error
                </Button>
              </div>
            )}

          <div className="relative">
            <textarea
              placeholder="Type your reply..."
              className="w-full p-4 pr-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[76px]"
              rows={3}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button className="h-9 w-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Knowledge Base */}
      <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-[#111827] border-l border-gray-200 dark:border-gray-800 flex flex-col hidden xl:flex">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Knowledge Base</h3>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 pr-12 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 bg-black dark:bg-white text-white dark:text-black rounded-lg"
            >
              <span className="text-lg leading-none">+</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {KNOWLEDGE_BASE.map((article) => (
            <div
              key={article.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    article.category === "Infrastructure"
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30"
                      : article.category === "User Guide"
                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                      : article.category === "Sales"
                      ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                      : "bg-green-100 text-green-600 dark:bg-green-900/30"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              </div>

              <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                {article.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                {article.description || article.excerpt}
              </p>

              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {article.category}
                </span>
                <span>{article.date || "Recent"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}