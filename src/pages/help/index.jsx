import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Send,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Inbox,
  FileText,
  Settings,
  Zap,
  MessageSquare,
  Sparkles,
  Phone,
  MoreVertical,
  ArrowLeft,
  LayoutGrid,
  List,
  Search as SearchIcon,
  HelpCircle,
  BookOpen,
  CornerUpLeft,
  Smile,
  Image as ImageIcon,
  Mic,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Mock Data ---

const USERS = [
  {
    id: "u1",
    name: "Simin Nikmanesh",
    avatar: "https://i.pravatar.cc/150?u=u1",
    email: "simin@tica.co",
    company: "Tica Co.",
  },
  {
    id: "u2",
    name: "Aaron Wang",
    avatar: "https://i.pravatar.cc/150?u=u2",
    email: "aaron@floratina.com",
    company: "Floratina",
  },
  {
    id: "u3",
    name: "Ava Taylor",
    avatar: "https://i.pravatar.cc/150?u=u3",
    email: "ava@melorinshop.com",
    company: "Melorinshop",
  },
  {
    id: "u4",
    name: "Shamima Melen",
    avatar: "https://i.pravatar.cc/150?u=u4",
    email: "shamima@shoppine.com",
    company: "Shoppine",
  },
  {
    id: "u5",
    name: "Honey Harper",
    avatar: "https://i.pravatar.cc/150?u=u5",
    email: "honey@brilliant.com",
    company: "Brilliant Boutique",
  },
];

const TICKETS = [
  {
    id: "#665",
    requesterId: "u2",
    priority: "highest",
    subject: "Login issue",
    status: "open",
    date: new Date(2023, 10, 24, 9, 13),
    tags: ["Login", "Bug"],
    messages: [
      {
        id: "m1",
        senderId: "u2",
        content:
          "I cannot log in to my account. It says invalid credentials but I just reset my password.",
        timestamp: new Date(2023, 10, 24, 9, 13),
      },
      {
        id: "m2",
        senderId: "me",
        content: "Hi Aaron, let me check the logs for you. One moment please.",
        timestamp: new Date(2023, 10, 24, 9, 15),
      },
    ],
  },
  {
    id: "#662",
    requesterId: "u3",
    priority: "low",
    subject: "Customer complaint",
    status: "pending",
    date: new Date(2023, 10, 23, 14, 20),
    tags: ["Complaint", "Service"],
    messages: [
      {
        id: "m1",
        senderId: "u3",
        content: "A customer is complaining about shipping delays.",
        timestamp: new Date(2023, 10, 23, 14, 20),
      },
    ],
  },
  {
    id: "#642",
    requesterId: "u1",
    priority: "highest",
    subject: "Information request",
    status: "open",
    date: new Date(2023, 10, 24, 9, 13),
    tags: ["Info", "Sales"],
    messages: [
      {
        id: "m1",
        senderId: "u1",
        content:
          "I have already attached all of the documents in the list above. So I was wondering if you can give me more details.",
        timestamp: new Date(2023, 10, 24, 9, 13),
      },
      {
        id: "m2",
        senderId: "u1",
        content:
          "I have attached a screenshot for your reference so you can see what I am talking about.",
        timestamp: new Date(2023, 10, 24, 11, 4),
      },
      {
        id: "m3",
        senderId: "me",
        content: "OK. Let me check and I notify you if we need anything else.",
        timestamp: new Date(2023, 10, 24, 11, 7),
      },
      {
        id: "m4",
        senderId: "me",
        content:
          "Everything seems OK. We only need a copy of your partner ID card. Please attach it under the 'Personal Information' section.",
        timestamp: new Date(2023, 10, 24, 12, 8),
      },
    ],
  },
  {
    id: "#570",
    requesterId: "u4",
    priority: "high",
    subject: "More information regarding the...",
    status: "pending",
    date: new Date(2023, 10, 22, 10, 0),
    tags: ["Info"],
    messages: [],
  },
  {
    id: "#659",
    requesterId: "u5",
    priority: "high",
    subject: "Updating details",
    status: "closed",
    date: new Date(2023, 10, 21, 16, 45),
    tags: ["Account"],
    messages: [],
  },
];

const KNOWLEDGE_BASE = [
  {
    id: "kb1",
    title: "Server capacity",
    category: "Infrastructure",
    type: "Article",
  },
  {
    id: "kb2",
    title: "Account Creation and Management",
    category: "User Guide",
    type: "Article",
    date: "Last Edited Mar 17, 2022",
  },
  {
    id: "kb3",
    title: "Adding Products to the Cart",
    category: "User Guide",
    type: "User guide",
    date: "Last Edited Mar 16, 2022",
  },
  {
    id: "kb4",
    title: "Applying Discount Codes",
    category: "Sales",
    type: "Tutorial",
    date: "Last Edited Mar 14, 2022",
  },
  {
    id: "kb5",
    title: "Billing and Payment Methods",
    category: "Finance",
    type: "FAQ",
    date: "Last Edited Mar 8, 2022",
  },
];

// --- Helper Components ---

function StatusBadge({ status }) {
  const styles = {
    open: "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800",
    pending:
      "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800",
    closed:
      "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800",
    "on hold":
      "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/20 dark:border-orange-800",
  };
  const style = styles[status?.toLowerCase()] || styles.open;

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        style,
      )}
    >
      {status}
    </span>
  );
}

function PriorityIcon({ priority }) {
  const p = priority?.toLowerCase();
  if (p === "highest" || p === "high")
    return (
      <div className="text-red-500">
        <ArrowLeft className="w-4 h-4 rotate-90" />
      </div>
    );
  if (p === "medium")
    return (
      <div className="text-yellow-500">
        <LayoutGrid className="w-3 h-3" />
      </div>
    ); // Placeholder
  return (
    <div className="text-blue-500">
      <ArrowLeft className="w-4 h-4 -rotate-90" />
    </div>
  );
}

// --- Main Page Component ---

export default function HelpPage() {
  const [activeView, setActiveView] = useState("list"); // 'list' | 'detail'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'open', 'pending', etc.
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredTickets = useMemo(() => {
    if (activeTab === "all") return TICKETS;
    if (activeTab === "active")
      return TICKETS.filter((t) => t.status !== "closed");
    return TICKETS.filter((t) => t.status === activeTab);
  }, [activeTab]);

  const selectedTicket = useMemo(
    () => TICKETS.find((t) => t.id === selectedTicketId) || TICKETS[0],
    [selectedTicketId],
  );

  const requester = USERS.find((u) => u.id === selectedTicket?.requesterId);

  // --- List View Component ---
  const TicketListView = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => setActiveView("create")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20">
            + New ticket
          </Button>
        </div>
        
        <div className="flex items-center gap-3 flex-1 md:justify-end">
          <div className="relative w-full md:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requester"
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button
            variant="outline"
            className="rounded-xl gap-2 border-gray-200 dark:border-gray-700"
          >
            Filters <ChevronRight className="w-4 h-4 rotate-90" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
        <div className="flex items-center gap-6">
          {[
            { id: "active", label: "All active tickets", count: 137 },
            { id: "open", label: "Open", count: 86 },
            { id: "pending", label: "Pending", count: 6 },
            { id: "on hold", label: "On hold", count: 17 },
            { id: "closed", label: "Closed", count: 28 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2",
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              {tab.label}
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full text-gray-500">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase min-w-[800px] md:min-w-0">
        <div className="col-span-1 flex items-center justify-center">
          <input type="checkbox" className="rounded border-gray-300" />
        </div>
        <div className="col-span-1">ID</div>
        <div className="col-span-3">Requester</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-3">Subject</div>
        <div className="col-span-2 flex justify-between">Status</div>
      </div>

      {/* Table Rows */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <div className="min-w-[800px] md:min-w-0">
          {filteredTickets.map((ticket) => {
            const u = USERS.find((user) => user.id === ticket.requesterId);
            return (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicketId(ticket.id);
                  setActiveView("detail");
                }}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors items-center group"
              >
                <div className="col-span-1 flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="col-span-1 font-medium text-sm text-gray-900 dark:text-white">
                  {ticket.id}
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={u?.avatar}
                      alt={u?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {u?.company}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      User: {u?.name}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <PriorityIcon priority={ticket.priority} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {ticket.priority}
                  </span>
                </div>
                <div className="col-span-3 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {ticket.subject}
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <StatusBadge status={ticket.status} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button size="sm" className="h-8 w-8 p-0 bg-blue-600 text-white">
          1
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          2
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          3
        </Button>
        <span className="text-gray-400">...</span>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          11
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // --- Create View Component ---
  const TicketCreateView = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveView("list")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Ticket</h2>
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
         <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Name / Requester</label>
                  <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="e.g. Acme Corp" className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                  <input type="text" placeholder="Brief summary of the issue" className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
               </div>
            </div>

            {/* Priority & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <div className="relative">
                     <select className="w-full h-11 pl-4 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none">
                        <option value="high">Important (High)</option>
                        <option value="medium">Mid Important (Medium)</option>
                        <option value="low">Low Priority</option>
                     </select>
                     <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags / Options</label>
                  <div className="relative">
                     <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input type="text" placeholder="Add tags separated by comma" className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                  </div>
               </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
               <textarea rows={6} className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all" placeholder="Detailed description of the problem..." />
            </div>

             {/* Actions */}
             <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="ghost" onClick={() => setActiveView("list")}>Cancel</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px] rounded-xl shadow-lg shadow-blue-500/20">
                   Create Ticket
                </Button>
             </div>
         </div>
      </div>
    </div>
  );

  // --- Detail View Component ---
  const TicketDetailView = () => (
    <div className="flex h-full bg-gray-100 dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
      {/* 1. Left Sidebar: Communications List */}
      <div
        className={cn(
          "w-80 flex-shrink-0 bg-white dark:bg-[#1a1f26] border-r border-gray-200 dark:border-gray-800 flex-col transition-all duration-300 hidden md:flex",
          !sidebarOpen && "w-0 overflow-hidden border-none",
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
                    "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600",
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

      {/* 2. Middle: Chat Area */}
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
                    isMe ? "ml-auto flex-row-reverse" : "",
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
                      isMe ? "items-end" : "items-start",
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
                          : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-tl-none",
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
            selectedTicket.messages[selectedTicket.messages.length - 1]
              .senderId !== "me" && (
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
            <div className="h-32"></div> {/* Spacer for absolute height */}
          </div>
        </div>
      </div>

      {/* 3. Right Sidebar: Knowledge Base */}
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
                          : "bg-green-100 text-green-600",
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

  return (
    <div className="h-[calc(100vh-6rem)] w-full">
      <AnimatePresence mode="wait">
        {activeView === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full"
          >
            <TicketListView />
          </motion.div>
        ) : activeView === "create" ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <TicketCreateView />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <TicketDetailView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
