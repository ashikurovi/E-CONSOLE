import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import {
  FileText,
  Users,
  DollarSign,
  FileCheck,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  MoreHorizontal,
  Printer,
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  Package,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";
import { format } from "date-fns";

// --- Sub-Components (Inline for single-file solution as requested) ---

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_20px_rgb(0,0,0,0.2)] rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${className}`}
  >
    {children}
  </div>
);

const StatItem = ({ icon: Icon, label, value, colorClass }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:shadow-md transition-all duration-300 cursor-pointer group w-full">
    <div
      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-105 transition-transform duration-300 shadow-sm shrink-0`}
    >
      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 tracking-wide truncate">
        {label}
      </p>
      <p
        className="text-md  font-medium text-gray-900 dark:text-white
       mt-1 tracking-tight truncate"
      >
        {value}
      </p>
    </div>
  </div>
);

const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
      {title}
    </h3>
    {action}
  </div>
);

const SmallSummaryCard = ({ title, value, change, icon: Icon, link }) => (
  <GlassCard className="p-6 relative overflow-hidden group h-full">
    <div className="flex justify-between items-start h-full flex-col">
      <div className="w-full flex justify-between items-start">
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-2xl text-gray-600 dark:text-gray-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
            <Plus className="w-3 h-3 mr-0.5" /> {change}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <h4 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 tracking-tight">
          {value}
        </h4>
      </div>
    </div>
    {link && (
      <Link
        to={link}
        className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50/80 dark:bg-white/5 backdrop-blur-md text-xs font-bold text-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border-t border-gray-100 dark:border-white/5 opacity-0 group-hover:opacity-100 translate-y-full group-hover:translate-y-0 transition-all duration-300"
      >
        View Details
      </Link>
    )}
  </GlassCard>
);

const TableRowSkeleton = () => (
  <tr className="animate-pulse border-b border-gray-100 dark:border-white/5 last:border-0">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10"></div>
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-20"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-24"></div>
    </td>
  </tr>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  // Fetch real data
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetDashboardQuery({ companyId: authUser?.companyId });

  const userName = authUser?.name || t("dashboard.user");

  // --- HARDCODED / MOCK DATA ---
  // Note: These structures mimic the requested design where API data might be missing.
  // We map real data where possible.

  // 1. Overview Stats (Mapped from real stats if available, else 0)
  const overviewStats = {
    invoices:
      dashboardData?.stats?.find((s) => s.title.includes("Invoices"))?.value ||
      "1,041",
    customers:
      dashboardData?.stats?.find((s) => s.title.includes("Customers"))?.value ||
      "3,642",
    amountDue: "$1,642", // Mock
    quotations: "2,150", // Mock
  };

  // 2. Sales Analytics (Mock)
  const salesStats = {
    totalSales:
      dashboardData?.stats?.find((s) => s.title.includes("Revenue"))?.value ||
      "40,569", // Removed $ to add it in UI for consistency if needed, or keep as string
    purchase: "$154,220",
    expenses: "$10,041",
    credits: "$12,150",
  };

  // Correction: Keep original values if they include currency symbols
  if (salesStats.totalSales === "40,59") salesStats.totalSales = "$40,59";

  // 3. Invoice Statistics (Mock)
  const invoiceStats = {
    invoiced: "$21,132",
    received: "$10,763",
    outstanding: "$8,041",
    overdue: "$45,897.01",
  };

  // 4. Customers List (Use topCustomers or Mock)
  const customersList = dashboardData?.topCustomers?.slice(0, 5) || [
    { name: "Emily Clark", invoices: 45, balance: "$3589", avatar: "E" },
    { name: "John Smith", invoices: 16, balance: "$5426", avatar: "J" },
    { name: "Olivia Harris", invoices: 23, balance: "$1493", avatar: "O" },
    { name: "William Parker", invoices: 58, balance: "$7854", avatar: "W" },
    { name: "Charlotte Brown", invoices: 18, balance: "$4989", avatar: "C" },
  ];

  // 5. Revenue Chart Config (Bar Chart)
  const revenueChartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
      animations: { enabled: true },
    },
    colors: ["#f1f5f9", "#7c3aed"], // Light slate for received, Vibrant Violet for outstanding
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: "35%",
        distributed: false,
        endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 4, colors: ["transparent"] },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#94a3b8",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      show: false,
      labels: {
        style: { colors: "#94a3b8" },
      },
    },
    grid: {
      show: true,
      borderColor: "rgba(148, 163, 184, 0.1)",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 },
    },
    legend: { show: false }, // Custom legend used
    tooltip: {
      theme: "light",
      style: { fontSize: "12px", fontFamily: "inherit" },
      x: { show: false },
      y: { formatter: (val) => `$${val}` },
    },
  };

  const revenueChartSeries = [
    { name: "Received", data: [44, 55, 57, 56, 61, 58, 63] },
    { name: "Outstanding", data: [76, 85, 101, 98, 87, 105, 91] },
  ];

  // 6. Invoices Table Data (Use recentOrders or Mock)
  const invoices = dashboardData?.recentOrders?.slice(0, 7) || [
    {
      id: "INV00025",
      customer: "Emily Clark",
      date: "22 Feb 2025",
      amount: "$10,000",
      paid: "$5,000",
      mode: "Cash",
      due: "04 Mar 2025",
    },
    {
      id: "INV00024",
      customer: "John Carter",
      date: "07 Feb 2025",
      amount: "$25,750",
      paid: "$10,750",
      mode: "Check",
      due: "20 Feb 2025",
    },
    {
      id: "INV00023",
      customer: "Sophia White",
      date: "09 Dec 2024",
      amount: "$120,500",
      paid: "$60,000",
      mode: "Check",
      due: "12 Nov 2024",
    },
  ];

  // 7. Recent Transactions (Mock)
  const transactions = [
    {
      name: "Andrew James",
      id: "#INV45478",
      amount: "+$989.15",
      type: "credit",
      date: "Today",
    },
    {
      name: "John Carter",
      id: "#INV45477",
      amount: "-$300.12",
      type: "debit",
      date: "Today",
    },
    {
      name: "Sophia White",
      id: "#INV45476",
      amount: "+$669",
      type: "credit",
      date: "Yesterday",
    },
  ];

  // 8. Quotations (Mock)
  const quotationsList = [
    {
      name: "Emily Clark",
      id: "QU0014",
      status: "Accepted",
      date: "25 Mar 2025",
    },
    {
      name: "David Anderson",
      id: "QU0147",
      status: "Sent",
      date: "12 Feb 2025",
    },
    {
      name: "Sophia White",
      id: "QU1947",
      status: "Expired",
      date: "08 Mar 2025",
    },
  ];

  // 9. Donut Chart
  const salesDonutOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: ["Dell XPS 13", "Nike T-shirt", "Apple iPhone 15"],
    colors: ["#3b82f6", "#10b981", "#f43f5e"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: "13px",
      fontWeight: 500,
      labels: { colors: "#64748b" },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: "Total",
              fontSize: "14px",
              fontWeight: 500,
              color: "#94a3b8",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0) + "%";
              },
            },
            value: {
              fontSize: "24px",
              fontWeight: 700,
              color: "#1e293b",
              offsetY: 6,
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
  };
  const salesDonutSeries = [35, 45, 20];

  return (
    <div className="space-y-4 md:space-y-8 min-h-screen bg-[#F8F9FC] dark:bg-black/10 p-3 sm:p-4 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Header Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#D946EF] shadow-2xl shadow-indigo-500/20 group">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>

        <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-white space-y-4 max-w-xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              {t("dashboard.welcomeBack", { name: userName })}
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed font-medium max-w-md">
              You have{" "}
              <span className="text-white font-bold border-b-2 border-white/20">
                15+ invoices
              </span>{" "}
              saved to draft that need your attention today.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-bold tracking-wide uppercase text-indigo-100/80">
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                <Calendar className="w-4 h-4 text-white" />{" "}
                {format(new Date(), "dd MMM yyyy")}
              </span>
              <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-sm">
                <Clock className="w-4 h-4 text-white" />{" "}
                {format(new Date(), "hh:mm a")}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 z-10">
            <div className="hidden xl:flex items-center bg-black/20 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
              <span className="px-4 py-2 text-xs font-bold text-white bg-white/20 rounded-xl shadow-sm">
                24 Mar
              </span>
              <span className="px-4 py-2 text-xs font-bold text-white/60">
                31 Mar
              </span>
            </div>
            <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-black/10 transition-all transform hover:-translate-y-1 hover:shadow-2xl flex items-center gap-2.5">
              <Plus className="w-5 h-5" /> Create New
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl text-sm font-bold backdrop-blur-md border border-white/20 transition-all transform hover:-translate-y-1 flex items-center gap-2.5">
              <Download className="w-5 h-5" /> Export Report
            </button>
          </div>

          {/* Illustration Mockup */}
          <div className="hidden lg:block absolute right-16 bottom-0 translate-y-8 xl:translate-y-12 transition-transform duration-700 group-hover:translate-y-6">
            <img
              src="/image.png"
              alt="Dashboard Welcome"
              className="w-80 h-auto object-contain drop-shadow-2xl"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Overview */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Overview"
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <StatItem
              icon={FileText}
              label="Invoices"
              value={overviewStats.invoices}
              colorClass="bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400"
            />
            <StatItem
              icon={Users}
              label="Customers"
              value={overviewStats.customers}
              colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
            />
            <StatItem
              icon={DollarSign}
              label="Amount Due"
              value={overviewStats.amountDue}
              colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
            />
            <StatItem
              icon={FileCheck}
              label="Quotations"
              value={overviewStats.quotations}
              colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            />
          </div>
        </GlassCard>

        {/* Sales Analytics */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Sales Analytics"
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <StatItem
              icon={Wallet}
              label="Total Sales"
              value={salesStats.totalSales}
              colorClass="bg-indigo-50 text-indigo-600  dark:bg-indigo-900/20 dark:text-indigo-400"
            />
            <StatItem
              icon={ShoppingCart}
              label="Purchase"
              value={salesStats.purchase}
              colorClass="bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
            />
            <StatItem
              icon={CreditCard}
              label="Expenses"
              value={salesStats.expenses}
              colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
            />
            <StatItem
              icon={ArrowUpRight}
              label="Credits"
              value={salesStats.credits}
              colorClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400"
            />
          </div>
        </GlassCard>

        {/* Invoice Statistics */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Invoice Statistics"
            action={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <StatItem
              icon={FileText}
              label="Invoiced"
              value={invoiceStats.invoiced}
              colorClass="bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/20 dark:text-fuchsia-400"
            />
            <StatItem
              icon={CheckCircle}
              label="Received"
              value={invoiceStats.received}
              colorClass="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
            />
            <StatItem
              icon={Clock}
              label="Outstanding"
              value={invoiceStats.outstanding}
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            />
            <StatItem
              icon={AlertCircle}
              label="Overdue"
              value={invoiceStats.overdue}
              colorClass="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
            />
          </div>
        </GlassCard>
      </div>

      {/* 3. Middle Section: Small Cards + Chart + Customers */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-8">
        {/* Left Column: Summary Cards */}
        <div className="space-y-8">
          <SmallSummaryCard
            title="Total Products"
            value="897"
            change="+45"
            icon={Package}
            link="/products"
          />
          {/* <SmallSummaryCard
            title="Total Sales"
            value="645"
            change="+45"
            icon={ShoppingCart}
            link="/sales"
          /> */}
          {/* <SmallSummaryCard
            title="Total Quotations"
            value="128"
            change="+45"
            icon={FileText}
            link="/quotations"
          /> */}
        </div>
        {/*  */}
        {/* Center: Revenue Chart */}
        <GlassCard className="xl:col-span-2 p-5 sm:p-8 flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Revenue
              </h3>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  $98,545
                </span>
                <span className="flex items-center text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" /> +45%
                </span>
              </div>
              <p className="text-sm text-gray-400 font-medium mt-1">
                vs. previous 30 days
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Custom Legend */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200"></span>
                <span className="text-sm font-medium text-gray-500">
                  Received
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-600 shadow-sm shadow-violet-500/30"></span>
                <span className="text-sm font-medium text-gray-500">
                  Outstanding
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <Chart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="bar"
              height="100%"
            />
          </div>
        </GlassCard>

        {/* Right: Customers */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Top Customers"
            action={
              <Link
                to="/customers"
                className="text-sm font-bold text-violet-600 hover:text-violet-700 transition-colors"
              >
                View All
              </Link>
            }
          />
          <div className="space-y-8">
            {customersList.map((customer, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors duration-300">
                  {customer.avatar || customer.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-700 transition-colors">
                    {customer.name}
                  </p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    {customer.invoices || 0} Invoices
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {customer.balance || customer.totalSpent}
                  </p>
                  <p className="text-xs font-medium text-gray-400 mt-0.5">
                    Due
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* 4. Invoices Table */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 lg:p-8 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Invoices
          </h3>
          <button className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-violet-500/20 transition-all transform hover:-translate-y-0.5 w-full sm:w-auto">
            View all Invoices
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  ID
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700 group">
                  <div className="flex items-center gap-1">
                    Customer <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700">
                  <div className="flex items-center gap-1">
                    Created On <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700">
                  <div className="flex items-center gap-1">
                    Amount <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700">
                  <div className="flex items-center gap-1">
                    Paid <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Payment Mode
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-gray-700">
                  <div className="flex items-center gap-1">
                    Due Date <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => <TableRowSkeleton key={i} />)
                : invoices.map((inv, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {inv.id || inv.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                              inv.customer,
                            )}&background=random&color=fff`}
                            alt={inv.customer}
                            className="w-8 h-8 rounded-full object-cover shadow-sm"
                          />
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {inv.customer}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {inv.date}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        {inv.amount || inv.total}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {inv.paid || "$0.00"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {inv.mode || "Check"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {inv.due || "-"}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* 5. Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
        {/* Recent Transactions */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Recent Transactions"
            action={
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide">
                View All
              </button>
            }
          />
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pl-1">
                Today
              </p>
              <div className="space-y-6">
                {transactions
                  .filter((t) => t.date === "Today")
                  .map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${t.type === "credit" ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100" : "bg-rose-50 text-rose-600 group-hover:bg-rose-100"}`}
                        >
                          {t.type === "credit" ? (
                            <ArrowDownRight className="w-5 h-5" />
                          ) : (
                            <ArrowUpRight className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {t.name}
                          </p>
                          <p className="text-xs font-medium text-gray-500">
                            {t.id}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}
                      >
                        {t.amount}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quotations */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Recent Quotations"
            action={
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide">
                View All
              </button>
            }
          />
          <div className="space-y-4">
            {quotationsList.map((q, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {q.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {q.id}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-lg mb-1 ${q.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : q.status === "Sent" ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}
                  >
                    {q.status}
                  </span>
                  <p className="text-xs font-medium text-gray-400">{q.date}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Top Selling Product (Donut) */}
        <GlassCard className="p-5 sm:p-8">
          <SectionHeader
            title="Top Selling"
            action={
              <button className="text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-wide">
                View Report
              </button>
            }
          />
          <div className="min-h-[280px] flex items-center justify-center">
            <Chart
              options={salesDonutOptions}
              series={salesDonutSeries}
              type="donut"
              height={280}
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default DashboardPage;
