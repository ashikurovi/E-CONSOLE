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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Premium Brand Color
const BRAND_COLOR = "#887CFD";

const priorityConfig = {
  high: {
    icon: AlertCircle,
    color: "#EF4444", // Red
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    gradient: "from-red-500 to-rose-600",
  },
  medium: {
    icon: Target,
    color: "#887CFD", // Brand Primary
    bg: "bg-[#887CFD]/10",
    border: "border-[#887CFD]/20",
    gradient: "from-[#887CFD] to-[#6f63e3]",
  },
  low: {
    icon: Minus,
    color: "#16C8C7", // Teal
    bg: "bg-[#16C8C7]/10",
    border: "border-[#16C8C7]/20",
    gradient: "from-[#16C8C7] to-[#0e8a89]",
  },
  info: {
    icon: Lightbulb,
    color: "#3B82F6", // Blue
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    gradient: "from-blue-500 to-indigo-600",
  },
};

// --- Mobile/List View Component ---
const TimelineItem = ({
  direction,
  index,
  total,
  displayTitle,
  displayAction,
}) => {
  const priority = (direction?.priority || "medium").toLowerCase();
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 sm:pl-12 py-2 group"
    >
      {/* Connector Line */}
      {!isLast && (
        <div
          className="absolute left-[15px] sm:left-[23px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-[#887CFD]/50 to-transparent border-l border-dashed border-[#887CFD]/30"
          style={{ height: "calc(100% + 16px)" }}
        />
      )}

      {/* Node / Dot */}
      <div className="absolute left-0 sm:left-2 top-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1a1f26] border-2 border-[#887CFD] flex items-center justify-center z-10 shadow-[0_0_15px_rgba(136,124,253,0.3)] group-hover:scale-110 transition-transform duration-300">
        <span className="text-xs sm:text-sm font-bold text-[#887CFD]">
          {index + 1}
        </span>
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.01, x: 5 }}
        className={`relative overflow-hidden rounded-2xl bg-white dark:bg-[#1e2530] border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 group/card ${config.border}`}
      >
        {/* Glass Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Accent Top Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-80`}
        />

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Icon Box */}
          <div
            className={`p-3 rounded-xl ${config.bg} backdrop-blur-sm shrink-0`}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover/card:text-[#887CFD] transition-colors">
                {displayTitle ?? direction?.title ?? "Recommendation"}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.border}`}
                style={{ color: config.color }}
              >
                {priority.toUpperCase()}
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {displayAction ?? direction?.action ?? "—"}
            </p>

            {/* Action Footer (Optional) */}
            <div className="pt-2 flex items-center text-xs font-medium text-gray-400 dark:text-gray-500 gap-1 group-hover/card:text-[#887CFD] transition-colors cursor-pointer w-fit">
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover/card:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Desktop/Circular View Component ---
const CircularStrategyMap = ({ directions, getDisplayDirection }) => {
  const total = directions.length;
  const center = 400;
  const radiusMain = 160; // Reduced to fit text
  const radiusOuter = 250; // Reduced to fit text

  // Helper to calculate position
  const getPos = (angleDeg, r) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + Math.cos(angleRad) * r,
      y: center + Math.sin(angleRad) * r,
    };
  };

  // Helper for SVG Arc
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
          delay: i * 0.2,
          type: "spring",
          duration: 1.5,
          bounce: 0,
        },
        opacity: { delay: i * 0.2, duration: 0.01 },
      },
    }),
  };

  return (
    <div className="relative w-[800px] h-[800px] mx-auto flex items-center justify-center my-8 select-none scale-75 lg:scale-90 xl:scale-100 transition-transform">
      {/* SVG Layer for Rings and Connectors */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="5"
            refY="5"
            markerWidth="4"
            markerHeight="4"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#887CFD" />
          </marker>
        </defs>

        {/* Inner Dashed Ring */}
        <motion.circle
          cx={center}
          cy={center}
          r={140}
          fill="none"
          stroke="#887CFD"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1, rotate: 360 }}
          transition={{
            opacity: { duration: 1 },
            scale: { duration: 1 },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
        />

        {/* Segments & Connectors */}
        {directions.map((_, index) => {
          // Distribute evenly starting from -90 (Top)
          const angleStep = 360 / total;
          const startAngle = index * angleStep - 90;
          const endAngle = startAngle + angleStep - 20; // Gap for arrow

          // Main Ring Segment
          const arcPath = describeArc(
            center,
            center,
            radiusMain,
            startAngle + 5,
            endAngle,
          );

          // Connector Line Position
          const nodeAngle = startAngle + angleStep / 2;
          const ringPos = getPos(nodeAngle, radiusMain);
          const outerPos = getPos(nodeAngle, radiusOuter);

          return (
            <g key={index}>
              {/* Thick Ring Segment */}
              <motion.path
                d={arcPath}
                fill="none"
                stroke="#887CFD"
                strokeWidth="6"
                markerEnd="url(#arrow)"
                className="opacity-80"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              {/* Connector Line: Ring -> Outer */}
              <motion.line
                x1={ringPos.x}
                y1={ringPos.y}
                x2={outerPos.x}
                y2={outerPos.y}
                stroke="#887CFD"
                strokeWidth="4"
                custom={index}
                variants={drawVariant}
                initial="hidden"
                animate="visible"
              />

              {/* Small Circle on Ring */}
              <motion.circle
                cx={ringPos.x}
                cy={ringPos.y}
                r="6"
                fill="white"
                stroke="#887CFD"
                strokeWidth="3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5 }}
              />
            </g>
          );
        })}
      </svg>

      {/* Central Hub */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute z-20 flex flex-col items-center justify-center w-56 h-56 rounded-full bg-white dark:bg-[#1a1f26] shadow-[0_0_60px_rgba(136,124,253,0.25)] border-[8px] border-white dark:border-gray-800"
      >
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-1">
            AI Sales Direction
          </h2>
          <p className="text-sm font-bold text-[#887CFD] uppercase tracking-wider">
            Design & Prototyping
          </p>
        </div>
        {/* Inner faint ring inside hub */}
        <div className="absolute inset-2 rounded-full border border-gray-100 dark:border-gray-700 pointer-events-none" />
      </motion.div>

      {/* Orbiting Nodes & Text */}
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

        // Determine text alignment based on quadrant
        const normAngle = (nodeAngle + 360) % 360;
        const isRight = normAngle > 270 || normAngle < 90;

        // Alignment classes - Pushed further out (left-16/right-16)
        let textAlignClass = "text-left";
        let containerClass = "left-16 top-1/2 -translate-y-1/2";

        if (!isRight) {
          textAlignClass = "text-right";
          containerClass = "right-16 top-1/2 -translate-y-1/2";
        }

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
            className="absolute z-30 flex items-center justify-center"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Outer Icon Circle */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className={`relative w-20 h-20 rounded-full bg-white dark:bg-[#1e2530] border-4 border-[#887CFD] flex items-center justify-center shadow-xl z-20 group transition-colors duration-300`}
            >
              <div className="absolute inset-0 rounded-full bg-[#887CFD]/5 group-hover:bg-[#887CFD]/10 transition-colors" />
              <Icon className="w-9 h-9 text-[#887CFD]" />

              {/* Pulse effect */}
              <div className="absolute inset-0 rounded-full border border-[#887CFD]/30 animate-ping opacity-20" />
            </motion.div>

            {/* Text Content */}
            <div
              className={`absolute w-72 ${containerClass} ${textAlignClass} pointer-events-none`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${index}-${disp?.title || "orig"}`} // Trigger animation on language change
                  initial={{ opacity: 0, x: isRight ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
                  className="pointer-events-auto"
                >
                  <div
                    className={`text-xs font-bold text-[#887CFD] uppercase tracking-widest mb-2 flex items-center gap-2 ${isRight ? "justify-start" : "justify-end"}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#887CFD]" />
                    Phase{" "}
                    {["I", "II", "III", "IV", "V", "VI"][index] || index + 1}
                  </div>

                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight drop-shadow-sm">
                    {title}
                  </h3>

                  <div
                    className={`p-3 rounded-xl bg-white/80 dark:bg-[#1a1f26]/80 backdrop-blur-md border border-gray-100 dark:border-gray-800 shadow-sm ${isRight ? "text-left" : "text-right"}`}
                  >
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                      {action}
                    </p>
                  </div>
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
  const [langMode, setLangMode] = useState("original"); // "original" | "bn" | "bn-Latn" | "en"
  const [translatedDirections, setTranslatedDirections] = useState([]);

  // Use the existing API hook
  const { data, isLoading, isError } = useGetAiSalesDirectionQuery(
    { companyId: authUser?.companyId },
    {
      skip: !authUser?.companyId,
      pollingInterval: 0, // Disable polling unless necessary for "live" feel
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0d1117] p-4 sm:p-6 lg:p-8 overflow-x-hidden">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8 sm:mb-12 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#887CFD]/20 blur-[60px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-white dark:bg-[#1a1f26] shadow-lg shadow-[#887CFD]/10 border border-[#887CFD]/20"
        >
          <Sparkles className="w-8 h-8 text-[#887CFD] fill-[#887CFD]/20" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3"
        >
          AI Sales{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#887CFD] to-[#6f63e3]">
            Direction
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto text-lg"
        >
          {t("aiSalesDirection.subtitle") ||
            "Data-driven insights and actionable steps to boost your sales performance."}
        </motion.p>
      </div>

      <div className="max-w-3xl lg:max-w-[1400px] mx-auto">
        {/* Controls & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white dark:bg-[#1a1f26] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#16C8C7] animate-pulse" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
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
          </div>

          <div className="flex gap-2">
            {[
              { code: "bn", label: "বাংলা" },
              { code: "bn-Latn", label: "Minglish" },
              { code: "en", label: "English" },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => handleTranslate(code)}
                disabled={isTranslating || langMode === code || !hasDirections}
                className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${
                  langMode === code
                    ? "bg-[#887CFD] text-white shadow-lg shadow-[#887CFD]/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                } disabled:opacity-50`}
                title={`Translate to ${label}`}
              >
                <Languages className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-8 animate-pulse max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 shrink-0" />
                <div className="flex-1 h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 max-w-3xl mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
              Failed to load insights
            </h3>
            <p className="text-red-600/80 dark:text-red-400/80">
              Please try again later.
            </p>
          </div>
        ) : !hasDirections ? (
          <div className="text-center py-12 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">
              No sales directions available at the moment.
            </p>
          </div>
        ) : (
          <div className="relative pb-12">
            {/* Mobile View: Vertical Timeline */}
            <div className="block lg:hidden space-y-2 max-w-3xl mx-auto">
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

            {/* Desktop View: Circular Map */}
            <div className="hidden lg:block">
              <CircularStrategyMap
                directions={directions}
                getDisplayDirection={getDisplayDirection}
              />
            </div>

            {/* Completion Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: directions.length * 0.1 + 0.5 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4" />
                All insights loaded
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSalesDirectionPage;
