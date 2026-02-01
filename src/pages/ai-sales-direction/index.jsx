import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiSalesDirectionQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import {
  Target,
  AlertCircle,
  Minus,
  ChevronRight,
  Languages,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
  Zap,
  Star,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Premium Brand Colors
const BRAND_COLOR = "#887CFD";
const BRAND_GRADIENT = "linear-gradient(135deg, #887CFD 0%, #6f63e3 100%)";

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: "#EF4444",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-500 via-rose-500 to-rose-600",
    glow: "shadow-red-500/20",
    badge: "High Priority",
  },
  medium: {
    icon: Target,
    color: "#887CFD",
    bg: "bg-[#887CFD]/10",
    border: "border-[#887CFD]/20",
    gradient: "from-[#887CFD] via-[#7c6ff5] to-[#6f63e3]",
    glow: "shadow-[#887CFD]/20",
    badge: "Medium Priority",
  },
  low: {
    icon: Minus,
    color: "#16C8C7",
    bg: "bg-[#16C8C7]/10",
    border: "border-[#16C8C7]/20",
    gradient: "from-[#16C8C7] via-[#12b5b4] to-[#0e8a89]",
    glow: "shadow-[#16C8C7]/20",
    badge: "Low Priority",
  },
  info: {
    icon: Lightbulb,
    color: "#3B82F6",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500 via-indigo-500 to-indigo-600",
    glow: "shadow-blue-500/20",
    badge: "Info",
  },
};

// Floating particles animation
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-[#887CFD]/30 rounded-full"
        initial={{
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        }}
        animate={{
          y: [null, Math.random() * window.innerHeight],
          x: [null, Math.random() * window.innerWidth],
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: Math.random() * 10 + 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

// Premium Timeline Item
const TimelineItem = ({
  direction,
  index,
  total,
  displayTitle,
  displayAction,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const priority = (direction?.priority || "medium").toLowerCase();
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        type: "spring",
        stiffness: 100,
      }}
      className="relative pl-8 sm:pl-16 py-3 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Enhanced Connector Line with Gradient */}
      {!isLast && (
        <div className="absolute left-[15px] sm:left-[31px] top-12 bottom-0 w-[2px] overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-b ${config.gradient}`}
            initial={{ scaleY: 0, opacity: 0.3 }}
            animate={{ scaleY: 1, opacity: 0.5 }}
            transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      )}

      {/* Premium Node with Glow Effect */}
      <div className="absolute left-0 sm:left-4 top-4 z-10">
        <motion.div
          className={`relative w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-xl ${config.glow}`}
          whileHover={{ scale: 1.2, rotate: 180 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {/* Inner glow ring */}
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />

          {/* Number badge */}
          <motion.div
            className="relative z-10 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center shadow-lg"
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs sm:text-sm font-black bg-gradient-to-br from-[#887CFD] to-[#6f63e3] bg-clip-text text-transparent">
              {index + 1}
            </span>
          </motion.div>

          {/* Outer ripple effect */}
          <motion.div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient}`}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Premium Card */}
      <motion.div
        whileHover={{ scale: 1.02, x: 8 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`relative overflow-hidden rounded-3xl bg-white dark:bg-[#1e2530] border-2 ${config.border} p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 group/card`}
      >
        {/* Animated gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/card:opacity-5 transition-opacity duration-700`}
          animate={isHovered ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Glass morphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-white/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 backdrop-blur-sm" />

        {/* Accent top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 overflow-hidden">
          <motion.div
            className={`h-full w-full bg-gradient-to-r ${config.gradient}`}
            initial={{ x: "-100%" }}
            animate={{ x: isHovered ? "0%" : "-100%" }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#887CFD]/10 to-transparent rounded-bl-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 items-start">
          {/* Premium Icon Box with 3D effect */}
          <motion.div
            className={`relative p-4 rounded-2xl ${config.bg} backdrop-blur-lg shrink-0 shadow-lg group-hover/card:shadow-xl transition-shadow border border-white/20 dark:border-white/5`}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            <Icon
              className="w-7 h-7 relative z-10"
              style={{ color: config.color }}
            />
            {/* Icon glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover/card:opacity-50 transition-opacity"
              style={{ backgroundColor: config.color }}
            />
          </motion.div>

          <div className="flex-1 space-y-3">
            {/* Header with badge */}
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div className="space-y-2 flex-1">
                <motion.h3
                  className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white group-hover/card:text-transparent group-hover/card:bg-clip-text group-hover/card:bg-gradient-to-r from-[#887CFD] to-[#6f63e3] transition-all duration-300 leading-tight"
                  layoutId={`title-${index}`}
                >
                  {displayTitle ?? direction?.title ?? "Recommendation"}
                </motion.h3>

                {/* Subtitle indicator */}
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500">
                  <Zap className="w-3 h-3" />
                  <span className="uppercase tracking-wider">
                    Action Required
                  </span>
                </div>
              </div>

              {/* Premium Priority Badge */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative px-4 py-2 rounded-xl text-xs font-black border-2 ${config.bg} ${config.border} backdrop-blur-sm shadow-lg overflow-hidden`}
                style={{ color: config.color }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-10`}
                />
                <span className="relative z-10 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-current" />
                  {config.badge}
                </span>
              </motion.div>
            </div>

            {/* Description with enhanced typography */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 + 0.2 }}
            >
              {displayAction ?? direction?.action ?? "—"}
            </motion.p>

            {/* Action Footer with hover effect */}
            <motion.div
              className={`pt-3 flex items-center justify-between text-sm font-bold cursor-pointer group/action`}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 group-hover/action:text-[#887CFD] transition-colors">
                <Award className="w-4 h-4" />
                <span>View Full Strategy</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/action:translate-x-2" />
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 group-hover/action:bg-[#887CFD]"
                    animate={isHovered ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom shine effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#887CFD]/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      </motion.div>
    </motion.div>
  );
};

// Premium Circular Strategy Map
const CircularStrategyMap = ({ directions, getDisplayDirection }) => {
  const total = directions.length;
  const center = 400;
  const radiusMain = 160;
  const radiusOuter = 280; // Increased from 260 to 280 for more space

  const getPos = (angleDeg, r) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + Math.cos(angleRad) * r,
      y: center + Math.sin(angleRad) * r,
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = getPos(endAngle, radius);
    const end = getPos(startAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(" ");
  };

  const drawVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: {
          delay: i * 0.25,
          type: "spring",
          duration: 2,
          bounce: 0,
        },
        opacity: { delay: i * 0.25, duration: 0.3 },
      },
    }),
  };

  return (
    <div className="relative w-[800px] h-[800px] mx-auto flex items-center justify-center my-12 select-none scale-75 lg:scale-90 xl:scale-100 transition-transform">
      {/* Ambient glow layers */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#887CFD]/20 blur-[100px] rounded-full animate-pulse" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#16C8C7]/20 blur-[80px] rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* SVG Layer */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <defs>
          {/* Premium gradient for arrows */}
          <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#887CFD" />
            <stop offset="100%" stopColor="#6f63e3" />
          </linearGradient>

          {/* Arrow marker */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="url(#arrowGradient)" />
          </marker>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Multi-layered inner rings */}
        <motion.circle
          cx={center}
          cy={center}
          r={120}
          fill="none"
          stroke="#887CFD"
          strokeWidth="0.5"
          strokeDasharray="3 3"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.2, scale: 1, rotate: 360 }}
          transition={{
            opacity: { duration: 1.5 },
            scale: { duration: 1.5, type: "spring" },
            rotate: { duration: 80, repeat: Infinity, ease: "linear" },
          }}
        />

        <motion.circle
          cx={center}
          cy={center}
          r={140}
          fill="none"
          stroke="#887CFD"
          strokeWidth="1"
          strokeDasharray="5 5"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.3, scale: 1, rotate: -360 }}
          transition={{
            opacity: { duration: 1.5 },
            scale: { duration: 1.5, type: "spring" },
            rotate: { duration: 100, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Enhanced Segments & Connectors */}
        {directions.map((dir, index) => {
          const priority = (dir?.priority || "medium").toLowerCase();
          const config = priorityConfig[priority] || priorityConfig.medium;

          const angleStep = 360 / total;
          const startAngle = index * angleStep - 90;
          const endAngle = startAngle + angleStep - 15;

          const arcPath = describeArc(
            center,
            center,
            radiusMain,
            startAngle + 5,
            endAngle,
          );

          const nodeAngle = startAngle + angleStep / 2;
          const ringPos = getPos(nodeAngle, radiusMain);
          const outerPos = getPos(nodeAngle, radiusOuter);

          return (
            <g key={index}>
              {/* Glow layer for arc */}
              <motion.path
                d={arcPath}
                fill="none"
                stroke={config.color}
                strokeWidth="10"
                opacity="0.15"
                filter="url(#glow)"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              {/* Main arc segment with gradient */}
              <motion.path
                d={arcPath}
                fill="none"
                stroke="url(#arrowGradient)"
                strokeWidth="7"
                markerEnd="url(#arrow)"
                className="opacity-90"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              {/* Connector line with glow */}
              <motion.line
                x1={ringPos.x}
                y1={ringPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke={config.color}
                strokeWidth="3"
                opacity="0.4"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              <motion.line
                x1={ringPos.x}
                y1={ringPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke="url(#arrowGradient)"
                strokeWidth="5"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              {/* Enhanced ring connection point */}
              <motion.circle
                cx={ringPos.x}
                cy={ringPos.y}
                r="8"
                fill="white"
                stroke="url(#arrowGradient)"
                strokeWidth="4"
                filter="url(#glow)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.25 + 0.8, type: "spring" }}
              />

              <motion.circle
                cx={ringPos.x}
                cy={ringPos.y}
                r="4"
                fill="url(#arrowGradient)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.25 + 1, type: "spring" }}
              />
            </g>
          );
        })}
      </svg>

      {/* Premium Central Hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.5 }}
        className="absolute z-20 flex flex-col items-center justify-center w-64 h-64 rounded-full bg-white dark:bg-[#1a1f26] shadow-[0_0_80px_rgba(136,124,253,0.3)] border-[10px] border-white dark:border-gray-800 overflow-hidden"
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#887CFD]/10 via-transparent to-[#16C8C7]/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Content */}
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: "spring" }}
            className="mb-3"
          >
            <Sparkles className="w-10 h-10 mx-auto text-[#887CFD] fill-[#887CFD]/20" />
          </motion.div>

          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            AI Sales
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#887CFD] to-[#6f63e3]">
              Direction
            </span>
          </h2>

          <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16C8C7] animate-pulse" />
            <span>LIVE INSIGHTS</span>
          </div>
        </div>

        {/* Inner decorative rings */}
        <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#887CFD]/20 pointer-events-none" />
        <div className="absolute inset-8 rounded-full border border-[#887CFD]/10 pointer-events-none" />
      </motion.div>

      {/* Orbiting Nodes */}
      {directions.map((dir, index) => {
        const disp = getDisplayDirection(index);
        const title = disp?.title ?? dir?.title ?? "Action";
        const action = disp?.action ?? dir?.action ?? "—";
        const priority = (dir?.priority || "medium").toLowerCase();
        const config = priorityConfig[priority] || priorityConfig.medium;
        const Icon = config.icon;

        const angleStep = 360 / total;
        const nodeAngle = index * angleStep - 90 + angleStep / 2;
        const pos = getPos(nodeAngle, radiusOuter);

        const normAngle = (nodeAngle + 360) % 360;
        const isRight = normAngle > 270 || normAngle < 90;

        let textAlignClass = "text-left";
        let containerClass = "left-28 top-1/2 -translate-y-1/2"; // Increased from left-20 to left-28

        if (!isRight) {
          textAlignClass = "text-right";
          containerClass = "right-28 top-1/2 -translate-y-1/2"; // Increased from right-20 to right-28
        }

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.25 + 0.5,
              type: "spring",
              stiffness: 150,
            }}
            className="absolute z-30 flex items-center justify-center group/node"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Premium Icon Circle with 3D effect */}
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="relative w-24 h-24 rounded-full bg-white dark:bg-[#1e2530] border-[5px] border-[#887CFD] flex items-center justify-center shadow-2xl z-20 group-hover/node:shadow-[0_0_40px_rgba(136,124,253,0.5)] transition-all duration-500"
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${config.gradient} opacity-0 group-hover/node:opacity-10 transition-opacity duration-500`}
              />

              {/* Icon */}
              <div className="relative z-10">
                <Icon className="w-10 h-10 text-[#887CFD] group-hover/node:scale-110 transition-transform" />
              </div>

              {/* Animated ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-[#887CFD]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3,
                }}
              />

              {/* Inner glow */}
              <div className="absolute inset-2 rounded-full bg-[#887CFD]/5 group-hover/node:bg-[#887CFD]/10 transition-colors" />
            </motion.div>

            {/* Premium Text Content */}
            <div
              className={`absolute w-[340px] ${containerClass} ${textAlignClass} pointer-events-none`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${index}-${disp?.title || "orig"}`}
                  initial={{ opacity: 0, x: isRight ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 120 }}
                  className="pointer-events-auto"
                >
                  {/* Phase badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${config.gradient} text-white text-xs font-black uppercase tracking-widest mb-4 shadow-lg ${isRight ? "" : "ml-auto"}`}
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    Phase{" "}
                    {["I", "II", "III", "IV", "V", "VI"][index] || index + 1}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 leading-tight drop-shadow-md group-hover/node:text-transparent group-hover/node:bg-clip-text group-hover/node:bg-gradient-to-r from-[#887CFD] to-[#6f63e3] transition-all duration-300">
                    {title}
                  </h3>

                  {/* Description card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`relative p-4 rounded-2xl bg-white/95 dark:bg-[#1a1f26]/95 backdrop-blur-xl border-2 border-gray-100 dark:border-gray-800 shadow-xl group-hover/node:shadow-2xl transition-all duration-500 overflow-hidden mt-3 ${isRight ? "text-left" : "text-right"}`}
                  >
                    {/* Card gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover/node:opacity-5 transition-opacity duration-500`}
                    />

                    {/* Content */}
                    <p className="relative z-10 text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed">
                      {action}
                    </p>

                    {/* Bottom accent */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#887CFD]/50 to-transparent opacity-0 group-hover/node:opacity-100 transition-opacity duration-500" />
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const AiSalesDirectionPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [langMode, setLangMode] = useState("original");
  const [translatedDirections, setTranslatedDirections] = useState([]);

  const { data, isLoading, isError } = useGetAiSalesDirectionQuery(
    { companyId: authUser?.companyId },
    {
      skip: !authUser?.companyId,
      pollingInterval: 0,
    },
  );

  const [translateReport, { isLoading: isTranslating }] =
    useTranslateReportMutation();

  const directions = data?.directions ?? (Array.isArray(data) ? data : []);
  const generatedAt = data?.generatedAt;
  const hasDirections = Array.isArray(directions) && directions.length > 0;

  const handleTranslate = async (targetLang) => {
    if (!hasDirections) return;
    try {
      const results = await Promise.all(
        directions.map(async (dir) => {
          const title = dir?.title ?? "Action";
          const action = dir?.action ?? "";
          const text = `${title}\n${action}`.trim();
          const res = await translateReport({ text, targetLang }).unwrap();
          const translated = res?.translatedText ?? text;
          const [tTitle, ...tActionParts] = translated.split("\n");
          return {
            title: tTitle?.trim() ?? title,
            action: tActionParts.join("\n").trim() || action,
          };
        }),
      );
      setTranslatedDirections(results);
      setLangMode(targetLang);
      const successMsg =
        targetLang === "bn"
          ? t("aiReport.translatedToBengali") || "Translated to Bengali"
          : targetLang === "bn-Latn"
            ? t("aiReport.translatedToMinglish") || "Translated to Minglish"
            : t("aiReport.translatedToEnglish") || "Translated to English";
      toast.success(successMsg);
    } catch (err) {
      toast.error(t("aiReport.translateFailed") || "Translation failed");
    }
  };

  const getDisplayDirection = (idx) =>
    langMode === "original" ? null : translatedDirections[idx];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0d1117] dark:via-[#0d1117] dark:to-[#161b22] p-4 sm:p-6 lg:p-10 overflow-x-hidden relative">
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Premium Header Section */}
      <div className="max-w-5xl mx-auto mb-12 sm:mb-16 text-center relative z-10">
        {/* Hero glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-[#887CFD]/30 via-[#887CFD]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

        {/* Animated logo container */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15 }}
          className="relative inline-flex items-center justify-center p-5 mb-6 rounded-3xl bg-white dark:bg-[#1a1f26] shadow-2xl shadow-[#887CFD]/20 border-4 border-[#887CFD]/20"
        >
          {/* Inner gradient glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#887CFD]/10 to-transparent" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-12 h-12 text-[#887CFD] fill-[#887CFD]/30" />
          </motion.div>

          {/* Orbiting dots */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#887CFD]"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
              style={{
                top: "50%",
                left: "50%",
                transformOrigin: `${30 + i * 10}px 0px`,
              }}
            />
          ))}
        </motion.div>

        {/* Title with gradient */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tight"
        >
          AI Sales{" "}
          <span className="relative inline-block">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#887CFD] via-[#7c6ff5] to-[#6f63e3]">
              Direction
            </span>
            {/* Underline accent */}
            <motion.div
              className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-[#887CFD] to-[#6f63e3] rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg sm:text-xl font-medium leading-relaxed"
        >
          {t("aiSalesDirection.subtitle") ||
            "Data-driven insights and actionable steps to boost your sales performance."}
        </motion.p>

        {/* Decorative elements */}
        <div className="absolute -top-8 left-1/4 w-20 h-20 bg-[#16C8C7]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 right-1/4 w-32 h-32 bg-[#887CFD]/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl lg:max-w-[1400px] mx-auto relative z-10">
        {/* Premium Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-6 mb-10 bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-xl p-6 rounded-3xl border-2 border-gray-100 dark:border-gray-800 shadow-2xl max-w-3xl mx-auto relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#887CFD]/5 via-transparent to-[#16C8C7]/5 pointer-events-none" />

          {/* Status indicator */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-[#16C8C7] animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-[#16C8C7] animate-ping" />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                {generatedAt ? (
                  <>
                    Updated{" "}
                    {new Date(generatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </>
                ) : (
                  "Live Analysis"
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Real-time insights
              </p>
            </div>
          </div>

          {/* Language buttons */}
          <div className="flex gap-3 relative z-10">
            {[
              { code: "bn", label: "বাংলা", icon: "🇧🇩" },
              { code: "bn-Latn", label: "Minglish", icon: "🔤" },
              { code: "en", label: "English", icon: "🇬🇧" },
            ].map(({ code, label, icon }) => (
              <motion.button
                key={code}
                onClick={() => handleTranslate(code)}
                disabled={isTranslating || langMode === code || !hasDirections}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-5 py-3 rounded-2xl transition-all flex items-center gap-2.5 text-sm font-black overflow-hidden ${
                  langMode === code
                    ? "bg-gradient-to-r from-[#887CFD] to-[#6f63e3] text-white shadow-xl shadow-[#887CFD]/40 border-2 border-[#887CFD]"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-transparent"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {langMode === code && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <span className="text-lg">{icon}</span>
                <span className="relative z-10">{label}</span>
                {langMode === code && (
                  <CheckCircle2 className="w-4 h-4 relative z-10" />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-10 animate-pulse max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-8 rounded-xl bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700 w-3/4" />
                  <div className="h-32 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 border-2 border-red-100 dark:border-red-900/30 max-w-3xl mx-auto relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMzksMzIsNjAsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="relative z-10">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-red-700 dark:text-red-400 mb-2">
                Failed to Load Insights
              </h3>
              <p className="text-red-600/80 dark:text-red-400/80 text-lg">
                Please try again later or contact support.
              </p>
            </div>
          </motion.div>
        ) : !hasDirections ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 max-w-3xl mx-auto"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Sparkles className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-700 dark:text-gray-300 mb-3">
              No Insights Available
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Sales directions will appear here once data is analyzed.
            </p>
          </motion.div>
        ) : (
          <div className="relative pb-16">
            {/* Mobile Timeline */}
            <div className="block lg:hidden space-y-4 max-w-3xl mx-auto">
              {directions.map((dir, idx) => {
                const disp = getDisplayDirection(idx);
                const direction =
                  typeof dir === "object" && dir !== null
                    ? dir
                    : {
                        title: "Action Step",
                        action: String(dir),
                        priority: "medium",
                      };

                return (
                  <TimelineItem
                    key={idx}
                    direction={direction}
                    index={idx}
                    total={directions.length}
                    displayTitle={disp?.title}
                    displayAction={disp?.action}
                  />
                );
              })}
            </div>

            {/* Desktop Circular View */}
            <div className="hidden lg:block">
              <CircularStrategyMap
                directions={directions}
                getDisplayDirection={getDisplayDirection}
              />
            </div>

            {/* Completion Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: directions.length * 0.15 + 0.8 }}
              className="mt-12 text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 border-2 border-green-100 dark:border-green-900/30 text-base font-black shadow-xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
                <CheckCircle2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10">
                  All Strategic Insights Loaded
                </span>
                <Award className="w-5 h-5 relative z-10" />
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSalesDirectionPage;
