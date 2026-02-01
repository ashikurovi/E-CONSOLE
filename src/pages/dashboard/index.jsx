import React from "react";
import { Link } from "react-router-dom";
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

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useGetDashboardQuery({ companyId: authUser?.companyId });

  const userName = authUser?.name || t("dashboard.user");

  // Default fallback stats
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

  const lineChartConfig = {
    desktop: {
      label: t("dashboard.incomeGrowth"),
      color: "hsl(var(--chart-1))",
    },
  };
  const lineChartData = dashboardData?.lineChartData || [];

  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "#0FAD96" },
    unpaid: { label: t("dashboard.unpaid"), color: "#F2994A" },
  };
  const radialChartData = dashboardData?.radialChartData || [{ paid: 0, unpaid: 0 }];

  const tableHeaders = [
    { header: t("nav.product"), field: "product" },
    { header: t("nav.customers"), field: "customer" },
    { header: "Order ID", field: "id" },
    { header: "Date", field: "date" },
    { header: "Status", field: "status" },
  ];
  const recentOrders = dashboardData?.recentOrders || [];
  const bestSellers = dashboardData?.bestSellers || [];
  const topCustomers = dashboardData?.topCustomers || [];

  const paidPercentage = radialChartData[0]?.paid || 0;

  if (isError) {
    return (
      <div className="space-y-6 p-6">
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

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-[#0b0f14] dark:via-[#11161d] dark:to-[#0b0f14] p-6 lg:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        <div className="relative px-8 py-10 lg:px-12 lg:py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
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

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all border border-white/20 hover:border-white/30 font-medium">
                <Calendar className="w-4 h-4" />
                <span>{t("dashboard.last7Days")}</span>
              </div>

              <button className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-50 transition-all">
                <Download className="w-4 h-4" />
                <span>{t("common.downloadReport")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((s, i) => (
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("dashboard.revenue_analytics")}
          </h3>
          <div className="h-[350px] w-full">
            <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
          </div>
        </div>

        {/* Payment / Order Status Chart */}
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("dashboard.paymentsBreakdown")}
          </h3>
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center gap-6">
            <RadialChartComponent
              chartData={radialChartData}
              chartConfig={radialChartConfig}
              total={`${paidPercentage}%`}
              name={t("dashboard.paidOrders")}
              className="w-full max-w-[260px]"
            />

            <div className="w-full grid grid-cols-2 gap-4 px-4">
              <div className="bg-[#E8FAF6]/80 dark:bg-[#0FAD96]/10 border border-[#0FAD96]/20 rounded-xl p-4 text-center">
                <div className="text-xs font-bold text-[#0FAD96] dark:text-[#2dd4bf] uppercase tracking-wide">
                  Paid
                </div>
                <div className="text-2xl font-bold text-[#0FAD96] dark:text-[#2dd4bf] mt-1">
                  {radialChartData[0]?.paid || 0}%
                </div>
              </div>

              <div className="bg-[#FFF0F0]/80 dark:bg-[#F25F33]/10 border border-[#F25F33]/20 rounded-xl p-4 text-center">
                <div className="text-xs font-bold text-[#F25F33] uppercase tracking-wide">
                  Unpaid
                </div>
                <div className="text-2xl font-bold text-[#F25F33] mt-1">
                  {radialChartData[0]?.unpaid || 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Side Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("dashboard.recentOrders")}
            </h3>
            <Link
              to="/orders"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t("common.viewAll")}
            </Link>
          </div>
          <div className="overflow-x-auto">
            <ReusableTable
              data={recentOrders}
              headers={tableHeaders}
              total={recentOrders.length}
              isLoading={isLoading}
              py="py-3"
            />
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-6">
          {/* Best Selling Products */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.bestSellingProducts")}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {bestSellers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("common.noData")}
                </div>
              ) : (
                bestSellers.slice(0, 5).map((product, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.sales} {t("common.sales")}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${product.revenue?.toLocaleString() || "0"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.topCustomers")}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {topCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("common.noData")}
                </div>
              ) : (
                topCustomers.slice(0, 5).map((customer, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                      {customer.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {customer.orders} {t("common.orders")}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${customer.totalSpent?.toLocaleString() || "0"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;