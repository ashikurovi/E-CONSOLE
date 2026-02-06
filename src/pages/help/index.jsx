import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TICKETS } from "./data";
import TicketListView from "./components/TicketListView";
import TicketCreateView from "./components/TicketCreateView";
import TicketDetailView from "./components/TicketDetailView";

export default function HelpPage() {
  const [activeView, setActiveView] = useState("list"); // 'list' | 'detail' | 'create'
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredTickets = useMemo(() => {
    if (activeTab === "all") return TICKETS;
    if (activeTab === "active")
      return TICKETS.filter((t) => t.status !== "closed");
    return TICKETS.filter((t) => t.status === activeTab);
  }, [activeTab]);

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
            <TicketListView
              setActiveView={setActiveView}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredTickets={filteredTickets}
              setSelectedTicketId={setSelectedTicketId}
            />
          </motion.div>
        ) : activeView === "create" ? (
          <motion.div
            key="create"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <TicketCreateView setActiveView={setActiveView} />
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <TicketDetailView
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              setActiveView={setActiveView}
              selectedTicketId={selectedTicketId}
              setSelectedTicketId={setSelectedTicketId}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
