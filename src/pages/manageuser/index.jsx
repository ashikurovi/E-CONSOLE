import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Mail,
  Phone,
  MapPin,
  Activity,
  User,
  ChevronRight,
  ChevronLeft,
  Settings,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// --- Mock Data ---
const MOCK_USERS = [
  {
    id: "USR-001",
    name: "Alex Morgan",
    companyName: "SquadCart Inc.",
    email: "owner@squadcart.com",
    phone: "+1 (555) 123-4567",
    role: "SYSTEM_OWNER",
    permissions: ["ALL_ACCESS"],
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    joinedDate: "2023-01-15",
    lastActive: "Just now",
    activities: [
      {
        id: 1,
        text: "Updated system settings",
        time: "10 mins ago",
        type: "system",
      },
      {
        id: 2,
        text: "Created new banner campaign",
        time: "2 hours ago",
        type: "create",
      },
      {
        id: 3,
        text: "Exported monthly reports",
        time: "Yesterday",
        type: "export",
      },
    ],
  },
  {
    id: "USR-002",
    name: "Sarah Chen",
    companyName: "Tech Solutions Ltd",
    email: "admin@techsolutions.com",
    phone: "+1 (555) 987-6543",
    role: "SUPER_ADMIN",
    permissions: ["MANAGE_USERS", "VIEW_REPORTS"],
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    joinedDate: "2023-03-22",
    lastActive: "1 hour ago",
    activities: [
      {
        id: 1,
        text: "Resolved ticket #442",
        time: "1 hour ago",
        type: "resolve",
      },
      { id: 2, text: "Changed password", time: "3 days ago", type: "security" },
    ],
  },
  {
    id: "USR-003",
    name: "Michael Ross",
    companyName: "Global Logistics",
    email: "mike.ops@logistics.com",
    phone: "+1 (555) 789-0123",
    role: "EMPLOYEE",
    permissions: ["VIEW_ORDERS", "MANAGE_SHIPPING"],
    isActive: false,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    joinedDate: "2023-06-10",
    lastActive: "5 days ago",
    activities: [
      {
        id: 1,
        text: "Account deactivated",
        time: "5 days ago",
        type: "system",
      },
      {
        id: 2,
        text: "Failed login attempt",
        time: "6 days ago",
        type: "security",
      },
    ],
  },
  {
    id: "USR-004",
    name: "Emily Davis",
    companyName: "Creative Design Co",
    email: "emily@creative.com",
    phone: "+1 (555) 456-7890",
    role: "EMPLOYEE",
    permissions: ["MANAGE_PRODUCTS"],
    isActive: true,
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    joinedDate: "2023-08-05",
    lastActive: "2 mins ago",
    activities: [
      {
        id: 1,
        text: "Uploaded 5 new product images",
        time: "2 mins ago",
        type: "create",
      },
      {
        id: 2,
        text: "Edited category 'Summer Collection'",
        time: "30 mins ago",
        type: "update",
      },
    ],
  },
  {
    id: "USR-005",
    name: "David Kim",
    companyName: "Retail Giants",
    email: "david.k@retail.com",
    phone: "+1 (555) 222-3333",
    role: "MANAGER",
    permissions: ["MANAGE_ORDERS", "VIEW_CUSTOMERS"],
    isActive: true,
    image: null,
    joinedDate: "2023-11-12",
    lastActive: "1 day ago",
    activities: [
      {
        id: 1,
        text: "Approved refund for Order #992",
        time: "1 day ago",
        type: "update",
      },
    ],
  },
];

// --- Components ---

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
      active
        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
        : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

const RoleBadge = ({ role }) => {
  const colors = {
    SYSTEM_OWNER:
      "text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
    SUPER_ADMIN:
      "text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-900/20 dark:border-purple-800",
    MANAGER:
      "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/20 dark:border-orange-800",
    EMPLOYEE:
      "text-slate-700 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800 dark:border-slate-700",
  };

  if (!role) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700">
        No Role
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[role] || colors.EMPLOYEE}`}
    >
      {role.replace(/_/g, " ")}
    </span>
  );
};

const ManageUsersPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [users, setUsers] = useState(MOCK_USERS);
  const [selectedUserId, setSelectedUserId] = useState(MOCK_USERS[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId],
  );

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "All Users"
          ? true
          : activeTab === "Active"
            ? user.isActive
            : activeTab === "Inactive"
              ? !user.isActive
              : activeTab === "System Owner"
                ? user.role === "SYSTEM_OWNER"
                : activeTab === "Admins"
                  ? ["SUPER_ADMIN", "MANAGER"].includes(user.role)
                  : activeTab === "Employees"
                    ? user.role === "EMPLOYEE"
                    : true;
      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUserId === id) {
        setSelectedUserId(null);
        setShowMobileDetail(false);
      }
      toast.success("User deleted successfully");
    }
  };

  // Mobile detail view handler
  const handleUserClick = (id) => {
    setSelectedUserId(id);
    // On mobile, show detail view
    if (window.innerWidth < 1024) {
      setShowMobileDetail(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0B0D12] p-4 md:p-6 lg:h-screen lg:overflow-hidden flex flex-col">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              System Users
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage access and permissions
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/manage-users/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* LEFT SIDEBAR - FILTERS */}
        <div className="hidden lg:flex lg:col-span-2 xl:col-span-2 flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Views Group */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">
              Views
            </h3>
            <div className="space-y-1">
              {[
                { name: "All Users", count: users.length, icon: User },
                {
                  name: "Active",
                  count: users.filter((u) => u.isActive).length,
                  icon: CheckCircle,
                },
                {
                  name: "Inactive",
                  count: users.filter((u) => !u.isActive).length,
                  icon: XCircle,
                },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.name
                      ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon
                      className={`h-4 w-4 ${activeTab === item.name ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === item.name
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Roles Group */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">
              Roles
            </h3>
            <div className="space-y-1">
              {[
                {
                  name: "System Owner",
                  count: users.filter((u) => u.role === "SYSTEM_OWNER").length,
                },
                {
                  name: "Admins",
                  count: users.filter((u) =>
                    ["SUPER_ADMIN", "MANAGER"].includes(u.role),
                  ).length,
                },
                {
                  name: "Employees",
                  count: users.filter((u) => u.role === "EMPLOYEE").length,
                },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    activeTab === item.name
                      ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield
                      className={`h-4 w-4 ${activeTab === item.name ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === item.name
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER - USER LIST */}
        <div className="col-span-1 lg:col-span-6 xl:col-span-7 flex flex-col bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium hidden sm:inline-block">
                {filteredUsers.length} Users Found
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-8 md:col-span-4 pl-2 md:pl-8">User Details</div>
            <div className="hidden md:block md:col-span-3">Role</div>
            <div className="col-span-4 md:col-span-3 text-right md:text-left">
              Status
            </div>
            <div className="hidden md:block md:col-span-2 text-right">ID</div>
          </div>

          {/* List Items */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <motion.div
                  layoutId={user.id}
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={`group relative grid grid-cols-12 items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedUserId === user.id
                      ? "bg-indigo-50/80 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent"
                  }`}
                >
                  {/* Selection Indicator */}
                  {selectedUserId === user.id && (
                    <motion.div
                      layoutId="selection-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full"
                    />
                  )}

                  <div className="col-span-8 md:col-span-4 flex items-center gap-3 pl-2 md:pl-4">
                    <div className="relative">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="h-9 w-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center ring-2 ring-white dark:ring-gray-800 text-indigo-600 dark:text-indigo-400 font-medium text-xs">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-gray-800 ${user.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4
                        className={`text-sm font-semibold truncate ${selectedUserId === user.id ? "text-indigo-900 dark:text-indigo-100" : "text-gray-900 dark:text-white"}`}
                      >
                        {user.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="hidden md:block md:col-span-3">
                    <RoleBadge role={user.role} />
                  </div>

                  <div className="col-span-4 md:col-span-3 flex justify-end md:justify-start">
                    <StatusBadge active={user.isActive} />
                  </div>

                  <div className="hidden md:block md:col-span-2 text-right">
                    <span className="text-xs font-mono text-gray-400">
                      #{user.id.split("-")[1]}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Search className="h-10 w-10 mb-3 opacity-20" />
                <p>No users found</p>
              </div>
            )}
          </div>

          {/* Footer Pagination */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Showing {filteredUsers.length} users</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                disabled
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - DETAILS (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          {selectedUser ? (
            <motion.div
              key={selectedUser.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-[#1a1f26] rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col overflow-hidden"
            >
              {/* Detail Header */}
              <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none" />

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <span className="font-mono text-xs text-gray-400">
                    #{selectedUser.id}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-3">
                    {selectedUser.image ? (
                      <img
                        src={selectedUser.image}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover border-4 border-white dark:border-[#1a1f26] shadow-md"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center border-4 border-white dark:border-[#1a1f26] shadow-md">
                        <User className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-white dark:bg-[#1a1f26] rounded-full p-1">
                      <div
                        className={`h-3 w-3 rounded-full ${selectedUser.isActive ? "bg-green-500" : "bg-gray-300"}`}
                      />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedUser.name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="mt-3">
                    <RoleBadge role={selectedUser.role} />
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Contact Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {selectedUser.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedUser.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedUser.companyName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Summary / Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Permission Summary
                    </h4>
                    <span className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {selectedUser.permissions.length} Assigned
                    </span>
                  </div>
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                    <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                      This user has{" "}
                      <span className="font-semibold">Full Access</span> to the
                      Dashboard and can manage orders, products, and system
                      settings. Security level is high.
                    </p>
                    <div className="mt-3 w-full bg-indigo-200 dark:bg-indigo-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: "92%" }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-indigo-500">
                      <span>Access Level</span>
                      <span>92%</span>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Recent Activity
                  </h4>
                  <div className="relative border-l border-gray-200 dark:border-gray-800 ml-2 space-y-4 pb-2">
                    {selectedUser.activities?.map((activity, idx) => (
                      <div key={idx} className="ml-4 relative">
                        <div
                          className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#1a1f26] ${
                            activity.type === "system"
                              ? "bg-red-400"
                              : activity.type === "create"
                                ? "bg-green-400"
                                : "bg-blue-400"
                          }`}
                        />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {activity.text}
                        </p>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {activity.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-2">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20"
                  onClick={() =>
                    navigate(`/manage-users/edit/${selectedUser.id}`)
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 rounded-xl"
                  onClick={() => handleDelete(selectedUser.id)}
                >
                  Remove User
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800">
              <User className="h-12 w-12 mb-3 opacity-20" />
              <p>Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS MODAL */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden bg-[#F3F4F6] dark:bg-[#0B0D12] flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#1a1f26]">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileFilters(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Views Group */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">
                  Views
                </h3>
                <div className="space-y-1">
                  {[
                    { name: "All Users", count: users.length, icon: User },
                    {
                      name: "Active",
                      count: users.filter((u) => u.isActive).length,
                      icon: CheckCircle,
                    },
                    {
                      name: "Inactive",
                      count: users.filter((u) => !u.isActive).length,
                      icon: XCircle,
                    },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === item.name
                          ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-800"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={`h-4 w-4 ${activeTab === item.name ? "text-indigo-600" : "text-gray-400"}`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === item.name
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Roles Group */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 pl-2">
                  Roles
                </h3>
                <div className="space-y-1">
                  {[
                    {
                      name: "System Owner",
                      count: users.filter((u) => u.role === "SYSTEM_OWNER")
                        .length,
                    },
                    {
                      name: "Admins",
                      count: users.filter((u) =>
                        ["SUPER_ADMIN", "MANAGER"].includes(u.role),
                      ).length,
                    },
                    {
                      name: "Employees",
                      count: users.filter((u) => u.role === "EMPLOYEE").length,
                    },
                  ].map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActiveTab(item.name);
                        setShowMobileFilters(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === item.name
                          ? "bg-white dark:bg-[#1a1f26] text-indigo-600 shadow-sm border border-gray-100 dark:border-gray-800"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Shield
                          className={`h-4 w-4 ${activeTab === item.name ? "text-indigo-600" : "text-gray-400"}`}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          activeTab === item.name
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE DETAIL MODAL/OVERLAY */}
      <AnimatePresence>
        {showMobileDetail && selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden bg-white dark:bg-[#1a1f26] flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setShowMobileDetail(false)}
              >
                <ChevronLeft className="h-5 w-5 mr-1" /> Back
              </Button>
              <h3 className="font-semibold">User Details</h3>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Reusing the detail view content structure for mobile */}
              <div className="flex flex-col items-center text-center mb-6">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt=""
                    className="h-24 w-24 rounded-full object-cover mb-3"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-3">
                    <User className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUser.name}
                </h2>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="mt-2 flex gap-2 justify-center">
                  <RoleBadge role={selectedUser.role} />
                  <StatusBadge active={selectedUser.isActive} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Contact Info
                  </h4>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Phone className="h-4 w-4" /> {selectedUser.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="h-4 w-4" /> {selectedUser.companyName}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {selectedUser.activities?.map((activity, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div
                          className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                            activity.type === "system"
                              ? "bg-red-400"
                              : "bg-green-400"
                          }`}
                        />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-400">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <Button
                className="w-full bg-indigo-600 text-white rounded-xl py-6"
                onClick={() =>
                  navigate(`/manage-users/edit/${selectedUser.id}`)
                }
              >
                Edit Details
              </Button>
              <Button
                variant="ghost"
                className="w-full text-red-600"
                onClick={() => handleDelete(selectedUser.id)}
              >
                Remove User
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageUsersPage;
