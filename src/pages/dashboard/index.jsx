import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Chart from "react-apexcharts";
import {
  FileText,
  Users,
  DollarSign,
  File,
  ShoppingBag,
  CreditCard,
  Flag,
  PieChart,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Calendar as CalendarIcon,
  Search,
  MoreVertical,
  ArrowRight,
} from "lucide-react";
import { useGetDashboardQuery } from "@/features/dashboard/dashboardApiSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// --- Components ---

const SectionCard = ({ title, children, className = "" }) => (
  <div className={`bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5 shadow-sm ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{title}</h3>
      <div className="flex gap-2">
         {/* Actions if needed */}
      </div>
    </div>
    {children}
  </div>
);

const InfoItem = ({ icon: Icon, label, value, colorClass = "text-blue-600 bg-blue-50" }) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

const MiniStatCard = ({ title, value, trend, icon: Icon }) => (
  <div className="bg-white dark:bg-[#1a1f26] bg p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm relative overflow-hidden">
    <div>
       <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
       <div className="flex items-baseline gap-2">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{value}</h4>
          {trend && <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{trend}</span>}
       </div>
       <Link to="#" className="text-xs text-purple-600 font-medium mt-2 inline-block hover:underline">View All</Link>
    </div>
    <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center">
       <Icon className="w-5 h-5 text-gray-400" />
    </div>
  </div>
);

// --- Chart Configs ---

const RevenueChart = ({ data }) => {
  const isDark = typeof document !== "undefined" && document.documentElement?.classList?.contains("dark");
  
  const options = {
    chart: { type: "bar", fontFamily: "inherit", toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 4, columnWidth: "30%", distributed: false },
    },
    colors: ["#7c3aed"],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: data.map(d => d.month),
      labels: { style: { colors: isDark ? "#94a3b8" : "#64748b" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: isDark ? "#94a3b8" : "#64748b" } },
    },
    grid: {
      borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      strokeDashArray: 4,
    },
    tooltip: { theme: isDark ? "dark" : "light" },
    fill: { opacity: 1 },
  };

  const series = [{ name: "Revenue", data: data.map(d => d.value) }];

  return <Chart options={options} series={series} type="bar" height={320} />;
};

const TopSalesChart = () => {
  const isDark = typeof document !== "undefined" && document.documentElement?.classList?.contains("dark");
  
  const options = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: ["Dell XPS 13", "Nike T-shirt", "iPhone 15"],
    colors: ["#7c3aed", "#ec4899", "#10b981"],
    plotOptions: {
      pie: {
        startAngle: -90,
        endAngle: 90,
        offsetY: 10,
        donut: {
           size: '70%',
           labels: {
             show: true,
             name: { show: false },
             value: {
               offsetY: -2,
               fontSize: "22px",
               fontWeight: 700,
               color: isDark ? "#fff" : "#111",
               formatter: () => "38%",
             }
           }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'bottom', show: true },
    grid: { padding: { bottom: -80 } },
    stroke: { show: false }, 
    tooltip: { theme: isDark ? "dark" : "light" },
  };

  const series = [38, 40, 22];

  return <Chart options={options} series={series} type="donut" height={250} />;
};

const IncomeChart = () => {
    // Mini sparkline for "Total Income on Invoice"
    const isDark = typeof document !== "undefined" && document.documentElement?.classList?.contains("dark");
    const options = {
        chart: { type: "area", sparkline: { enabled: true } },
        stroke: { curve: "smooth", width: 2 },
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] } },
        colors: ["#10b981"],
        tooltip: { theme: isDark ? "dark" : "light" },
    };
    const series = [{ data: [30, 40, 35, 50, 49, 60, 70, 91, 125] }];
    return <Chart options={options} series={series} type="area" height={80} />;
};


// --- Main Page ---

const DashboardPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const { data: dashboardData, isLoading } = useGetDashboardQuery({ companyId: authUser?.companyId });

  // Safe names and defaults
  const userName = authUser?.name || "User";
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  
  // Real Data Mappings with Fallbacks
  const stats = dashboardData?.stats || [];
  const revenue = stats.find(s => s.title?.toLowerCase().includes('revenue') || s.tone === 'green')?.value || "$0.00";
  const ordersCount = stats.find(s => s.title?.toLowerCase().includes('order') && !s.title.includes('Value'))?.value || "0";
  const customersCount = stats.find(s => s.title?.toLowerCase().includes('customer'))?.value || "0";
  
  // Mock Data for Kanakku specific fields not in basic API
  const amountDue = "$1,642";
  const quotationsCount = "2,150";
  const purchaseTotal = "$1,54,220";
  const expenseTotal = "$10,041";
  const creditsTotal = "$12,150";
  
  const invoiceStats = {
    invoiced: "$21,132",
    received: "$10,763",
    outstanding: "$8,041",
    overdue: "$45,897.01"
  };

  // Chart Data
  const lineChartData = dashboardData?.lineChartData?.map(d => ({
      month: new Date(d.month).toLocaleDateString('en-US', { weekday: 'short' }),
      value: d.totalPNL
  })) || [
      { month: "Mon", value: 12000 },
      { month: "Tue", value: 18000 },
      { month: "Wed", value: 11000 },
      { month: "Thu", value: 34000 },
      { month: "Fri", value: 4500 },
      { month: "Sat", value: 22000 },
      { month: "Sun", value: 30000 },
  ];

  const recentOrders = dashboardData?.recentOrders?.slice(0, 5) || [];
  
  // Customer List Mock (Mixed with real if available?)
  const customers = [
      { name: "Emily Clark", invoices: 45, balance: "$3,589", img: "https://i.pravatar.cc/150?u=1" },
      { name: "John Smith", invoices: 16, balance: "$5,426", img: "https://i.pravatar.cc/150?u=2" },
      { name: "Olivia Harris", invoices: 23, balance: "$1,493", img: "https://i.pravatar.cc/150?u=3" },
      { name: "William Parker", invoices: 58, balance: "$7,854", img: "https://i.pravatar.cc/150?u=4" },
      { name: "Charlotte Brown", invoices: 9, balance: "$4,989", img: "https://i.pravatar.cc/150?u=5" },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8f9] dark:bg-[#0b0f14] p-4 lg:p-8 space-y-6">
      
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
         <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
         <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
               <CalendarIcon className="w-4 h-4" />
               <span>24 Mar 2025 - 31 Mar 2025</span>
            </div>
            <Button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white">
               <Plus className="w-4 h-4 mr-2" />
               Create New
            </Button>
            <Button variant="outline" className="border-gray-200 dark:border-gray-800">
               <Download className="w-4 h-4 mr-2" />
               Export
            </Button>
         </div>
      </div>

      {/* --- Purple Banner --- */}
      <div className="rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white p-8 relative overflow-hidden shadow-lg">
         <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-2">Good Morning, {userName}</h2>
            <p className="text-white/80 mb-6">You have 15+ invoices saved to draft that require attention.</p>
            <div className="flex items-center gap-4 text-sm font-medium text-white/90">
               <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {currentDate}</div>
            </div>
         </div>
         {/* Illustration Placeholder */}
         <div className="absolute right-0 bottom-0 hidden lg:block">
            <img 
               src="https://cdni.iconscout.com/illustration/premium/thumb/man-analyzing-business-report-4444585-3691652.png" 
               alt="Dashboard" 
               className="h-48 object-contain translate-y-4 translate-x-4 opacity-90 grayscale-[0.2] brightness-125"
            />
         </div>
      </div>

      {/* --- Top Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         
         {/* Overview */}
         <SectionCard title="Overview">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InfoItem icon={FileText} label="Invoices" value={ordersCount} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
               <InfoItem icon={Users} label="Customers" value={customersCount} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
               <InfoItem icon={AlertCircle} label="Amount Due" value={amountDue} colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" />
               <InfoItem icon={File} label="Quotations" value={quotationsCount} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
            </div>
         </SectionCard>

         {/* Sales Analytics */}
         <SectionCard title="Sales Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InfoItem icon={ShoppingBag} label="Total Sales" value={revenue} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" />
               <InfoItem icon={ShoppingBag} label="Purchase" value={purchaseTotal} colorClass="bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400" />
               <InfoItem icon={DollarSign} label="Expenses" value={expenseTotal} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400" />
               <InfoItem icon={Flag} label="Credits" value={creditsTotal} colorClass="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-400" />
            </div>
         </SectionCard>

         {/* Invoice Statistics */}
         <SectionCard title="Invoice Statistics">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InfoItem icon={FileText} label="Invoiced" value={invoiceStats.invoiced} colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400" />
               <InfoItem icon={CheckCircle} label="Received" value={invoiceStats.received} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" />
               <InfoItem icon={Clock} label="Outstanding" value={invoiceStats.outstanding} colorClass="bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" />
               <InfoItem icon={AlertCircle} label="Overdue" value={invoiceStats.overdue} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
            </div>
         </SectionCard>
      </div>

      {/* --- Middle Grid (Mini Stats + Revenue Chart + Customers) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
         
         {/* Left Side: Mini Stacked Stats */}
         <div className="xl:col-span-3 space-y-4">
            <MiniStatCard title="Total Products" value="897" trend="+45%" icon={ShoppingBag} />
            <MiniStatCard title="Total Sales" value="645" trend="+45%" icon={ShoppingBag} />
            <MiniStatCard title="Total Quotations" value="128" trend="+45%" icon={FileText} />
            <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 justify-between group">
               View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
         </div>

         {/* Center: Revenue Chart */}
         <div className="xl:col-span-6 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5">
             <div className="flex items-center justify-between mb-6">
                <div>
                   <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Revenue</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">$98,545</span>
                      <span className="text-xs font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full">+45%</span>
                   </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]"></span> Received</div>
                   <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600"></span> Outstanding</div>
                </div>
             </div>
             <RevenueChart data={lineChartData} />
         </div>

         {/* Right: Customers List */}
         <div className="xl:col-span-3 bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex flex-col">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Customers</h3>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
               {customers.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                     <img src={c.img} alt={c.name} className="w-10 h-10 rounded-full" />
                     <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                        <p className="text-xs text-gray-500">No of Invoices: {c.invoices}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xs text-gray-500 mb-0.5">Outstanding</p>
                        <p className="font-bold text-gray-900 dark:text-white">{c.balance}</p>
                     </div>
                  </div>
               ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-gray-100 dark:border-gray-700">All Customers</Button>
         </div>

      </div>

      {/* --- Invoices Table --- */}
      <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5 overflow-hidden">
         <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Invoices</h3>
            <Button className="bg-[#7c3aed] text-white">View All Invoices</Button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-[#f9fafb] dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
                  <tr>
                     <th className="py-3 px-4">ID</th>
                     <th className="py-3 px-4">Customer</th>
                     <th className="py-3 px-4">Created On</th>
                     <th className="py-3 px-4">Amount</th>
                     <th className="py-3 px-4">Paid</th>
                     <th className="py-3 px-4">Payment Mode</th>
                     <th className="py-3 px-4">Due Date</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* Reuse recent orders or mock data if insufficient */}
                  {[...Array(6)].map((_, i) => (
                     <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-purple-600 font-medium">#INV{200021 + i}</td>
                        <td className="py-3 px-4 flex items-center gap-2">
                           <img src={`https://i.pravatar.cc/150?u=${i + 10}`} className="w-6 h-6 rounded-full" alt="User" />
                           <span className="text-gray-900 dark:text-white font-medium">Barbara Moore</span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">22 Feb 2025</td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">$10,000</td>
                        <td className="py-3 px-4 text-gray-500">$5,000</td>
                        <td className="py-3 px-4 text-gray-500">Cash</td>
                        <td className="py-3 px-4 text-gray-500">04 Mar 2025</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* --- Bottom Row: Transactions, Quotations, Charts --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Recent Transactions */}
         <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Recent Transactions</h3>
            <div className="space-y-1">
               <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Today</p>
               {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">A</div>
                        <div>
                           <p className="text-sm font-medium text-gray-900 dark:text-white">Andrew James</p>
                           <p className="text-xs text-gray-500">#INV45478</p>
                        </div>
                     </div>
                     <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">+$989.15</span>
                  </div>
               ))}
               <p className="text-xs font-semibold text-gray-500 mt-4 mb-2 uppercase">Yesterday</p>
               {[3, 4].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold">S</div>
                        <div>
                           <p className="text-sm font-medium text-gray-900 dark:text-white">Sophia White</p>
                           <p className="text-xs text-gray-500">#INV45476</p>
                        </div>
                     </div>
                     <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs font-bold">+$669.00</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Quotations / Incomes */}
         <div className="space-y-6">
             <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="font-semibold text-gray-900 dark:text-white">Total Income on Invoice</h3>
                   <div className="flex items-center gap-1 text-emerald-600 text-sm font-bold"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> 30.2%</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">$98,545</h2>
                <IncomeChart />
             </div>

             <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">Quotations</h3>
                <div className="space-y-3">
                    {[
                        { name: "Emily Clark", id: "QU0014", status: "Accepted", tone: "emerald" },
                        { name: "David Anderson", id: "QU0147", status: "Sent", tone: "blue" },
                        { name: "Sophia White", id: "QU1947", status: "Expired", tone: "gray" },
                    ].map((q, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src={`https://i.pravatar.cc/150?u=${i + 20}`} className="w-9 h-9 rounded-full" alt={q.name} />
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{q.name}</p>
                                    <p className="text-xs text-gray-500">{q.id}</p>
                                </div>
                            </div>
                            <Badge className={`bg-${q.tone}-50 text-${q.tone}-600 border-${q.tone}-100 hover:bg-${q.tone}-100`}>{q.status}</Badge>
                        </div>
                    ))}
                </div>
             </div>
         </div>

         {/* Top Sales Stats */}
         <div className="bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 rounded-xl p-5 flex flex-col items-center justify-center">
             <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 self-start">Top Sales Statistics</h3>
             <div className="flex gap-2 text-xs mb-4 w-full">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7c3aed]"></span> Dell XPS 13</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ec4899]"></span> Nike T-shirt</div>
             </div>
             <TopSalesChart />
         </div>

      </div>

    </div>
  );
};

export default DashboardPage;
