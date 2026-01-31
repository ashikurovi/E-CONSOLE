import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  TrendingUp,
  Download,
} from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
import ReusableTable from "@/components/table/reusable-table";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";

/**
 * DashboardPage Component
 *
 * This is the main landing page for the admin console.
 * It displays key performance indicators (KPIs), charts, and recent activity.
 *
 * Structure:
 * 1. Header (Welcome & Date)
 * 2. Stats Grid (KPI Cards)
 * 3. Charts Section (Revenue & Breakdown)
 * 4. Data Tables (Recent Orders & Top Products/Customers)
 */
const DashboardPage = () => {
  // Localization hook
  const { t } = useTranslation();

  // Get current authenticated user from Redux store
  const authUser = useSelector((state) => state.auth.user);

  // Fetch dashboard data from API
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetDashboardQuery({ companyId: authUser?.companyId });

  // User name for welcome message
  const userName = authUser?.name || t("dashboard.user");

  // ==========================================
  // DATA PREPARATION
  // ==========================================

  // Default values while loading or on error
  // These stats will be displayed in the top grid
  const stats = dashboardData?.stats || [
    {
      title: t("dashboard.ecommerceRevenue"),
      value: "$0.00",
      delta: "+0.0%",
      icon: DollarSign,
      tone: "green",
    },
    {
      title: t("dashboard.newCustomers"),
      value: "0",
      delta: "+0.0%",
      icon: Users,
      tone: "blue",
    },
    {
      title: t("dashboard.repeatPurchaseRate"),
      value: "0.00%",
      delta: "+0.0%",
      icon: ShoppingCart,
      tone: "red",
    },
    {
      title: t("dashboard.averageOrderValue"),
      value: "$0.00",
      delta: "+0.0%",
      icon: Package,
      tone: "default",
    },
  ];

  // Map stats to include icons dynamically
  // We re-map to ensure the correct icon component is passed
  const statsWithIcons = stats.map((stat, index) => {
    const icons = [DollarSign, Users, ShoppingCart, Package];
    return {
      ...stat,
      icon: icons[index] || DollarSign,
    };
  });

  // Line Chart Configuration (Revenue/Income)
  const lineChartConfig = {
    desktop: {
      label: t("dashboard.incomeGrowth"),
      color: "hsl(var(--chart-1))",
    }, // Used primary chart color
  };
  const lineChartData = dashboardData?.lineChartData || [];

  // Radial Chart Configuration (Order Status/Payments)
  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "#0FAD96" },
    unpaid: { label: t("dashboard.unpaid"), color: "#F2994A" },
  };
  const radialChartData = dashboardData?.radialChartData || [
    { paid: 0, unpaid: 0 },
  ];

  // Table Headers for Recent Orders
  const tableHeaders = [
    { header: t("nav.product"), field: "product" },
    { header: t("nav.customers"), field: "customer" },
    { header: "Order ID", field: "id" },
    { header: "Date", field: "date" },
    { header: "Status", field: "status" },
  ];
  const recentOrders = dashboardData?.recentOrders || [];

  // Lists for side panels
  const bestSellers = dashboardData?.bestSellers || [];
  const topCustomers = dashboardData?.topCustomers || [];

  // Calculate paid percentage for radial chart visualization
  const paidPercentage = radialChartData[0]?.paid || 0;

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-8 text-center">
          <p className="text-xl font-semibold text-red-500 mb-2">
            {t("dashboard.errorLoading")}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("dashboard.tryRefresh")}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="space-y-8 animate-in fade-in duration-500 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-[#0b0f14] dark:via-[#11161d] dark:to-[#0b0f14] p-6 lg:p-8 rounded-3xl">
      {/* 
        SECTION 1: HEADER
        Welcome message and date picker/actions 
      */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-3xl shadow-2xl dark:shadow-black/50 mb-8 border border-white/10">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
        </div>

        <div className="relative px-8 py-10 lg:px-12 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Welcome Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                    {t("dashboard.welcomeBack", { name: userName })}
                  </h1>
                  <p className="text-white/70 text-sm lg:text-base font-medium mt-1">
                    {t("dashboard.storeOverview")}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20 hover:border-white/30 font-medium shadow-lg hover:shadow-xl cursor-pointer">
                <Calendar className="w-4 h-4" />
                <span>{t("dashboard.last7Days")}</span>
              </div>

              <button className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 border border-transparent">
                <Download className="w-4 h-4" />
                <span>{t("common.downloadReport")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 
        SECTION 2: KPI STATS
        Grid of status cards showing high-level metrics
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsWithIcons.map((s, i) => (
          <StatCard
            key={i}
            title={s.title}
            value={s.value}
            delta={s.delta}
            icon={s.icon}
            tone={s.tone}
          />
        ))}
      </div>

      {/* 
        SECTION 3: CHARTS & ANALYTICS
        Main chart taking 2/3 width, side panel taking 1/3
      */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="xl:col-span-2 relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 overflow-hidden group hover:shadow-xl transition-all duration-500">
          {/* Gradient background orbs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-blue-400 to-indigo-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none opacity-60" />

          <div className="relative">
            <div className="px-8 py-6 border-b border-white/30 dark:border-white/10 backdrop-blur-sm bg-gradient-to-r from-slate-50/50 to-white/30 dark:from-white/5 dark:to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {t("dashboard.incomeGrowth")}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                      Revenue trend analysis
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 h-[400px]">
              <LineChartComponent
                chartData={lineChartData}
                chartConfig={lineChartConfig}
              />
            </div>
          </div>
        </div>

        {/* Payment/Order Breakdown Radial Chart */}
        <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 overflow-hidden group hover:shadow-xl transition-all duration-500 flex flex-col">
          {/* Gradient orbs */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-gradient-to-tr from-indigo-400 to-purple-600 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none opacity-60" />

          <div className="relative flex-1 flex flex-col">
            <div className="px-6 py-6 border-b border-white/30 dark:border-white/10 backdrop-blur-sm bg-gradient-to-r from-slate-50/50 to-white/30 dark:from-white/5 dark:to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    {t("dashboard.paymentsBreakdown")}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                    Order payment status
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <RadialChartComponent
                chartData={radialChartData}
                chartConfig={radialChartConfig}
                total={`${paidPercentage}%`}
                name={t("dashboard.paidOrders")}
                className="w-full max-w-[250px] -mt-8"
              />

              <div className="w-full grid grid-cols-2 gap-4 -mt-4">
                {/* Paid Card - Premium Glass/Pastel Effect */}
                <div className="relative rounded-2xl border border-[#0FAD96]/20 bg-[#E8FAF6]/80 dark:bg-[#0FAD96]/10 backdrop-blur-md overflow-hidden group/paid hover:bg-[#E8FAF6] dark:hover:bg-[#0FAD96]/20 transition-all duration-300 shadow-lg shadow-[#0FAD96]/5 p-4 text-center">
                  <span className="text-xs font-bold text-[#0FAD96] dark:text-[#2dd4bf] uppercase tracking-wider">
                    Paid
                  </span>
                  <p className="font-bold text-2xl text-[#0FAD96] dark:text-[#2dd4bf] mt-1">
                    {radialChartData[0]?.paid || 0}%
                  </p>
                </div>

                {/* Unpaid Card - Premium Glass/Pastel Effect */}
                <div className="relative rounded-2xl border border-[#F25F33]/20 bg-[#FFF0F0]/80 dark:bg-[#F25F33]/10 backdrop-blur-md overflow-hidden group/unpaid hover:bg-[#FFF0F0] dark:hover:bg-[#F25F33]/20 transition-all duration-300 shadow-lg shadow-[#F25F33]/5 p-4 text-center">
                  <span className="text-xs font-bold text-[#F25F33] dark:text-[#F25F33] uppercase tracking-wider">
                    Unpaid
                  </span>
                  <p className="font-bold text-2xl text-[#F25F33] dark:text-[#F25F33] mt-1">
                    {radialChartData[0]?.unpaid || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        SECTION 4: DETAILED LISTS
        Recent Orders Table and Top Products/Customers
      */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table (Takes 2/3 width) */}
        <div className="xl:col-span-2 relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 overflow-hidden group hover:shadow-xl transition-all duration-500">
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none opacity-60" />

          <div className="relative p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("dashboard.recentOrders")}
                </h3>
              </div>
              <button className="text-xs font-bold px-4 py-2 rounded-xl bg-white/50 dark:bg-white/10 border border-white/60 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 transition-all shadow-sm">
                {t("common.viewAll")}
              </button>
            </div>
            <ReusableTable
              data={recentOrders}
              headers={tableHeaders}
              total={recentOrders.length}
              isLoading={isLoading}
              py="py-3"
            />
          </div>
        </div>

        {/* Side Lists (Takes 1/3 width) */}
        <div className="flex flex-col gap-6">
          {/* Best Selling Products */}
          <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 overflow-hidden group hover:shadow-xl transition-all duration-500 p-6">
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none opacity-60" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("dashboard.mostSellingProducts")}
                </h3>
              </div>
              <ul className="space-y-4">
                {bestSellers.slice(0, 5).map((p, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between group/item p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all border border-transparent hover:border-white/40 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 shadow-inner">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">ID: {p.id}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50">
                      {p.sales}
                    </span>
                  </li>
                ))}
                {bestSellers.length === 0 && (
                  <li className="text-sm text-gray-500 text-center py-4">
                    No data available
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Top Customers */}
          <div className="relative backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-lg border border-white/50 dark:border-white/20 overflow-hidden group hover:shadow-xl transition-all duration-500 p-6">
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/10 dark:to-transparent pointer-events-none opacity-60" />

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("dashboard.weeklyTopCustomers")}
                </h3>
              </div>
              <ul className="space-y-4">
                {topCustomers.slice(0, 5).map((c, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between group/item p-3 rounded-xl hover:bg-white/40 dark:hover:bg-white/5 transition-all border border-transparent hover:border-white/40 dark:hover:border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white group-hover/item:text-cyan-600 dark:group-hover/item:text-cyan-400 transition-colors">
                        {c.name}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {c.orders} Orders
                      </span>
                      <span className="text-[10px] text-gray-400">Total</span>
                    </div>
                  </li>
                ))}
                {topCustomers.length === 0 && (
                  <li className="text-sm text-gray-500 text-center py-4">
                    No data available
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
