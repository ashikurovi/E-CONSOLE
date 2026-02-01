import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Search,
  Bell,
  User,
  Wallet,
  ShoppingBag,
  Users,
  MoreHorizontal,
  Wifi,
  MoreVertical,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

/**
 * StatisticsPage Component
 * Redesigned to match the "Finexa" reference dashboard.
 */
export default function StatisticsPage() {
  const { t } = useTranslation();

  // --- MOCK DATA ---

  // Chart Data
  const chartData = [
    { name: "Mon", earning: 180, sells: 100, visit: 150 },
    { name: "Tue", earning: 220, sells: 140, visit: 230 },
    { name: "Wed", earning: 280, sells: 180, visit: 250 },
    { name: "Thu", earning: 320, sells: 240, visit: 180 },
    { name: "Fri", earning: 380, sells: 200, visit: 320 },
    { name: "Sat", earning: 250, sells: 160, visit: 210 },
    { name: "Sun", earning: 300, sells: 220, visit: 280 },
  ];

  // Country Stats
  const countryStats = [
    { country: "Canada", users: "55,520", flag: "🇨🇦" },
    { country: "Japan", users: "45,240", flag: "🇯🇵" },
    { country: "USA", users: "24,320", flag: "🇺🇸" },
    { country: "New zealand", users: "13,550", flag: "🇳🇿" },
    { country: "India", users: "11,000", flag: "🇮🇳" },
    { country: "Germany", users: "9,450", flag: "🇩🇪" },
    { country: "Denmark", users: "7,325", flag: "🇩🇰" },
  ];

  // Top Client Data
  const paymentData = [
    {
      id: 1,
      name: "Jerome Bell",
      email: "jeromebell@gmail.com",
      contact: "+91 95256 32957",
      product: "Payment page",
      amount: "$ 6,956",
      avatar: "https://i.pravatar.cc/150?u=1",
    },
    {
      id: 2,
      name: "Dianne Russell",
      email: "diannerussell@gmail.com",
      contact: "+91 85246 96352",
      product: "Payment page",
      amount: "$ 2,125",
      avatar: "https://i.pravatar.cc/150?u=2",
    },
    {
      id: 3,
      name: "Jenny Wilson",
      email: "jennywilson@gmail.com",
      contact: "+91 65854 96298",
      product: "Payment page",
      amount: "$ 9,382",
      avatar: "https://i.pravatar.cc/150?u=3",
    },
    {
      id: 4,
      name: "Ralph Edwards",
      email: "ralphedwards@gmail.com",
      contact: "+91 75254 96268",
      product: "Payment page",
      amount: "$ 3,790",
      avatar: "https://i.pravatar.cc/150?u=4",
    },
  ];

  // Map Dots Generation
  // Using a static seed-like generation for consistency
  const generateDots = () => {
    const dots = [];
    for (let i = 0; i < 400; i++) {
      dots.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() > 0.9 ? 2 : 1.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    return dots;
  };
  const dots = React.useMemo(() => generateDots(), []);

  // Map Connections (Simulated)
  const connections = [
    { x1: 20, y1: 30, x2: 45, y2: 35 }, // NA to Europe
    { x1: 45, y1: 35, x2: 75, y2: 40 }, // Europe to Asia
    { x1: 20, y1: 30, x2: 25, y2: 60 }, // NA to SA
    { x1: 45, y1: 35, x2: 50, y2: 65 }, // Europe to Africa
    { x1: 75, y1: 40, x2: 80, y2: 70 }, // Asia to Aus
  ];

  return (
    <div className="p-4 md:p-8  dark:bg-[#0b0f14] min-h-screen font-sans text-[#1A1A1A] dark:text-white">
      {/* --- MIDDLE ROW: Charts & Map --- */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Statistics Chart */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Statistic</h2>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
                <span className="font-medium text-gray-500">Earning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
                <span className="font-medium text-gray-500">Sells</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#14B8A6]"></div>
                <span className="font-medium text-gray-500">Visit</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) =>
                    `${value >= 1000 ? value / 1000 + "k" : value}`
                  }
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar
                  dataKey="earning"
                  fill="#8B5CF6"
                  radius={[4, 4, 4, 4]}
                  barSize={8}
                />
                <Bar
                  dataKey="sells"
                  fill="#F59E0B"
                  radius={[4, 4, 4, 4]}
                  barSize={8}
                />
                <Bar
                  dataKey="visit"
                  fill="#14B8A6"
                  radius={[4, 4, 4, 4]}
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Statistics Map */}
        <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2 relative min-h-[300px] bg-[#F8F9FB] dark:bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center">
            <h2 className="absolute top-6 left-6 text-xl font-bold z-10">
              Live Statistics
            </h2>

            {/* Dots Map Background */}
            <div className="absolute inset-0">
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  className="absolute rounded-full bg-[#D1D5DB] dark:bg-gray-700"
                  style={{
                    left: `${dot.x}%`,
                    top: `${dot.y}%`,
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    opacity: dot.opacity,
                  }}
                />
              ))}
            </div>

            {/* Connections & Pulsing Points (SVG Overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                  <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Connection Lines */}
              {connections.map((conn, i) => (
                <motion.path
                  key={i}
                  d={`M ${conn.x1}% ${conn.y1}% Q ${(conn.x1 + conn.x2) / 2}% ${conn.y1 - 10}% ${conn.x2}% ${conn.y2}%`}
                  fill="none"
                  stroke="url(#lineGradient)"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }}
                />
              ))}

              {/* Connection Points */}
              {[
                ...new Set(
                  connections.flatMap((c) => [
                    { x: c.x1, y: c.y1 },
                    { x: c.x2, y: c.y2 },
                  ]),
                ),
              ].map((p, i) => (
                <g key={i}>
                  <circle cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="#8B5CF6" />
                  <circle
                    cx={`${p.x}%`}
                    cy={`${p.y}%`}
                    r="8"
                    fill="#8B5CF6"
                    opacity="0.2"
                  >
                    <animate
                      attributeName="r"
                      values="8;12;8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.2;0;0.2"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ))}
            </svg>

            {/* Wifi Icon Indicator */}
            <div className="absolute bottom-6 left-6">
              <Wifi className="w-6 h-6 text-[#8B5CF6] opacity-50" />
            </div>
          </div>

          {/* Country Stats List */}
          <div className="flex flex-col justify-center space-y-5 lg:pl-4">
            <div className="text-right mb-2">
              <span className="text-2xl font-bold">450k</span>
              <p className="text-xs text-gray-500">Total Live by city</p>
            </div>

            <div className="space-y-4">
              {countryStats.map((item) => (
                <div
                  key={item.country}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.flag}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.country}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {item.users}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: Top Client --- */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Top Clients</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                <th className="pb-4 pl-4">User Name</th>
                <th className="pb-4">Contact</th>
                <th className="pb-4">Product</th>
                <th className="pb-4 text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {paymentData.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="w-10 h-10 rounded-full bg-gray-200"
                      />
                      <div>
                        <p className="font-bold text-[#1A1A1A] dark:text-white text-sm">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-500">
                    {item.contact}
                  </td>
                  <td className="py-4 text-sm font-medium text-gray-500">
                    {item.product}
                  </td>
                  <td className="py-4 text-right pr-4 font-bold text-emerald-500">
                    {item.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
