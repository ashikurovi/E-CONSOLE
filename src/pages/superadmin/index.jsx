import React, { useMemo } from "react";
import { DollarSign, Users, Headset, ArrowUpRight, TrendingUp, TrendingDown, Activity, CreditCard } from "lucide-react";
import { useGetOverviewQuery } from "@/features/overview/overviewApiSlice";
import { Link } from "react-router-dom";

const SuperAdminOverviewPage = () => {
  const { data: overviewData, isLoading } = useGetOverviewQuery();

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
    if (!overviewData?.kpis) {
      return [
        {
          title: "Total Earnings",
          value: "$0",
          delta: "+0%",
          icon: DollarSign,
          tone: "violet",
          description: "Overall revenue across all stores",
        },
        {
          title: "Active Customers",
          value: "0",
          delta: "+0%",
          icon: Users,
          tone: "blue",
          description: "Users who purchased in the last 90 days",
        },
        {
          title: "Open Support Tickets",
          value: "0",
          delta: "+0%",
          icon: Headset,
          tone: "rose",
          description: "Conversations waiting for agent response",
        },
      ];
    }

    const { kpis: kpiData } = overviewData;
    return [
      {
        title: "Total Earnings",
        value: formatCurrency(kpiData.totalEarnings),
        delta: formatPercentage(kpiData.totalEarningsDelta || 0),
        icon: DollarSign,
        tone: "violet",
        description: "Overall revenue across all stores",
      },
      {
        title: "Active Customers",
        value: new Intl.NumberFormat("en-US").format(kpiData.activeCustomers || 0),
        delta: formatPercentage(kpiData.activeCustomersDelta || 0),
        icon: Users,
        tone: "blue",
        description: "Users who purchased in the last 90 days",
      },
      {
        title: "Open Support Tickets",
        value: String(kpiData.openSupportTickets || 0),
        delta: formatPercentage(kpiData.openSupportTicketsDelta || 0),
        icon: Headset,
        tone: "rose",
        description: "Conversations waiting for agent response",
      },
    ];
  }, [overviewData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="w-64 h-64 -rotate-12" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Welcome back, Super Admin</h1>
          <p className="text-violet-100 text-lg">
            Here's what's happening across the platform today. You have <span className="font-semibold text-white">{overviewData?.kpis?.openSupportTickets || 0} new support tickets</span> requiring attention.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((item, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:-translate-y-1 duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                item.tone === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400" :
                item.tone === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" :
                "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              }`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
                item.delta.startsWith("+") 
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                  : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
              }`}>
                {item.delta.startsWith("+") ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {item.delta}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {item.title}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                {item.value}
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: customers + support */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Customers summary */}
        <section className="xl:col-span-2 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Activity</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Snapshot of recent customer growth and retention.
              </p>
            </div>
            <Link
              to="/superadmin/customers"
              className="flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors"
            >
              View all customers
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">New (7 days)</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {overviewData?.customers?.newCustomersLast7Days || 0}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-500">
                {overviewData?.customers?.newCustomersLast7Days > 0 ? "+12.3% vs last week" : "No new customers yet"}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Retention Rate</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {overviewData?.customers?.returningCustomersPercentage || 0}%
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-500">
                {overviewData?.customers?.returningCustomersPercentage > 50 ? "Healthy loyalty segment" : "Building loyalty"}
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-transform hover:scale-[1.02]">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">At-Risk</p>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                {overviewData?.customers?.atRiskCustomers || 0}
              </p>
              <p className="mt-2 text-xs font-medium text-rose-500">
                {overviewData?.customers?.atRiskCustomers > 0 ? "Action needed" : "Great job!"}
              </p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col h-full shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white">Support</h2>
             <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
               {overviewData?.kpis?.openSupportTickets || 0} Pending
             </span>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
             <div className="w-16 h-16 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-4 animate-pulse">
               <Headset className="w-8 h-8 text-violet-600 dark:text-violet-400" />
             </div>
             <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Help Center Inbox</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-[200px]">
               Review and respond to customer inquiries efficiently.
             </p>
             <Link 
               to="/superadmin/support" 
               className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors shadow-lg shadow-violet-200 dark:shadow-none"
             >
               Go to Inbox
             </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SuperAdminOverviewPage;
