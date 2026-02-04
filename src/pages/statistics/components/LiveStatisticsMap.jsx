import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Wifi } from "lucide-react";
import { motion } from "framer-motion";

/**
 * LiveStatisticsMap Component
 * Displays an interactive map visualization with country statistics
 */
export default function LiveStatisticsMap({
  countryStats = [],
  totalLiveUsers = 450000,
  connections = [
    { x1: 20, y1: 30, x2: 45, y2: 35 },
    { x1: 45, y1: 35, x2: 75, y2: 40 },
    { x1: 20, y1: 30, x2: 25, y2: 60 },
    { x1: 45, y1: 35, x2: 50, y2: 65 },
    { x1: 75, y1: 40, x2: 80, y2: 70 },
  ],
}) {
  const { t } = useTranslation();

  // Generate dots for map background
  const dots = useMemo(() => {
    const dotArray = [];
    for (let i = 0; i < 400; i++) {
      dotArray.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() > 0.9 ? 2 : 1.5,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }
    return dotArray;
  }, []);

  // Format total users count
  const formatTotalUsers = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`;
    return count.toString();
  };

  // Get unique connection points
  const connectionPoints = useMemo(() => {
    const points = new Map();
    connections.forEach((conn) => {
      const key1 = `${conn.x1}-${conn.y1}`;
      const key2 = `${conn.x2}-${conn.y2}`;
      if (!points.has(key1)) points.set(key1, { x: conn.x1, y: conn.y1 });
      if (!points.has(key2)) points.set(key2, { x: conn.x2, y: conn.y2 });
    });
    return Array.from(points.values());
  }, [connections]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-[#1a1f26] rounded-[32px] p-8 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Map Area */}
      <div className="lg:col-span-2 relative min-h-[300px] bg-[#F8F9FB] dark:bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center">
        <h2 className="absolute top-6 left-6 text-xl font-bold z-10 text-gray-900 dark:text-white">
          {t("statistics.liveStatistics")}
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
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Connection Lines */}
          {connections.map((conn, i) => (
            <motion.path
              key={`conn-${i}`}
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

          {/* Connection Points with Pulse Animation */}
          {connectionPoints.map((p, i) => (
            <g key={`point-${i}`}>
              <circle cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="#8B5CF6" />
              <circle cx={`${p.x}%`} cy={`${p.y}%`} r="8" fill="#8B5CF6" opacity="0.2">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>

        {/* Wifi Icon Indicator */}
        <motion.div
          className="absolute bottom-6 left-6"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Wifi className="w-6 h-6 text-[#8B5CF6]" />
        </motion.div>
      </div>

      {/* Country Stats List */}
      <div className="flex flex-col justify-center space-y-5 lg:pl-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-right mb-2"
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatTotalUsers(totalLiveUsers)}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t("statistics.totalLiveByCity")}
          </p>
        </motion.div>

        <div className="space-y-4">
          {countryStats.map((item, index) => (
            <motion.div
              key={item.country}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center justify-between text-sm hover:bg-gray-50 dark:hover:bg-white/5 p-2 rounded-lg transition-colors"
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
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
