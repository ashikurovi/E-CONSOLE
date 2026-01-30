import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import StatCard from "@/components/cards/stat-card";
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
      {/* Welcome */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-black/10 p-5">
        <p className="text-xl font-semibold">{t("dashboard.welcomeBack", { name: userName })}</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("dashboard.storeOverview")}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statsWithIcons.map((s, i) => (
          <StatCard key={i} title={s.title} value={s.value} delta={s.delta} icon={s.icon} tone={s.tone} />
        ))}
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4 flex items-center justify-between">
          <span className="text-sm text-black/60 dark:text-white/60">{t("common.period")}</span>
          <button className="px-3 py-1 rounded-lg bg-black text-white text-sm">
            {t("common.viewAllTime")}
          </button>
        </div>
      </div>

      {/* Summary and Right Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Summary (chart) */}
        <div className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">{t("dashboard.summary")}</h3>
            <div className="text-sm text-black/60 dark:text-white/60">{t("dashboard.last7Days")}</div>
          </div>
          <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
        </div>

        {/* Right panels */}
        <div className="flex flex-col gap-6">
          {/* Most Selling Products */}
          <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
            <h3 className="text-lg font-medium mb-3">{t("dashboard.mostSellingProducts")}</h3>
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
            <h3 className="text-lg font-medium mb-3">{t("dashboard.weeklyTopCustomers")}</h3>
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
          <h3 className="text-lg font-medium">{t("dashboard.recentOrders")}</h3>
          <button className="text-sm px-3 py-1 rounded-lg bg-black text-white">{t("common.viewAll")}</button>
        </div>
        <ReusableTable data={recentOrders} headers={tableHeaders} total={recentOrders.length} isLoading={isLoading} py="py-2" />
      </div>

      {/* Payments breakdown */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <h3 className="text-lg font-medium mb-3">{t("dashboard.paymentsBreakdown")}</h3>
        <RadialChartComponent
          chartData={radialChartData}
          chartConfig={radialChartConfig}
          total={`${paidPercentage}%`}
          name={t("dashboard.paidOrders")}
          className="max-w-[340px]"
        />
      </div>
    </div>
  );
};

export default DashboardPage;