import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Filter,
  Download,
  Calendar,
  Eye,
  Activity,
  ShoppingBag,
  User,
  Package,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Users,
  CreditCard,
  TrendingUp,
  UserPlus,
  PieChart as PieChartIcon,
  Blocks,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart, Area } from "recharts";

const TypewriterText = ({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const currentFullText = texts[textIndex];

    if (isDeleting) {
      if (displayedText === "") {
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, deletingSpeed);
      }
    } else {
      if (displayedText === currentFullText) {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      } else {
        timeout = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, typingSpeed);
      }
    }

    return () => clearTimeout(timeout);
  }, [
    displayedText,
    isDeleting,
    textIndex,
    texts,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return (
    <span className="font-medium bg-gradient-to-r from-nexus-primary to-nexus-secondary bg-clip-text text-transparent">
      {displayedText}
      <span className="animate-pulse text-nexus-primary ml-1">|</span>
    </span>
  );
};

const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconBgColor,
  iconColor,
  sparklineData,
}) => {
  const isPositive = changeType === "increase";
  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${iconBgColor} transition-colors group-hover:scale-110 duration-300`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <span className="text-gray-500 dark:text-gray-400 font-medium text-sm tracking-wide">
              {title}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-4 relative z-10">
          <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositive
                  ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                  : "bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {change}
            </div>
            <span className="text-xs text-gray-400 font-medium">
              vs last month
            </span>
          </div>
        </div>

        {/* Sparkline Chart Background */}
        <div className="absolute bottom-0 right-0 w-32 h-16 opacity-20 group-hover:opacity-30 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient
                  id={`gradient-${title}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={isPositive ? "#16C8C6" : "#F43F5E"}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={isPositive ? "#16C8C6" : "#F43F5E"}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#16C8C6" : "#F43F5E"}
                fill={`url(#gradient-${title})`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// --- SKELETON LOADER ---
const SkeletonLoader = ({ rows = 5 }) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2 w-full max-w-[150px]">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);

  // Dynamic Time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentDateTime.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const { data: dashboardData, isLoading: isDashboardLoading } = useGetDashboardQuery({
    companyId: authUser?.companyId,
  }, { skip: !authUser?.companyId });

  const isLoading = isDashboardLoading;

  // Pagination State for Recent Products
  const [currentPage, setCurrentPage] = useState(1);
  const [loginPage, setLoginPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter States
  const [salesFilter, setSalesFilter] = useState("Monthly");
  const [subscriberFilter, setSubscriberFilter] = useState("Weekly");
  const [distributionFilter, setDistributionFilter] = useState("Monthly");

  // All data from API - no mock fallbacks
  const lineChartData = dashboardData?.lineChartData ?? [];
  const sparklineData = lineChartData.map((d) => ({ value: d.totalPNL }));

  const filteredSalesData = useMemo(() => {
    const apiData = dashboardData?.salesOverview?.[salesFilter?.toLowerCase()];
    return (apiData ?? []).map((d) => ({ name: d.name, Revenue: d.totalPNL }));
  }, [salesFilter, dashboardData?.salesOverview]);

  const currentSubscriberData = useMemo(() => {
    const apiData = dashboardData?.subscriberChart?.[subscriberFilter?.toLowerCase()];
    return apiData ?? [];
  }, [subscriberFilter, dashboardData?.subscriberChart]);

  const currentDistributionData = useMemo(() => {
    const apiData = dashboardData?.salesDistribution;
    return apiData ?? [];
  }, [dashboardData?.salesDistribution]);

  // Integrations - API only (empty until integrations API exists)
  const integrationList = dashboardData?.integrations ?? [];

  // Recent Customers - API only
  const recentLogins = useMemo(() => {
    const apiData = dashboardData?.recentCustomers ?? [];
    return apiData.map((c, i) => ({ id: c.id || i + 1, user: c.user, ip: c.ip, time: c.time }));
  }, [dashboardData?.recentCustomers]);

  // Recent Products - API only
  const recentProducts = useMemo(() => {
    return dashboardData?.recentProducts ?? [];
  }, [dashboardData?.recentProducts]);

  // Pagination Logic
  // Products
  const totalPages = Math.ceil(recentProducts.length / itemsPerPage);
  const currentProducts = recentProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Logins
  const totalLoginPages = Math.ceil(recentLogins.length / itemsPerPage);
  const currentLogins = recentLogins.slice(
    (loginPage - 1) * itemsPerPage,
    loginPage * itemsPerPage,
  );

  // Recent Transactions - API only
  const recentTransactions = useMemo(() => {
    return dashboardData?.recentTransactions ?? [];
  }, [dashboardData?.recentTransactions]);

  const totalTransactionPages = Math.ceil(
    recentTransactions.length / itemsPerPage,
  );
  const currentTransactions = recentTransactions.slice(
    (transactionPage - 1) * itemsPerPage,
    transactionPage * itemsPerPage,
  );

  // Colors from Nexus Palette
  const colors = {
    primary: "#5347CE",
    secondary: "#887CFD",
    blue: "#4896FE",
    teal: "#16C8C7",
    chartStack: ["#5347CE", "#887CFD", "#4896FE", "#16C8C7", "#FF9F43"], // Replaced Gray with Orange
  };

  return (
    <div
      className="p-4 md:p-6 space-y-6 bg-gray-50/50 dark:bg-black/20 min-h-screen"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 p-6 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-sm relative overflow-hidden group">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-nexus-primary/5 via-transparent to-nexus-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-nexus-primary to-gray-900 dark:from-white dark:via-nexus-primary dark:to-gray-400 bg-clip-text text-transparent tracking-tighter animate-gradient-x bg-[length:200%_auto]">
            {getGreeting()}, SquadCart
          </h1>
          <div className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <TypewriterText
              texts={[
                "Overview of your store performance",
                "Real-time analytics and insights",
                "Manage orders and inventory effortlessly",
                "Track your growth and revenue",
              ]}
            />
          </div>
        </div>

        {/* Date Display */}
        <div className="text-left md:text-right relative z-10 w-full md:w-auto">
          <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {currentDateTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
          <p className="text-sm font-medium text-nexus-primary dark:text-nexus-blue mt-0.5 uppercase tracking-wider">
            {currentDateTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value={dashboardData?.overviewMetrics?.totalProducts?.toLocaleString() ?? "0"}
          change={dashboardData?.stats?.[0]?.delta ?? "0%"}
          changeType={dashboardData?.stats?.[0]?.tone === "green" ? "increase" : "decrease"}
          icon={Package}
          iconBgColor="bg-blue-100 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title="Total Sales"
          value={dashboardData?.overviewMetrics?.totalSales?.toLocaleString() ?? "0"}
          change={dashboardData?.stats?.[1]?.delta ?? "0%"}
          changeType={dashboardData?.stats?.[1]?.tone === "green" ? "increase" : "decrease"}
          icon={ShoppingBag}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title="Total Revenue"
          value={dashboardData?.overviewMetrics?.totalRevenue != null
            ? `$${Number(dashboardData.overviewMetrics.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : "$0.00"}
          change={dashboardData?.stats?.[0]?.delta ?? "0%"}
          changeType={dashboardData?.stats?.[0]?.tone === "green" ? "increase" : "decrease"}
          icon={DollarSign}
          iconBgColor="bg-rose-100 dark:bg-rose-500/10"
          iconColor="text-rose-600 dark:text-rose-400"
          sparklineData={sparklineData}
        />
        <MetricCard
          title="Total Customers"
          value={dashboardData?.overviewMetrics?.totalStoreViews?.toLocaleString() ?? "0"}
          change={dashboardData?.stats?.[1]?.delta ?? "0%"}
          changeType={dashboardData?.stats?.[1]?.tone === "green" ? "increase" : "decrease"}
          icon={Eye}
          iconBgColor="bg-purple-100 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          sparklineData={sparklineData}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview (Stacked Bar) */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4 sm:gap-0">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sales Overview
              </CardTitle>
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">
                  ${dashboardData?.overviewMetrics?.totalRevenue != null
                    ? Number(dashboardData.overviewMetrics.totalRevenue).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0.00"}
                </span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {dashboardData?.stats?.[0]?.delta ?? "0%"}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  Sales Overview
                </span>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 flex-1 sm:flex-none"
                  >
                    <Filter className="w-3 h-3" />{" "}
                    {salesFilter === "All Time" ? "Filter" : salesFilter}{" "}
                    <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSalesFilter("Daily")}>
                    Daily
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSalesFilter("Weekly")}>
                    Weekly
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSalesFilter("Monthly")}>
                    Monthly
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSalesFilter("Yearly")}>
                    Yearly
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredSalesData} barSize={20}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Revenue" fill={colors.chartStack[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Total Subscriber (Bar Chart) */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Total Subscriber
              </CardTitle>
              <div className="flex flex-wrap items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold">
                  {dashboardData?.overviewMetrics?.totalStoreViews?.toLocaleString() ?? "0"}
                </span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {dashboardData?.stats?.[1]?.delta ?? "0%"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Total Customers</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  {subscriberFilter}{" "}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSubscriberFilter("Daily")}>
                  Daily
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubscriberFilter("Weekly")}>
                  Weekly
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSubscriberFilter("Monthly")}
                >
                  Monthly
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSubscriberFilter("Yearly")}>
                  Yearly
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentSubscriberData} barSize={32}>
                  <defs>
                    <linearGradient
                      id="subscriberGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#5347CE" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#887CFD"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    dy={10}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 6, 6]}
                    fill="url(#subscriberGradient)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Distribution (Semi-Circle Gauge) */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Sales Distribution
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  {distributionFilter}{" "}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setDistributionFilter("Weekly")}
                >
                  Weekly
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDistributionFilter("Monthly")}
                >
                  Monthly
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDistributionFilter("Yearly")}
                >
                  Yearly
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-full justify-between">
              {/* Top Legend / Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {currentDistributionData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center sm:items-start text-center sm:text-left"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className="w-1 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-lg font-bold tracking-tight">
                      ${item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Semi-Circle Chart */}
              <div className="h-[200px] relative -mb-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentDistributionData}
                      cx="50%"
                      cy="100%"
                      innerRadius={80}
                      outerRadius={110}
                      startAngle={180}
                      endAngle={0}
                      paddingAngle={0}
                      dataKey="value"
                      cornerRadius={8}
                      stroke="none"
                    >
                      {currentDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* List of Integration */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Blocks className="w-5 h-5" />
              List of Integration
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-nexus-primary h-8 font-medium hover:text-nexus-primary/80 hover:bg-transparent px-0"
            >
              See All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="pb-4 w-10 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-nexus-primary focus:ring-nexus-primary/20"
                      />
                    </th>
                    <th className="pb-4 pl-2">Addonen</th>
                    <th className="pb-4">Type</th>
                    <th className="pb-4">Rate</th>
                    <th className="pb-4 text-right pr-2">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {integrationList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No integrations connected yet
                      </td>
                    </tr>
                  ) : (
                    integrationList.map((item) => (
                      <tr
                        key={item.id}
                        className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="py-4 text-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-nexus-primary focus:ring-nexus-primary/20"
                          />
                        </td>
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <Blocks className="w-5 h-5 text-nexus-primary" />
                            <span className="font-bold text-gray-900 dark:text-white text-sm">
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-500 text-sm">
                          {item.type}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-3 w-40">
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-nexus-primary rounded-full"
                                style={{
                                  width: item.rate,
                                  backgroundColor: "#5347CE",
                                }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {item.rate}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right font-bold text-gray-900 dark:text-white pr-2 text-sm">
                          {item.profit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NEW SECTION: 3 Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent User Login List */}
        <Card className="border-none shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Customers
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <SkeletonLoader rows={5} />
            ) : (
              <div className="flex flex-col h-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-1">
                            User <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-1">
                            IP Address <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center justify-end gap-1">
                            Time <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLogins.map((login) => (
                        <TableRow key={login.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-nexus-primary/10 flex items-center justify-center text-nexus-primary">
                              <User className="w-4 h-4" />
                            </div>
                            {login.user}
                          </TableCell>
                          <TableCell>{login.ip}</TableCell>
                          <TableCell className="text-right text-gray-500">
                            {login.time}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Items per page</span>
                    <select
                      className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none"
                      disabled
                    >
                      <option>{itemsPerPage}</option>
                    </select>
                  </div>
                  <span>
                    {(loginPage - 1) * itemsPerPage + 1}-
                    {Math.min(loginPage * itemsPerPage, recentLogins.length)} of{" "}
                    {recentLogins.length} items
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setLoginPage(1)}
                      disabled={loginPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setLoginPage((p) => Math.max(1, p - 1))}
                      disabled={loginPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() =>
                        setLoginPage((p) => Math.min(totalLoginPages, p + 1))
                      }
                      disabled={loginPage === totalLoginPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setLoginPage(totalLoginPages)}
                      disabled={loginPage === totalLoginPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 2: Recent Product Table (10 items) */}
        <Card className="border-none shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Recent Products
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <SkeletonLoader rows={10} />
            ) : (
              <div className="flex flex-col h-full">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-1">
                            Product <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center gap-1">
                            Price <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="text-right uppercase text-xs font-bold text-gray-500">
                          <div className="flex items-center justify-end gap-1">
                            Stock <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-nexus-teal/10 flex items-center justify-center text-nexus-teal">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-[10px] text-gray-400 uppercase">
                                {product.category}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${product.stock < 10 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}
                            >
                              {product.stock}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Items per page</span>
                    <select
                      className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none"
                      disabled
                    >
                      <option>{itemsPerPage}</option>
                    </select>
                  </div>
                  <span>
                    {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(
                      currentPage * itemsPerPage,
                      recentProducts.length,
                    )}{" "}
                    of {recentProducts.length} items
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3: Recent Transactions (Design Match) */}
        <Card className="border-none shadow-sm h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            {isLoading ? (
              <SkeletonLoader rows={5} />
            ) : (
              <div className="flex flex-col h-full">
                <div className="space-y-6">
                  {/* Today Group */}
                  {currentTransactions.some((t) => t.date === "Today") && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">
                        Today
                      </h4>
                      <div className="space-y-4">
                        {currentTransactions
                          .filter((t) => t.date === "Today")
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${transaction.icon === "P" ? "bg-[#003087]" : "bg-[#635BFF]"}`}
                                >
                                  {transaction.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-nexus-primary transition-colors">
                                    {transaction.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {transaction.inv}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`px-2 py-1 rounded text-sm font-bold ${
                                  transaction.type === "success"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                }`}
                              >
                                {transaction.amount}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Yesterday Group */}
                  {currentTransactions.some((t) => t.date === "Yesterday") && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-3">
                        Yesterday
                      </h4>
                      <div className="space-y-4">
                        {currentTransactions
                          .filter((t) => t.date === "Yesterday")
                          .map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${transaction.icon === "P" ? "bg-[#003087]" : "bg-[#635BFF]"}`}
                                >
                                  {transaction.icon}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-nexus-primary transition-colors">
                                    {transaction.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {transaction.inv}
                                  </p>
                                </div>
                              </div>
                              <div
                                className={`px-2 py-1 rounded text-sm font-bold ${
                                  transaction.type === "success"
                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                }`}
                              >
                                {transaction.amount}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span>Items per page</span>
                    <select
                      className="bg-transparent border border-gray-200 dark:border-gray-700 rounded px-1 py-0.5 focus:outline-none"
                      disabled
                    >
                      <option>{itemsPerPage}</option>
                    </select>
                  </div>
                  <span>
                    {(transactionPage - 1) * itemsPerPage + 1}-
                    {Math.min(
                      transactionPage * itemsPerPage,
                      recentTransactions.length,
                    )}{" "}
                    of {recentTransactions.length} items
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setTransactionPage(1)}
                      disabled={transactionPage === 1}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() =>
                        setTransactionPage((p) => Math.max(1, p - 1))
                      }
                      disabled={transactionPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() =>
                        setTransactionPage((p) =>
                          Math.min(totalTransactionPages, p + 1),
                        )
                      }
                      disabled={transactionPage === totalTransactionPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:opacity-50"
                      onClick={() => setTransactionPage(totalTransactionPages)}
                      disabled={transactionPage === totalTransactionPages}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;