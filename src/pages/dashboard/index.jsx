import React from "react";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
import ReusableTable from "@/components/table/reusable-table";

const DashboardPage = () => {
  const stats = [
    { title: "Ecommerce Revenue", value: "$245,450", delta: "+14.9%", icon: DollarSign, tone: "green" },
    { title: "New Customers", value: "684", delta: "-8.6%", icon: Users, tone: "red" },
    { title: "Repeat Purchase Rate", value: "75.12 %", delta: "+25.4%", icon: ShoppingCart, tone: "blue" },
    { title: "Average Order Value", value: "$2,412.23", delta: "+3.5%", icon: Package, tone: "default" },
  ];

  const lineChartConfig = {
    desktop: { label: "Income Growth", color: "hsl(var(--chart-3))" },
  };
  const lineChartData = [
    { month: "2025-09-01", totalPNL: 4300 },
    { month: "2025-09-05", totalPNL: 5200 },
    { month: "2025-09-09", totalPNL: 4800 },
    { month: "2025-09-12", totalPNL: 6100 },
    { month: "2025-09-13", totalPNL: 5700 },
    { month: "2025-09-15", totalPNL: 6600 },
  ];

  const radialChartConfig = {
    paid: { label: "Paid", color: "hsl(var(--chart-2))" },
    unpaid: { label: "Unpaid", color: "hsl(var(--chart-5))" },
  };
  const radialChartData = [{ paid: 65, unpaid: 35 }];

  const tableHeaders = [
    { header: "Product", field: "product" },
    { header: "Customer", field: "customer" },
    { header: "Order ID", field: "id" },
    { header: "Date", field: "date" },
    { header: "Status", field: "status" },
  ];
  const recentOrders = [
    { product: "Water Bottle", customer: "Peterson Jack", id: "#841573", date: "27 Jun 2025", status: "Pending" },
    { product: "Iphone 15 Pro", customer: "Michel Datta", id: "#245784", date: "26 Jun 2025", status: "Canceled" },
    { product: "Headphone", customer: "Jesiya Rose", id: "#1024784", date: "20 Jun 2025", status: "Shipped" },
  ];

  const bestSellers = [
    { name: "Snicker Vento", sales: "128 Sales", id: "2443130" },
    { name: "Blue Backpack", sales: "401 Sales", id: "1243138" },
    { name: "Water Bottle", sales: "1k+ Sales", id: "8441573" },
  ];

  const topCustomers = [
    { name: "Marks Hoverson", orders: "25 Orders" },
    { name: "Marks Hoverson", orders: "15 Orders" },
    { name: "Jhony Peters", orders: "23 Orders" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
        <p className="text-xl font-semibold">Welcome Back, Mahfuzul!</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          Here’s what’s happening with your store today
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} delta={s.delta} icon={s.icon} tone={s.tone} />
        ))}
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4 flex items-center justify-between">
          <span className="text-sm text-black/60 dark:text-white/60">Period</span>
          <button className="px-3 py-1 rounded-lg bg-black text-white text-sm dark:bg-white dark:text-black">
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
                  <button className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/10">
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
          <button className="text-sm px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/10">View All</button>
        </div>
        <ReusableTable data={recentOrders} headers={tableHeaders} total={recentOrders.length} isLoading={false} py="py-2" />
      </div>

      {/* Payments breakdown */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <h3 className="text-lg font-medium mb-3">Payments Breakdown</h3>
        <RadialChartComponent
          chartData={radialChartData}
          chartConfig={radialChartConfig}
          total={"65%"}
          name="Paid Orders"
          className="max-w-[340px]"
        />
      </div>
    </div>
  );
};

export default DashboardPage;