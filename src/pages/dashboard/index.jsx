import React from "react";
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
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 
        SECTION 1: HEADER
        Welcome message and date picker/actions 
      */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("dashboard.welcomeBack", { name: userName })}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("dashboard.storeOverview")}
          </p>
        </div>
        
        {/* Date Filter / Action Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span>{t("dashboard.last7Days")}</span>
          </div>
          <button className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
             {t("common.downloadReport")}
          </button>
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
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("dashboard.incomeGrowth")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Revenue over time</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
          </div>
        </div>

        {/* Payment/Order Breakdown Radial Chart */}
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800/50 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t("dashboard.paymentsBreakdown")}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Order payment status distribution</p>
          
          <div className="flex-1 flex items-center justify-center">
            <RadialChartComponent
              chartData={radialChartData}
              chartConfig={radialChartConfig}
              total={`${paidPercentage}%`}
              name={t("dashboard.paidOrders")}
              className="w-full max-w-[250px]"
            />
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xs text-gray-500 uppercase">Paid</span>
              <p className="font-semibold text-lg">{radialChartData[0]?.paid || 0}%</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <span className="text-xs text-gray-500 uppercase">Unpaid</span>
              <p className="font-semibold text-lg">{radialChartData[0]?.unpaid || 0}%</p>
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
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800/50 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t("dashboard.recentOrders")}</h3>
            <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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

        {/* Side Lists (Takes 1/3 width) */}
        <div className="flex flex-col gap-6">
          
          {/* Best Selling Products */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("dashboard.mostSellingProducts")}</h3>
            <ul className="space-y-4">
              {bestSellers.slice(0, 5).map((p, idx) => (
                <li key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{p.name}</p>
                      <p className="text-xs text-gray-500">ID: {p.id}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    {p.sales}
                  </span>
                </li>
              ))}
              {bestSellers.length === 0 && (
                 <li className="text-sm text-gray-500 text-center py-4">No data available</li>
              )}
            </ul>
          </div>

          {/* Top Customers */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800/50 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("dashboard.weeklyTopCustomers")}</h3>
            <ul className="space-y-4">
              {topCustomers.slice(0, 5).map((c, idx) => (
                <li key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{c.name}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{c.orders} Orders</span>
                    <span className="text-[10px] text-gray-400">Total</span>
                  </div>
                </li>
              ))}
               {topCustomers.length === 0 && (
                 <li className="text-sm text-gray-500 text-center py-4">No data available</li>
              )}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
