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
          tone: "green",
          description: "Revenue across all connected stores",
        },
        {
          title: "Avg. Daily Revenue",
          value: "$0",
          delta: "+0%",
          icon: TrendingUp,
          tone: "blue",
          description: "Rolling 30 day daily average",
        },
        {
          title: "Paid vs Pending",
          value: "0% / 0%",
          delta: "+0%",
          icon: CreditCard,
          tone: "default",
          description: "Collection health across gateways",
        },
        {
          title: "Active Markets",
          value: "0",
          delta: "+0 new",
          icon: Globe2,
          tone: "red",
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
        tone: "green",
        description: "Revenue across all connected stores",
      },
      {
        title: "Avg. Daily Revenue",
        value: formatCurrency(kpiData.avgDailyRevenue),
        delta: formatPercentage(kpiData.avgDailyDelta || 0),
        icon: TrendingUp,
        tone: "blue",
        description: "Rolling 30 day daily average",
      },
      {
        title: "Paid vs Pending",
        value: `${Math.round(kpiData.paidPercentage || 0)}% / ${Math.round(kpiData.pendingPercentage || 0)}%`,
        delta: "+0%",
        icon: CreditCard,
        tone: "default",
        description: "Collection health across gateways",
      },
      {
        title: "Active Markets",
        value: String(kpiData.activeMarkets || 0),
        delta: "+0 new",
        icon: Globe2,
        tone: "red",
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
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Earnings Overview</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Consolidated revenue performance across all stores, markets and
          payment providers.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-black/50 dark:text-white/50">
                  {item.title}
                </p>
                <p className="mt-1 text-xl font-semibold">{item.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span
                className={`px-2 py-0.5 rounded-full font-medium ${item.tone === "green"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : item.tone === "red"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : item.tone === "blue"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  }`}
              >
                {item.delta}
              </span>
              <span className="text-black/50 dark:text-white/60">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings trend & breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart */}
        <section className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">Earnings trend</h2>
              <p className="text-xs text-black/60 dark:text-white/60">
                Month-over-month net earnings across all sales channels.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <button className="px-3 py-1 rounded-lg bg-black text-white">
                Year to date
              </button>
              <button className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-black/70 dark:text-white/70">
                Last 90 days
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm text-black/60 dark:text-white/60">Loading chart data...</p>
            </div>
          ) : (
            <LineChartComponent
              chartData={lineChartData}
              chartConfig={lineChartConfig}
            />
          )}
        </section>

        {/* Right side breakdown cards */}
        <section className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4 space-y-4">
          <div>
            <h2 className="text-md font-medium mb-2">Payout status</h2>
            <ul className="space-y-2 text-xs text-black/70 dark:text-white/70">
              <li className="flex items-center justify-between">
                <span>Cleared payouts (last 7 days)</span>
                <span className="font-medium">
                  {isLoading ? "..." : formatCurrency(payoutStatus.clearedPayouts)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Scheduled / pending</span>
                <span className="font-medium text-amber-500">
                  {isLoading ? "..." : formatCurrency(payoutStatus.scheduledPending)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Disputed / on hold</span>
                <span className="font-medium text-rose-400">
                  {isLoading ? "..." : formatCurrency(payoutStatus.disputedOnHold)}
                </span>
              </li>
            </ul>
          </div>

          <div className="h-px bg-black/5 dark:bg-white/10" />

          <div>
            <h2 className="text-md font-medium mb-2">Channel breakdown</h2>
            <ul className="space-y-2 text-xs text-black/70 dark:text-white/70">
              {isLoading ? (
                <li className="flex items-center justify-center py-4">
                  <span className="text-black/50 dark:text-white/50">Loading...</span>
                </li>
              ) : channelBreakdown.length > 0 ? (
                channelBreakdown.map((channel, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{channel.name || "Other"}</span>
                    <span className="font-medium">{formatCurrency(channel.amount)}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-center justify-center py-4">
                  <span className="text-black/50 dark:text-white/50">No data available</span>
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


