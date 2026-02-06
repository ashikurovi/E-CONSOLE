import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Search as SearchIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge, PriorityIcon } from "./HelpComponents";
import { USERS } from "../data";

export default function TicketListView({
  setActiveView,
  activeTab,
  setActiveTab,
  filteredTickets,
  setSelectedTicketId,
}) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Button
          onClick={() => setActiveView("create")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20"
        >
          + New ticket
        </Button>

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
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
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
}
