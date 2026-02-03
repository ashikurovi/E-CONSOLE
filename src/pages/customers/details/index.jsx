import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Edit3,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Plus,
  MoreVertical,
  ChevronRight,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  CreditCard,
  Package,
  Calendar,
  User,
  Trash2,
  ShieldAlert,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * CustomerDetailsPage Component
 * Redesigned to match the application's "Order Details" and "Premium" standards.
 */
export default function CustomerDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock Data (Preserving existing data but structured for new layout)
  const customer = {
    id: "CI-12345",
    name: "Robert George",
    email: "john@example.com",
    phone: "+1 58578 54840",
    company: "TrueAI Technologies",
    website: "www.example.com",
    address: "4712 Cherry Ridge Drive Rochester, NY 14620",
    status: "Active",
    avatar: "https://i.pravatar.cc/150?u=Robert",
    joinedDate: "2024-01-15",
    totalSpent: "$56,900.54",
    outstanding: "$7,484.54",
    ordersCount: 142,
  };

  const stats = [
    {
      label: "Total Spent",
      value: customer.totalSpent,
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    {
      label: "Outstanding",
      value: customer.outstanding,
      icon: CreditCard,
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/20",
      border: "border-rose-200 dark:border-rose-800",
    },
    {
      label: "Total Orders",
      value: customer.ordersCount,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
    },
  ];

  const invoices = [
    {
      id: "INV00025",
      date: "22 Feb 2025",
      amount: "$10,000",
      status: "Paid",
      color:
        "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      id: "INV00024",
      date: "07 Feb 2025",
      amount: "$25,750",
      status: "Unpaid",
      color:
        "text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    },
    {
      id: "INV00023",
      date: "30 Jan 2025",
      amount: "$50,125",
      status: "Cancelled",
      color: "text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
    },
    {
      id: "INV00022",
      date: "17 Jan 2025",
      amount: "$75,900",
      status: "Partial",
      color: "text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
    },
  ];

  const activities = [
    {
      title: "Status Changed to Partially Paid",
      date: "19 Jan 2025",
      icon: CheckCircle2,
      color: "text-indigo-500 bg-indigo-50",
    },
    {
      title: "$300 Partial Amount Paid on Paypal",
      date: "18 Jan 2025",
      icon: DollarSign,
      color: "text-blue-500 bg-blue-50",
    },
    {
      title: "New expenses added #TR018756",
      date: "18 Jan 2025",
      icon: FileText,
      color: "text-purple-500 bg-purple-50",
    },
    {
      title: "Estimate Created #ES458789",
      date: "17 Jan 2025",
      icon: Plus,
      color: "text-indigo-500 bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-10 min-h-screen font-sans bg-[#f8f9fa] dark:bg-[#0b0f14]">
      {/* --- HEADER --- */}
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white"
              onClick={() => navigate("/customers")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                {customer.name}
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wide">
                  {customer.status}
                </span>
              </h1>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                Customer ID:{" "}
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {customer.id}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                Member since{" "}
                {new Date(customer.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:flex-none h-11 rounded-xl border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
            <Button
              variant="destructive"
              className="flex-1 md:flex-none h-11 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-4 border ${stat.bg} ${stat.border} flex items-center gap-4`}
            >
              <div
                className={`p-3 rounded-lg bg-white dark:bg-black/20 ${stat.color}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider opacity-70 ${stat.color}`}
                >
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* --- LEFT COLUMN: Main Content --- */}
        <div className="xl:col-span-2 space-y-8">
          {/* Profile & Contact Details Card */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                        {customer.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {customer.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 text-indigo-500" />
                        {customer.email}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                        Phone Number
                      </label>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                        <Phone className="w-4 h-4 text-indigo-500" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Billing Address
                    </label>
                    <div className="flex items-start gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-indigo-500 mt-0.5" />
                      <span className="leading-relaxed">
                        {customer.address}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Website
                    </label>
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      <Globe className="w-4 h-4" />
                      <a
                        href={`http://${customer.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {customer.website}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Invoices
                </h3>
              </div>
              <Button
                variant="ghost"
                className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                    <th className="px-8 py-5">Invoice ID</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-8 py-5 font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.id}
                      </td>
                      <td className="px-8 py-5 text-gray-500">{inv.date}</td>
                      <td className="px-8 py-5 font-bold">{inv.amount}</td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${inv.color}`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Sidebar --- */}
        <div className="xl:col-span-1 space-y-8">
          {/* Notes Panel */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Internal Notes
              </h3>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 leading-relaxed">
                "Client prefers communication via email. Follow up regarding the
                renewal of the enterprise plan by next month."
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 rounded-xl border-dashed border-gray-300 dark:border-gray-700 text-gray-500 font-bold hover:text-indigo-600 hover:border-indigo-300"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Note
            </Button>
          </div>

          {/* Activities Timeline */}
          <div className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>
            <div className="space-y-8 relative pl-2">
              <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-100 dark:bg-gray-800" />
              {activities.map((act, idx) => (
                <div key={idx} className="relative flex items-start gap-5">
                  <div
                    className={`z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a1f26] shadow-sm ${act.color}`}
                  >
                    <act.icon className="w-4 h-4" />
                  </div>
                  <div className="pt-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {act.title}
                    </p>
                    <p className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                      {act.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              className="w-full mt-8 text-xs font-bold uppercase text-gray-400 tracking-widest hover:text-indigo-600"
            >
              View Full History
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
