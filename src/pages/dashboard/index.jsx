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

// --- Icons & Logos for Integration List ---
const StripeIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#635BFF]/10 flex items-center justify-center">
    <svg
      width="20"
      height="20"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 28.5C14 28.5 14 23.5 21.5 23.5C29 23.5 29 18.5 29 18.5C29 18.5 29 13.5 20.5 13.5C14.5 13.5 14.5 16.5 14.5 16.5"
        stroke="#635BFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const ZapierIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#FF4F00]/10 flex items-center justify-center">
    <div className="w-5 h-5 bg-[#FF4F00] rounded-sm"></div>
  </div>
);

const ShopifyIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#95BF47]/10 flex items-center justify-center">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#95BF47"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  </div>
);

const ZoomIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#2D8CFF]/10 flex items-center justify-center">
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#2D8CFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  </div>
);

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

  // Use API data or fall back to mock data
  const { data: dashboardData } = useGetDashboardQuery({
    companyId: authUser?.companyId,
  });

  // Simulate loading state for new components
  const [isLoading, setIsLoading] = useState(true);

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

  // --- MOCK DATA FOR NEXUS THEME ---

  // Sales Overview Data Variants
  const salesDataDaily = [
    { name: "00:00", China: 10, UE: 5, USA: 8, Canada: 2, Other: 1 },
    { name: "04:00", China: 25, UE: 15, USA: 20, Canada: 10, Other: 5 },
    { name: "08:00", China: 60, UE: 40, USA: 50, Canada: 30, Other: 10 },
    { name: "12:00", China: 100, UE: 80, USA: 90, Canada: 50, Other: 20 },
    { name: "16:00", China: 80, UE: 60, USA: 70, Canada: 40, Other: 15 },
    { name: "20:00", China: 40, UE: 30, USA: 35, Canada: 20, Other: 8 },
    { name: "23:59", China: 15, UE: 10, USA: 12, Canada: 5, Other: 2 },
  ];

  const salesDataWeekly = [
    { name: "Mon", China: 300, UE: 150, USA: 200, Canada: 80, Other: 30 },
    { name: "Tue", China: 450, UE: 280, USA: 300, Canada: 120, Other: 50 },
    { name: "Wed", China: 380, UE: 220, USA: 250, Canada: 100, Other: 40 },
    { name: "Thu", China: 500, UE: 350, USA: 320, Canada: 150, Other: 60 },
    { name: "Fri", China: 600, UE: 400, USA: 380, Canada: 180, Other: 70 },
    { name: "Sat", China: 550, UE: 380, USA: 350, Canada: 160, Other: 65 },
    { name: "Sun", China: 400, UE: 250, USA: 280, Canada: 110, Other: 45 },
  ];

  const salesDataMonthly = [
    { name: "Jan", China: 278, UE: 390, USA: 200, Canada: 90, Other: 30 },
    { name: "Feb", China: 189, UE: 480, USA: 218, Canada: 110, Other: 40 },
    { name: "Mar", China: 239, UE: 380, USA: 250, Canada: 100, Other: 50 },
    { name: "Apr", China: 349, UE: 430, USA: 210, Canada: 130, Other: 60 },
    { name: "May", China: 420, UE: 460, USA: 260, Canada: 140, Other: 70 },
    { name: "Jun", China: 460, UE: 500, USA: 280, Canada: 150, Other: 80 },
    { name: "Jul", China: 480, UE: 520, USA: 300, Canada: 160, Other: 90 },
    { name: "Aug", China: 450, UE: 490, USA: 290, Canada: 155, Other: 85 },
    { name: "Sep", China: 430, UE: 470, USA: 270, Canada: 145, Other: 75 },
    { name: "Oct", China: 400, UE: 240, USA: 240, Canada: 100, Other: 50 },
    { name: "Nov", China: 300, UE: 139, USA: 221, Canada: 80, Other: 40 },
    { name: "Dec", China: 500, UE: 380, USA: 229, Canada: 120, Other: 60 },
  ];

  // export default salesDataMonthly;/

  const salesDataYearly = [
    { name: "2018", China: 2000, UE: 1200, USA: 1500, Canada: 600, Other: 300 },
    { name: "2019", China: 2500, UE: 1400, USA: 1800, Canada: 700, Other: 350 },
    { name: "2020", China: 3000, UE: 1600, USA: 2000, Canada: 800, Other: 400 },
    { name: "2021", China: 3500, UE: 1800, USA: 2200, Canada: 900, Other: 450 },
    {
      name: "2022",
      China: 4000,
      UE: 2000,
      USA: 2400,
      Canada: 1000,
      Other: 500,
    },
    {
      name: "2023",
      China: 5000,
      UE: 2500,
      USA: 3000,
      Canada: 1200,
      Other: 600,
    },
    {
      name: "2024",
      China: 5500,
      UE: 2800,
      USA: 3300,
      Canada: 1400,
      Other: 700,
    },
  ];

  // Sparkline Data
  const sparklineData1 = Array.from({ length: 10 }, () => ({
    value: Math.random() * 100,
  }));
  const sparklineData2 = Array.from({ length: 10 }, () => ({
    value: Math.random() * 100,
  }));
  const sparklineData3 = Array.from({ length: 10 }, () => ({
    value: Math.random() * 100,
  }));
  const sparklineData4 = Array.from({ length: 10 }, () => ({
    value: Math.random() * 100,
  }));

  // Computed Sales Data
  const filteredSalesData = useMemo(() => {
    switch (salesFilter) {
      case "Daily":
        return salesDataDaily;
      case "Weekly":
        return salesDataWeekly;
      case "Monthly":
        return salesDataMonthly;
      case "Yearly":
        return salesDataYearly;
      default:
        return salesDataMonthly;
    }
  }, [salesFilter]);

  // Subscriber Data Variants
  const subscriberDataWeekly = [
    { name: "Sun", value: 20 },
    { name: "Mon", value: 30 },
    { name: "Tue", value: 70 }, // Highlighted in design
    { name: "Wed", value: 40 },
    { name: "Thu", value: 50 },
    { name: "Fri", value: 35 },
    { name: "Sat", value: 45 },
  ];

  const subscriberDataDaily = [
    { name: "00h", value: 10 },
    { name: "04h", value: 5 },
    { name: "08h", value: 15 },
    { name: "12h", value: 35 },
    { name: "16h", value: 25 },
    { name: "20h", value: 40 },
    { name: "23h", value: 20 },
  ];

  const subscriberDataMonthly = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 550 },
    { name: "Apr", value: 450 },
    { name: "May", value: 600 },
    { name: "Jun", value: 700 },
    { name: "Jul", value: 750 },
    { name: "Aug", value: 720 },
    { name: "Sep", value: 680 },
    { name: "Oct", value: 640 },
    { name: "Nov", value: 700 },
    { name: "Dec", value: 780 },
  ];

  const subscriberDataYearly = [
    { name: "2020", value: 12000 },
    { name: "2021", value: 15000 },
    { name: "2022", value: 18000 },
    { name: "2023", value: 22000 },
    { name: "2024", value: 24473 },
  ];

  const currentSubscriberData = useMemo(() => {
    switch (subscriberFilter) {
      case "Daily":
        return subscriberDataDaily;
      case "Monthly":
        return subscriberDataMonthly;
      case "Yearly":
        return subscriberDataYearly;
      default:
        return subscriberDataWeekly;
    }
  }, [subscriberFilter]);

  // Distribution Data Variants
  const salesDistributionData = [
    { name: "Website", value: 374.82, color: "#5347CE" }, // Nexus Primary
    { name: "Mobile App", value: 241.6, color: "#16C8C7" }, // Nexus Teal
    { name: "Other", value: 213.42, color: "#E2E8F0" }, // Gray
  ];

  const currentDistributionData = useMemo(() => {
    const multiplier =
      distributionFilter === "Weekly"
        ? 0.25
        : distributionFilter === "Yearly"
          ? 12
          : 1;
    return salesDistributionData.map((d) => ({
      ...d,
      value: parseFloat((d.value * multiplier).toFixed(2)),
    }));
  }, [distributionFilter]);

  const integrationList = [
    {
      id: 1,
      name: "Stripe",
      type: "Finance",
      rate: "40%",
      profit: "$650.00",
      icon: StripeIcon,
    },
    {
      id: 2,
      name: "Zapier",
      type: "CRM",
      rate: "80%",
      profit: "$720.50",
      icon: ZapierIcon,
    },
    {
      id: 3,
      name: "Shopify",
      type: "Marketplace",
      rate: "20%",
      profit: "$432.25",
      icon: ShopifyIcon,
    },
    {
      id: 4,
      name: "Zoom",
      type: "Technology",
      rate: "60%",
      profit: "$650.00",
      icon: ZoomIcon,
    },
  ];

  // --- NEW MOCK DATA ---
  const recentLogins = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    user: [
      "Alice Johnson",
      "Bob Smith",
      "Charlie Davis",
      "Diana Evans",
      "Ethan Hall",
    ][i % 5],
    ip: [
      "192.168.1.45",
      "10.0.0.23",
      "172.16.5.99",
      "192.168.1.101",
      "10.0.0.55",
    ][i % 5],
    time: [
      "2 min ago",
      "15 min ago",
      "1 hour ago",
      "3 hours ago",
      "5 hours ago",
    ][i % 5],
    status: i % 2 === 0 ? "Success" : "Failed",
  }));

  const recentProducts = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    name: `Product ${String.fromCharCode(65 + i)}`,
    category: ["Electronics", "Clothing", "Home", "Sports"][i % 4],
    price: `$${(Math.random() * 100 + 20).toFixed(2)}`,
    stock: Math.floor(Math.random() * 50) + 1,
  }));

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

  // Transactions
  const recentTransactions = Array.from({ length: 15 }).map((_, i) => ({
    id: i + 1,
    name: [
      "Andrew James",
      "John Carter",
      "Sophia White",
      "Daniel Martinez",
      "Amelia Robinson",
      "Amelia Robinson",
      "Amelia Robinson",
    ][i % 5],
    inv: `#INV454${70 + i}`,
    amount:
      i % 2 === 0
        ? `+ $${(Math.random() * 500 + 100).toFixed(2)}`
        : `- $${(Math.random() * 200 + 50).toFixed(2)}`,
    type: i % 2 === 0 ? "success" : "danger",
    icon: i % 3 === 0 ? "P" : "S",
    date: i < 8 ? "Today" : "Yesterday",
  }));

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
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent tracking-tighter">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Overview of your store performance
          </p>
        </div>

        {/* Date Display */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Updated just now
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Products"
          value="2,543"
          change="12.5%"
          changeType="increase"
          icon={Package}
          iconBgColor="bg-blue-100 dark:bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={sparklineData1}
        />
        <MetricCard
          title="Total Sales"
          value="45,231"
          change="8.2%"
          changeType="increase"
          icon={ShoppingBag}
          iconBgColor="bg-emerald-100 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          sparklineData={sparklineData2}
        />
        <MetricCard
          title="Total Revenue"
          value="$363.95k"
          change="3.4%"
          changeType="decrease"
          icon={DollarSign}
          iconBgColor="bg-rose-100 dark:bg-rose-500/10"
          iconColor="text-rose-600 dark:text-rose-400"
          sparklineData={sparklineData3}
        />
        <MetricCard
          title="Total Store Views"
          value="86.5k"
          change="24.2%"
          changeType="increase"
          icon={Eye}
          iconBgColor="bg-purple-100 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
          sparklineData={sparklineData4}
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
                <span className="text-2xl font-bold">$9,257.51</span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 15.8%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  +$143.50 increased
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
                  <Bar
                    dataKey="China"
                    stackId="a"
                    fill={colors.chartStack[0]}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="UE"
                    stackId="a"
                    fill={colors.chartStack[1]}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="USA"
                    stackId="a"
                    fill={colors.chartStack[2]}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Canada"
                    stackId="a"
                    fill={colors.chartStack[3]}
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="Other"
                    stackId="a"
                    fill={colors.chartStack[4]}
                    radius={[4, 4, 0, 0]}
                  />
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
                <span className="text-2xl font-bold">24,473</span>
                <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> 8.3%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">+749 increased</p>
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
                  {integrationList.map((item) => (
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
                          <item.icon />
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
                                backgroundColor: "#5347CE", // Consistent Nexus Primary
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
                  ))}
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
