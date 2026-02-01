import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiReportQuery,
  useGetDashboardQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import {
  Sparkles,
  FileText,
  Languages,
  Download,
  ChevronDown,
  ChevronUp,
  Volume2,
  Square,
  Briefcase,
  CheckSquare,
  Hourglass,
  Calendar,
  TrendingUp,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
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
  AreaChart,
  Area,
} from "recharts";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

// --- Sub-Components (Inline for consistent design) ---

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-100 dark:border-white/10 shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-[0_2px_20px_rgb(0,0,0,0.2)] rounded-3xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] ${className}`}
  >
    {children}
  </div>
);

const MetricCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color,
  chartData,
}) => {
  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      fill: "#3b82f6",
      stroke: "#2563eb",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-600 dark:text-emerald-400",
      fill: "#10b981",
      stroke: "#059669",
    },
    red: {
      bg: "bg-rose-50 dark:bg-rose-900/20",
      text: "text-rose-600 dark:text-rose-400",
      fill: "#f43f5e",
      stroke: "#e11d48",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      fill: "#8b5cf6",
      stroke: "#7c3aed",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
      fill: "#f97316",
      stroke: "#ea580c",
    },
  };

  const theme = colors[color] || colors.blue;

  return (
    <GlassCard className="p-6 relative overflow-hidden h-[180px]">
      <div className="flex flex-col h-full justify-between z-10 relative">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${theme.bg}`}>
            <Icon className={`w-5 h-5 ${theme.text}`} />
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </span>
        </div>

        {/* Value */}
        <div className="mt-2">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-auto">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md ${isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30" : "bg-rose-50 text-rose-600 dark:bg-rose-900/30"}`}
          >
            {isPositive ? "↗" : "↘"} {change}
          </span>
          <span className="text-xs text-gray-400">vs last month</span>
        </div>
      </div>

      {/* Chart Background */}
      <div className="absolute bottom-0 right-0 w-[140px] h-[80px] opacity-50 pointer-events-none translate-y-2 translate-x-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id={`gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={theme.fill} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={theme.stroke}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};

const AiReportPage = () => {
  const { t, i18n } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [reportLang, setReportLang] = useState("original"); // "original" | "en" | "bn" | "bn-Latn"
  const [translatedText, setTranslatedText] = useState(null);
  const [showSeparateReport, setShowSeparateReport] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakLang, setSpeakLang] = useState(null); // "en" | "bn" when speaking
  const speechSynthRef = useRef(null);

  const { data, isLoading, isError } = useGetAiReportQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const { data: dashboardData } = useGetDashboardQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId },
  );

  const [translateReport, { isLoading: isTranslating }] =
    useTranslateReportMutation();

  const reportText = data?.report ?? (typeof data === "string" ? data : null);
  const generatedAt = data?.generatedAt;
  const hasReport = reportText && reportText.trim().length > 0;

  const displayText =
    reportLang === "original" ? reportText : (translatedText ?? reportText);

  const paragraphs = displayText
    ? displayText
        .trim()
        .split(/\n\n+/)
        .filter((p) => p.trim())
    : [];

  const handleTranslate = async (targetLang) => {
    if (!reportText?.trim()) return;
    try {
      const res = await translateReport({
        text:
          reportLang === "original"
            ? reportText
            : (translatedText ?? reportText),
        targetLang,
      }).unwrap();
      setTranslatedText(res?.translatedText ?? reportText);
      setReportLang(targetLang);
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

  const getTextForLang = (targetLang) => {
    if (targetLang === "en") {
      if (reportLang === "en" || reportLang === "original")
        return reportLang === "en"
          ? (translatedText ?? reportText)
          : reportText;
      return null;
    }
    if (targetLang === "bn") {
      if (reportLang === "bn") return translatedText ?? reportText;
      return null;
    }
    return null;
  };

  const handleSpeak = async (targetLang) => {
    if (!reportText?.trim()) return;
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error(
        t("aiReport.speakNotSupported") ||
          "Text-to-speech is not supported in your browser.",
      );
      return;
    }
    let textToSpeak = getTextForLang(targetLang);
    if (!textToSpeak) {
      try {
        const res = await translateReport({
          text:
            reportLang === "original"
              ? reportText
              : (translatedText ?? reportText),
          targetLang,
        }).unwrap();
        textToSpeak = res?.translatedText ?? reportText;
        if (targetLang === "bn") {
          setTranslatedText(textToSpeak);
          setReportLang("bn");
        } else if (targetLang === "en") {
          setTranslatedText(textToSpeak);
          setReportLang("en");
        }
      } catch (err) {
        toast.error(t("aiReport.translateFailed") || "Translation failed");
        return;
      }
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === "bn" ? "bn-BD" : "en-US";
    utterance.rate = 0.9;
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakLang(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakLang(null);
      toast.error(t("aiReport.speakFailed") || "Could not play speech.");
    };
    speechSynthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setSpeakLang(targetLang);
    toast.success(
      targetLang === "bn"
        ? t("aiReport.listeningBengali") || "Listening in Bangla"
        : t("aiReport.listeningEnglish") || "Listening in English",
    );
  };

  const handleStopSpeak = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakLang(null);
      toast.success(t("aiReport.speakStopped") || "Stopped");
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleDownloadReport = () => {
    if (!displayText) return;
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;

      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(t("nav.aiDailyReport") || "AI Daily Report", margin, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${t("aiReport.generatedAt") || "Generated"}: ${generatedAt ? new Date(generatedAt).toLocaleString() : new Date().toLocaleString()}`,
        margin,
        28,
      );

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(displayText, maxWidth);
      let y = 40;
      lines.forEach((line) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
      });

      const dateStr = new Date().toISOString().split("T")[0];
      doc.save(`AI_Report_${dateStr}.pdf`);
      toast.success(t("aiReport.downloadSuccess") || "Report downloaded");
    } catch (err) {
      console.error(err);
      toast.error(t("aiReport.downloadFailed") || "Download failed");
    }
  };

  // --- MOCK DATA FOR NEW DESIGN ---
  const productivityColors = [
    "#4F46E5",
    "#818CF8",
    "#60A5FA",
    "#2DD4BF",
    "#FB923C",
  ]; // Dark Purple, Purple, Blue, Teal, Orange

  const productivityData = [
    { day: "S", hours: 0, fill: "#E2E8F0" },
    { day: "M", hours: 4, fill: productivityColors[0] },
    { day: "T", hours: 2, fill: productivityColors[1] },
    { day: "W", hours: 5, fill: productivityColors[2] },
    { day: "T", hours: 3, fill: productivityColors[3] },
    { day: "F", hours: 4.5, fill: productivityColors[4] },
    { day: "S", hours: 0, fill: "#E2E8F0" },
  ];

  // Segmented Gauge Data Generation
  const totalSegments = 24;
  const filledSegments = Math.round((65 / 100) * totalSegments); // Assuming 65% value

  const gaugeData = Array.from({ length: totalSegments }, (_, i) => ({
    name: i < filledSegments ? "Filled" : "Empty",
    value: 1,
    fill: i < filledSegments ? "#84CC16" : "#E2E8F0", // Base colors, will override with gradient logic in render
  }));

  // Sparkline Data for Metric Cards
  const sparklineData1 = [
    { value: 30 },
    { value: 40 },
    { value: 35 },
    { value: 50 },
    { value: 45 },
    { value: 60 },
    { value: 70 },
  ];
  const sparklineData2 = [
    { value: 45 },
    { value: 52 },
    { value: 49 },
    { value: 60 },
    { value: 55 },
    { value: 65 },
    { value: 80 },
  ];
  const sparklineData3 = [
    { value: 70 },
    { value: 65 },
    { value: 60 },
    { value: 50 },
    { value: 55 },
    { value: 45 },
    { value: 40 },
  ];
  const sparklineData4 = [
    { value: 20 },
    { value: 35 },
    { value: 45 },
    { value: 40 },
    { value: 60 },
    { value: 75 },
    { value: 90 },
  ];

  return (
    <div className="space-y-6 min-h-screen bg-[#F8F9FC] dark:bg-black/10 p-4 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hello, {authUser?.name || "SquadCart"}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Here's your daily overview
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Projects"
          value="12"
          change="12.5%"
          isPositive={true}
          icon={Briefcase}
          color="blue"
          chartData={sparklineData1}
        />
        <MetricCard
          title="Completed Tasks"
          value="48"
          change="8.2%"
          isPositive={true}
          icon={CheckSquare}
          color="green"
          chartData={sparklineData2}
        />
        <MetricCard
          title="Focus Hours"
          value="18h"
          change="3.4%"
          isPositive={false}
          icon={Hourglass}
          color="red"
          chartData={sparklineData3}
        />
        <MetricCard
          title="Activity Rate"
          value="86%"
          change="24.2%"
          isPositive={true}
          icon={TrendingUp}
          color="purple"
          chartData={sparklineData4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Trends */}
        <GlassCard className="lg:col-span-2 p-6 sm:p-8 relative">
          <div className="absolute top-8 right-8 text-gray-400 dark:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Productivity Trends
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Daily focus hours
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                18<span className="text-xl font-normal text-gray-500">h</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-gray-500">
                logged this week
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                +12% vs last week
              </span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productivityData}
                margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Define linear gradients for each bar color if needed, or just use solid/pattern */}
                  {productivityColors.map((color, index) => (
                    <linearGradient
                      key={index}
                      id={`grad-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.02)", radius: 8 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    padding: "12px",
                  }}
                />
                <Bar dataKey="hours" radius={[12, 12, 12, 12]} barSize={40}>
                  {productivityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.hours > 0
                          ? productivityColors[index - 1]
                            ? `url(#grad-${index - 1})`
                            : entry.fill
                          : entry.fill
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Work-Life Balance */}
        <GlassCard className="p-6 sm:p-8 flex flex-col relative">
          <div className="flex items-center justify-between w-full mb-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Work-Life Balance
              </h3>
            </div>
            <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />
          </div>

          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient
                    id="gaugeGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#84CC16" stopOpacity={1} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="85%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={120}
                  outerRadius={160}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.name === "Filled"
                          ? "url(#gaugeGradient)"
                          : "#F1F5F9"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Text for Gauge */}
            <div className="absolute inset-x-0 bottom-[40px] flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                65%
              </span>
              <span className="text-sm text-gray-500 mt-1">Balance Score</span>
            </div>
          </div>

          {/* Legend/Info */}
          <div className="flex justify-around w-full mt-2">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                1,245
              </span>
              <div className="flex items-center text-xs text-green-500 font-medium bg-green-50 px-2 py-1 rounded-full mt-1">
                <ArrowUpRight size={12} className="mr-1" />
                +4.2%
              </div>
              <span className="text-xs text-gray-400 mt-1">Work Hours</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                856
              </span>
              <div className="flex items-center text-xs text-orange-500 font-medium bg-orange-50 px-2 py-1 rounded-full mt-1">
                <ArrowUpRight size={12} className="mr-1" />
                +1.2%
              </div>
              <span className="text-xs text-gray-400 mt-1">Personal Time</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI Insights Section (Preserving functionality) */}
      <div className="grid grid-cols-1">
        <GlassCard className="p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          {/* Decorative background effects - subtle gradient for premium feel */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl backdrop-blur-md">
                <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                AI Insights
              </h2>
            </div>

            {isLoading && (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {t("common.loading") || "Loading..."}
              </div>
            )}

            {isError && (
              <div className="py-12 text-center text-rose-500 dark:text-rose-400">
                {t("common.error") || "Failed to load AI report."}
              </div>
            )}

            {!isLoading && !isError && hasReport && (
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((para, idx) => (
                      <p key={idx} className="text-lg leading-relaxed">
                        {para.trim()}
                      </p>
                    ))
                  ) : (
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
                      {displayText}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-white/10">
                  <button
                    onClick={() => handleTranslate("bn")}
                    disabled={isTranslating || reportLang === "bn"}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Translate to Bangla
                  </button>
                  <button
                    onClick={() => handleTranslate("en")}
                    disabled={isTranslating || reportLang === "en"}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-gray-900 dark:text-white transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    Translate to English
                  </button>

                  {isSpeaking ? (
                    <button
                      onClick={handleStopSpeak}
                      className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" /> Stop Speaking
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSpeak("en")}
                      className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" /> Listen
                    </button>
                  )}

                  <button
                    onClick={handleDownloadReport}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors text-sm font-medium flex items-center gap-2 ml-auto"
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AiReportPage;
