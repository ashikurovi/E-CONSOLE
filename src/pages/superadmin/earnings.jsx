import React, { useMemo } from "react";
import { DollarSign, TrendingUp, CreditCard, Globe2 } from "lucide-react";
import LineChartComponent from "@/components/charts/line-chart";
import { useGetEarningsOverviewQuery } from "@/features/earnings/earningsApiSlice";

const SuperAdminEarningsPage = () => {
  const { data: earningsData, isLoading } = useGetEarningsOverviewQuery();

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const kpis = useMemo(() => {
    if (!earningsData?.kpis) {
      return [
        {
          title: "Total Earnings (YTD)",
          value: "$0",
          delta: "+0%",
          icon: DollarSign,
          tone: "emerald",
          description: "Revenue across all connected stores",
        },
        {
          title: "Avg. Daily Revenue",
          value: "$0",
          delta: "+0%",
          icon: TrendingUp,
          tone: "indigo",
          description: "Rolling 30 day daily average",
        },
        {
          title: "Paid vs Pending",
          value: "0% / 0%",
          delta: "+0%",
          icon: CreditCard,
          tone: "slate",
          description: "Collection health across gateways",
        },
        {
          title: "Active Markets",
          value: "0",
          delta: "+0 new",
          icon: Globe2,
          tone: "rose",
          description: "Countries with live transactions",
        },
      ];
    }

    const { kpis: kpiData } = earningsData;
    return [
      {
        title: "Total Earnings (YTD)",
        value: formatCurrency(kpiData.totalEarningsYTD),
        delta: formatPercentage(kpiData.earningsDelta || 0),
        icon: DollarSign,
        tone: "emerald",
        description: "Revenue across all connected stores",
      },
      {
        title: "Avg. Daily Revenue",
        value: formatCurrency(kpiData.avgDailyRevenue),
        delta: formatPercentage(kpiData.avgDailyDelta || 0),
        icon: TrendingUp,
        tone: "indigo",
        description: "Rolling 30 day daily average",
      },
      {
        title: "Paid vs Pending",
        value: `${Math.round(kpiData.paidPercentage || 0)}% / ${Math.round(kpiData.pendingPercentage || 0)}%`,
        delta: "+0%",
        icon: CreditCard,
        tone: "slate",
        description: "Collection health across gateways",
      },
      {
        title: "Active Markets",
        value: String(kpiData.activeMarkets || 0),
        delta: "+0 new",
        icon: Globe2,
        tone: "rose",
        description: "Countries with live transactions",
      },
    ];
  }, [earningsData]);

  const lineChartConfig = {
    desktop: { label: "Net earnings", color: "hsl(var(--chart-3))" },
  };

  const lineChartData = useMemo(() => {
    if (!earningsData?.chartData) {
      return [];
    }
    return earningsData.chartData;
  }, [earningsData]);

  const payoutStatus = useMemo(() => {
    if (!earningsData?.payoutStatus) {
      return {
        clearedPayouts: 0,
        scheduledPending: 0,
        disputedOnHold: 0,
      };
    }
    return earningsData.payoutStatus;
  }, [earningsData]);

  const channelBreakdown = useMemo(() => {
    if (!earningsData?.channelBreakdown || earningsData.channelBreakdown.length === 0) {
      return [
        { name: "Direct ecommerce", amount: 0 },
        { name: "Marketplaces", amount: 0 },
        { name: "Wholesale & B2B", amount: 0 },
      ];
    }
    return earningsData.channelBreakdown.slice(0, 3);
  }, [earningsData]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <DollarSign className="w-64 h-64 -rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Earnings Overview</h1>
          <p className="text-violet-100 text-lg">
            Consolidated revenue performance across all stores, markets and payment providers.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpis.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                  {item.title}
                </p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                item.tone === "emerald"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : item.tone === "indigo"
                    ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    : item.tone === "rose"
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400"
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`px-2.5 py-1 rounded-full font-medium ${
                  item.tone === "emerald"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : item.tone === "indigo"
                      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                      : item.tone === "rose"
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {item.delta}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings trend & breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart */}
        <section className="xl:col-span-2 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Earnings trend</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Month-over-month net earnings across all sales channels.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-medium transition-colors">
                Year to date
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Last 90 days
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading chart data...</p>
            </div>
          ) : (
            <LineChartComponent
              chartData={lineChartData}
              chartConfig={lineChartConfig}
            />
          )}
        </section>

        {/* Right side breakdown cards */}
        <section className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payout status</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-400">Cleared payouts (7d)</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isLoading ? "..." : formatCurrency(payoutStatus.clearedPayouts)}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10">
                <span className="text-amber-700 dark:text-amber-400">Scheduled / pending</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {isLoading ? "..." : formatCurrency(payoutStatus.scheduledPending)}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10">
                <span className="text-rose-700 dark:text-rose-400">Disputed / on hold</span>
                <span className="font-bold text-rose-700 dark:text-rose-400">
                  {isLoading ? "..." : formatCurrency(payoutStatus.disputedOnHold)}
                </span>
              </li>
            </ul>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Channel breakdown</h2>
            <ul className="space-y-3 text-sm">
              {isLoading ? (
                <li className="flex items-center justify-center py-4">
                  <span className="text-slate-500 dark:text-slate-400 animate-pulse">Loading...</span>
                </li>
              ) : channelBreakdown.length > 0 ? (
                channelBreakdown.map((channel, index) => (
                  <li key={index} className="flex items-center justify-between group">
                    <span className="text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {channel.name || "Other"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(channel.amount)}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center justify-center py-4">
                  <span className="text-slate-500 dark:text-slate-400">No data available</span>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuperAdminEarningsPage;


