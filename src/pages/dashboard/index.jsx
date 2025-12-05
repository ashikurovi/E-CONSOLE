import React from "react";
import { useSelector } from "react-redux";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
import ReusableTable from "@/components/table/reusable-table";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";

const DashboardPage = () => {
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery();
  const authUser = useSelector((state) => state.auth.user);
  const userName = authUser?.name || "User";

  // Default values while loading or on error
  const stats = dashboardData?.stats || [
    { title: "Ecommerce Revenue", value: "$0.00", delta: "+0.0%", icon: DollarSign, tone: "green" },
    { title: "New Customers", value: "0", delta: "+0.0%", icon: Users, tone: "red" },
    { title: "Repeat Purchase Rate", value: "0.00%", delta: "+0.0%", icon: ShoppingCart, tone: "blue" },
    { title: "Average Order Value", value: "$0.00", delta: "+0.0%", icon: Package, tone: "default" },
  ];

  // Map stats to include icons
  const statsWithIcons = stats.map((stat, index) => {
    const icons = [DollarSign, Users, ShoppingCart, Package];
    return {
      ...stat,
      icon: icons[index] || DollarSign,
    };
  });

  const lineChartConfig = {
    desktop: { label: "Income Growth", color: "hsl(var(--chart-3))" },
  };
  const lineChartData = dashboardData?.lineChartData || [];

  const radialChartConfig = {
    paid: { label: "Paid", color: "hsl(var(--chart-2))" },
    unpaid: { label: "Unpaid", color: "hsl(var(--chart-5))" },
  };
  const radialChartData = dashboardData?.radialChartData || [{ paid: 0, unpaid: 0 }];

  const tableHeaders = [
    { header: "Product", field: "product" },
    { header: "Customer", field: "customer" },
    { header: "Order ID", field: "id" },
    { header: "Date", field: "date" },
    { header: "Status", field: "status" },
  ];
  const recentOrders = dashboardData?.recentOrders || [];

  const bestSellers = dashboardData?.bestSellers || [];

  const topCustomers = dashboardData?.topCustomers || [];

  // Calculate paid percentage for radial chart
  const paidPercentage = radialChartData[0]?.paid || 0;

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
          <p className="text-xl font-semibold text-red-500">Error loading dashboard data</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
        <p className="text-xl font-semibold">Welcome Back, {userName}!</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          Here's what's happening with your store today
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statsWithIcons.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} delta={s.delta} icon={s.icon} tone={s.tone} />
        ))}
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4 flex items-center justify-between">
          <span className="text-sm text-black/60 dark:text-white/60">Period</span>
          <button className="px-3 py-1 rounded-lg bg-black text-white text-sm">
            View All Time
          </button>
        </div>
      </div>

      {/* Summary and Right Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Summary (chart) */}
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Summary</h3>
            <div className="text-sm text-black/60 dark:text-white/60">Last 7 days</div>
          </div>
          <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
        </div>

        {/* Right panels */}
        <div className="flex flex-col gap-6">
          {/* Most Selling Products */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
            <h3 className="text-lg font-medium mb-3">Most Selling Products</h3>
            <ul className="space-y-3">
              {bestSellers.map((p, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-black/50 dark:text-white/60">ID: {p.id}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">{p.sales}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weekly Top Customers */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
            <h3 className="text-lg font-medium mb-3">Weekly Top Customers</h3>
            <ul className="space-y-3">
              {topCustomers.map((c, idx) => (
                <li key={idx} className="flex items-center justify-between">
                  <p className="font-medium">{c.name}</p>
                  <button className="text-xs px-2 py-1 rounded-lg bg-black text-white">
                    {c.orders}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Recent Orders</h3>
          <button className="text-sm px-3 py-1 rounded-lg bg-black text-white">View All</button>
        </div>
        <ReusableTable data={recentOrders} headers={tableHeaders} total={recentOrders.length} isLoading={isLoading} py="py-2" />
      </div>

      {/* Payments breakdown */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <h3 className="text-lg font-medium mb-3">Payments Breakdown</h3>
        <RadialChartComponent
          chartData={radialChartData}
          chartConfig={radialChartConfig}
          total={`${paidPercentage}%`}
          name="Paid Orders"
          className="max-w-[340px]"
        />
      </div>
    </div>
  );
};

export default DashboardPage;