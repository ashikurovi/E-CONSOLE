import React, { useMemo } from "react";
import { DollarSign, Users, Headset } from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import { useGetOverviewQuery } from "@/features/overview/overviewApiSlice";

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
          tone: "green",
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
          tone: "default",
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
        tone: "green",
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
        tone: "default",
        description: "Conversations waiting for agent response",
      },
    ];
  }, [overviewData]);

  const quickLinks = [
    {
      label: "View Earnings Dashboard",
      href: "/superadmin/earnings",
      description: "See detailed revenue, orders and payments analytics.",
    },
    {
      label: "Manage Customers",
      href: "/superadmin/customers",
      description: "View, filter and manage all customer accounts.",
    },
    {
      label: "Support Inbox",
      href: "/superadmin/support",
      description: "Review help center tickets and reply to users.",
    },

  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Super Admin Overview</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          High level control panel with earnings overview, customers, and support in one place.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4 flex flex-col gap-3"
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
              <span className="text-black/50 dark:text-white/60">{item.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column layout: customers + support */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Customers summary */}
        <section className="xl:col-span-2 rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-medium">Our Customers</h2>
              <p className="text-xs text-black/60 dark:text-white/60">
                Snapshot of recent customer activity across the platform.
              </p>
            </div>
            <a
              href="/customers"
              className="text-xs px-3 py-1 rounded-lg bg-black text-white hover:bg-black/90"
            >
              View all customers
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-gray-50 dark:bg-black/30 p-4">
              <p className="text-xs text-black/60 dark:text-white/60">New customers (7 days)</p>
              <p className="mt-1 text-lg font-semibold">428</p>
              <p className="mt-1 text-xs text-emerald-500">+12.3% vs last week</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-black/30 p-4">
              <p className="text-xs text-black/60 dark:text-white/60">Returning customers</p>
              <p className="mt-1 text-lg font-semibold">64%</p>
              <p className="mt-1 text-xs text-emerald-500">Healthy loyalty segment</p>
            </div>
            <div className="rounded-xl bg-gray-50 dark:bg-black/30 p-4">
              <p className="text-xs text-black/60 dark:text-white/60">At-risk customers</p>
              <p className="mt-1 text-lg font-semibold">213</p>
              <p className="mt-1 text-xs text-rose-400">Need win-back campaigns</p>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-md font-medium flex items-center gap-2">
                <Headset className="w-4 h-4" />
                Support
              </h2>
              <a
                href="/help"
                className="text-xs px-2 py-1 rounded-lg bg-black text-white hover:bg-black/90"
              >
                Go to help center
              </a>
            </div>
            <ul className="space-y-2 text-xs text-black/70 dark:text-white/70">
              <li className="flex items-center justify-between">
                <span>New tickets today</span>
                <span className="font-medium">9</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Waiting for reply</span>
                <span className="font-medium text-amber-400">18</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Average first response time</span>
                <span className="font-medium">12 min</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Quick navigation */}
      <section className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <h2 className="text-md font-medium mb-3">Quick navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-xl border border-black/5 dark:border-white/10 p-3 text-xs hover:bg-gray-50 dark:hover:bg-black/40 transition-colors"
            >
              <p className="font-medium">{link.label}</p>
              <p className="mt-1 text-black/60 dark:text-white/60">{link.description}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SuperAdminOverviewPage;



