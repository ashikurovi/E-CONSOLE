import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingCart, Users, Package, Calendar } from "lucide-react";
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
  const { data: dashboardData, isLoading, isError } = useGetDashboardQuery({ companyId: authUser?.companyId });
  
  // User name for welcome message
  const userName = authUser?.name || t("dashboard.user");

  // ==========================================
  // DATA PREPARATION
  // ==========================================

  // Default values while loading or on error
  // These stats will be displayed in the top grid
  const stats = dashboardData?.stats || [
    { title: t("dashboard.ecommerceRevenue"), value: "$0.00", delta: "+0.0%", icon: DollarSign, tone: "green" },
    { title: t("dashboard.newCustomers"), value: "0", delta: "+0.0%", icon: Users, tone: "blue" },
    { title: t("dashboard.repeatPurchaseRate"), value: "0.00%", delta: "+0.0%", icon: ShoppingCart, tone: "red" },
    { title: t("dashboard.averageOrderValue"), value: "$0.00", delta: "+0.0%", icon: Package, tone: "default" },
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
    desktop: { label: t("dashboard.incomeGrowth"), color: "hsl(var(--chart-1))" }, // Used primary chart color
  };
  const lineChartData = dashboardData?.lineChartData || [];

  // Radial Chart Configuration (Order Status/Payments)
  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "hsl(var(--chart-2))" },
    unpaid: { label: t("dashboard.unpaid"), color: "hsl(var(--chart-5))" },
  };
  const radialChartData = dashboardData?.radialChartData || [{ paid: 0, unpaid: 0 }];

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
          <p className="text-xl font-semibold text-red-500 mb-2">{t("dashboard.errorLoading")}</p>
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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("dashboard.welcome", { name: userName })}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {t("dashboard.overview_subtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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

        {/* Order Status Chart */}
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {t("dashboard.order_status")}
          </h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <RadialChartComponent chartData={radialChartData} chartConfig={radialChartConfig} total={`${paidPercentage}%`} name={t("dashboard.paidOrders")} />
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="xl:col-span-2 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("dashboard.recent_orders")}
            </h3>
            <Link 
              to="/orders" 
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t("common.view_all")}
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

        {/* Side Lists (Best Sellers & Top Customers) */}
        <div className="space-y-6">
          {/* Best Selling Products */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.best_selling_products")}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {bestSellers.map((product, idx) => (
                <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
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
              ))}
              {bestSellers.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("common.no_data")}
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl shadow-sm overflow-hidden text-sm">
            <div className="p-4 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t("dashboard.top_customers")}
              </h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
               {topCustomers.map((customer, idx) => (
                <div key={idx} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {customer.name.charAt(0)}
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
              ))}
               {topCustomers.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  {t("common.no_data")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
