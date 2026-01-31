import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";

import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
import ReusableTable from "@/components/table/reusable-table";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery({ companyId: authUser?.companyId });
  const userName = authUser?.name || t("dashboard.user");

  // Default values while loading or on error
  const stats = dashboardData?.stats || [
    { title: t("dashboard.ecommerceRevenue"), value: "$0.00", delta: "+0.0%", icon: DollarSign, tone: "green" },
    { title: t("dashboard.newCustomers"), value: "0", delta: "+0.0%", icon: Users, tone: "red" },
    { title: t("dashboard.repeatPurchaseRate"), value: "0.00%", delta: "+0.0%", icon: ShoppingCart, tone: "blue" },
    { title: t("dashboard.averageOrderValue"), value: "$0.00", delta: "+0.0%", icon: Package, tone: "default" },
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
    desktop: { label: t("dashboard.incomeGrowth"), color: "hsl(var(--chart-3))" },
  };
  const lineChartData = dashboardData?.lineChartData || [];

  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "hsl(var(--chart-2))" },
    unpaid: { label: t("dashboard.unpaid"), color: "hsl(var(--chart-5))" },
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

  // Calculate paid percentage for radial chart
  const paidPercentage = radialChartData[0]?.paid || 0;

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5">
          <p className="text-xl font-semibold text-red-500">{t("dashboard.errorLoading")}</p>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("dashboard.tryRefresh")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white mb-1">
                  {t("dashboard.welcomeBack", { name: userName })} 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                  {t("dashboard.storeOverview")}
              </p>
          </div>
          <div className="flex gap-2">
               <button className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium shadow-lg hover:opacity-90 transition-opacity">
                  Download Report
               </button>
          </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Left Column (Stats + Main Chart) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
               {/* Stats Row */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {statsWithIcons.map((s, i) => (
                      <div key={i} className="bg-white dark:bg-[#111] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
                           {/* Decorative background circle */}
                           <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity bg-${s.tone === 'default' ? 'gray' : s.tone}-500`}></div>
                           
                           <div className="flex justify-between items-start mb-4 relative z-10">
                               <div className={`p-3 rounded-2xl bg-${s.tone === 'default' ? 'gray' : s.tone}-100 dark:bg-white/5 text-${s.tone === 'default' ? 'gray' : s.tone}-600 dark:text-white`}>
                                   <s.icon size={20} />
                               </div>
                               <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${s.delta.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                   {s.delta}
                               </span>
                           </div>
                           <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1 relative z-10">{s.title}</h3>
                           <p className="text-2xl font-bold text-black dark:text-white relative z-10">{s.value}</p>
                      </div>
                   ))}
               </div>

               {/* Projects/Income Progress Chart */}
               <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-black dark:text-white">Income Analysis</h3>
                       <select className="bg-gray-100 dark:bg-black/50 border-none text-sm rounded-lg px-3 py-1 text-gray-600 dark:text-gray-300">
                           <option>This Week</option>
                           <option>This Month</option>
                           <option>This Year</option>
                       </select>
                   </div>
                   <div className="h-[300px] w-full">
                       <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
                   </div>
               </div>
               
               {/* Transactions Table */}
               <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-lg font-bold text-black dark:text-white">Recent Transactions</h3>
                       <button className="text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors">View All</button>
                   </div>
                   <ReusableTable data={recentOrders} headers={tableHeaders} total={recentOrders.length} isLoading={isLoading} py="py-3" />
               </div>
          </div>

          {/* Right Column (Breakdown + Top Lists) */}
          <div className="space-y-6">
               {/* Expense/Payment Breakdown */}
               <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-6 w-full text-left">Payment Status</h3>
                    <div className="relative mb-6">
                         <RadialChartComponent
                            chartData={radialChartData}
                            chartConfig={radialChartConfig}
                            total={`${paidPercentage}%`}
                            name={t("dashboard.paidOrders")}
                            className="w-full"
                          />
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Paid</p>
                            <p className="font-bold text-xl">{paidPercentage}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">Pending</p>
                            <p className="font-bold text-xl">{100 - paidPercentage}%</p>
                        </div>
                    </div>
               </div>

               {/* Top Selling */}
               <div className="bg-[#1a1a1a] dark:bg-[#111] p-6 rounded-3xl shadow-sm text-white">
                    <h3 className="text-lg font-bold mb-4">Top Selling</h3>
                    <div className="space-y-4">
                        {bestSellers.slice(0, 4).map((p, idx) => (
                             <div key={idx} className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl">
                                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">
                                      {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{p.name}</p>
                                      <p className="text-xs text-white/50">{p.sales} sales</p>
                                  </div>
                                  <div className="text-sm font-bold">${p.revenue || 'N/A'}</div>
                             </div>
                        ))}
                    </div>
               </div>

               {/* Activity / Top Customers */}
                <div className="bg-white dark:bg-[#111] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-4">Top Customers</h3>
                    <div className="space-y-4">
                        {topCustomers.slice(0, 5).map((c, idx) => (
                             <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                                          {c.name.substring(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                          <p className="font-medium text-sm text-black dark:text-white">{c.name}</p>
                                          <p className="text-xs text-gray-500">{c.orders} orders</p>
                                      </div>
                                  </div>
                                  <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-lg">Top</span>
                             </div>
                        ))}
                    </div>
               </div>

          </div>
      </div>
    </div>
  );
};

export default DashboardPage;