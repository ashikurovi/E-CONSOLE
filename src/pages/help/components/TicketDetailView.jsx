import React from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Image as ImageIcon,
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
  const selectedTicket =
    TICKETS.find((t) => t.id === selectedTicketId) || TICKETS[0];

  const requester = USERS.find((u) => u.id === selectedTicket?.requesterId);

  return (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
      {/* Left Sidebar - Ticket List */}
      <div
        className={cn(
          "w-80 flex-shrink-0 bg-white dark:bg-[#1a1f26] border-r border-gray-200 dark:border-gray-800 flex-col transition-all duration-300 hidden md:flex",
          !sidebarOpen && "w-0 overflow-hidden border-none"
        )}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView("list")}
            className="gap-2 text-gray-500"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Communications
            </h3>
          </div>
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-full h-9 pl-9 rounded-lg bg-gray-50 dark:bg-gray-800 border-none text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {TICKETS.map((ticket) => {
            const u = USERS.find((user) => user.id === ticket.requesterId);
            const isSelected = ticket.id === selectedTicketId;

            return (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(ticket.id)}
                className={cn(
                  "p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                  isSelected &&
                    "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                    {u?.company}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {format(ticket.date, "MMM d")}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1 truncate">
                  {ticket.subject}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={ticket.status} />
                  <span className="text-xs text-gray-400">
                    #{ticket.id.replace("#", "")}
                  </span>
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
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveView("list")}
              className="md:hidden mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex mr-2"
            >
              {sidebarOpen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>

            <div className="flex flex-col">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedTicket.id} • {selectedTicket.subject}
              </h2>
              <span className="text-xs text-gray-500">
                Requested by {requester?.name} via Whatsapp
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Phone className="w-4 h-4" /> Call
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Clock className="w-4 h-4" /> Snooze
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
          {selectedTicket.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Inbox className="w-12 h-12 mb-2 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            selectedTicket.messages.map((msg) => {
              const isMe = msg.senderId === "me";
              const sender = isMe
                ? { name: "Me", avatar: "" }
                : USERS.find((u) => u.id === msg.senderId);

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
                        ME
                      </div>
                    ) : (
                      <img
                        src={sender?.avatar}
                        alt={sender?.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                  </div>

                  <div
                    className={cn(
                      "flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {sender?.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {format(msg.timestamp, "HH:mm a")}
                      </span>
                    </div>

                    <div
                      className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-none"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-[#1a1f26] border-t border-gray-200 dark:border-gray-800">
          {selectedTicket.messages.length > 0 &&
            selectedTicket.messages.at(-1)?.senderId !== "me" && (
              <div className="mb-3 flex items-center gap-2">
                <div className="text-xs text-gray-500">Suggested:</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full bg-blue-50 text-blue-600 border-blue-100"
                >
                  <Sparkles className="w-3 h-3 mr-1" /> Request ID proof
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full"
                >
                  Ask for screenshot
                </Button>
              </div>
            )}

          <div className="relative">
            <div className="absolute top-0 left-0 w-full h-full rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 flex flex-col transition-shadow focus-within:ring-2 focus-within:ring-blue-500/20">
              <textarea
                placeholder="Type your message..."
                className="w-full h-full p-4 resize-none outline-none text-sm bg-transparent"
                rows={3}
              />
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                  >
                    <p className="font-bold">A</p>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                >
                  <Send className="w-3 h-3" /> Send
                </Button>
              </div>
            </div>
            {/* Spacer to prevent overlap issues */}
            <div className="h-32" />
          </div>
        </div>
      </div>

      {/* Right Sidebar - Knowledge Base */}
      <div className="w-80 flex-shrink-0 bg-gray-50 dark:bg-[#111827] border-l border-gray-200 dark:border-gray-800 flex flex-col hidden xl:flex">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">
            Knowledge base
          </h3>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Server capacity"
              className="w-full h-10 pl-9 pr-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm"
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
          {KNOWLEDGE_BASE.map((kb) => (
            <div
              key={kb.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    kb.category === "Infrastructure"
                      ? "bg-purple-100 text-purple-600"
                      : kb.category === "User Guide"
                      ? "bg-red-100 text-red-600"
                      : kb.category === "Sales"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </Button>
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {kb.title}
              </h4>
              <p className="text-xs text-gray-500 mb-3">
                A better way to tell which species are vulnerable
              </p>
              <div className="flex items-center justify-between text-[10px] text-gray-400">
                <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                  {kb.type}
                </span>
                <span>{kb.date || "Just now"}</span>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" /> Suggested Article
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-2">
              Based on the customer's query about "Login", we found this:
            </p>
            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg border border-blue-100 dark:border-blue-800 text-sm font-medium">
              Reset Password Flow
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
