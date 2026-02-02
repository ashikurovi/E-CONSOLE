import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiLiveMessagesQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import {
  MessageSquare,
  TrendingUp,
  Lightbulb,
  Zap,
  Info,
  Languages,
  Filter,
  Github,
  Slack,
  CheckCircle2,
  GitCommit,
  GitPullRequest,
  ExternalLink,
  Bot,
  User,
  Activity,
  ShoppingCart,
  UserPlus,
  CreditCard,
  AlertTriangle,
  FileText,
  Mail,
  Calendar,
  Shield,
  Sparkles,
  DollarSign,
  Package,
  Bell,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

// --- API Data Integration ---
// We strictly use API data here.

const TimelineItem = ({ item, isLast, primaryColor }) => {
  const getIcon = () => {
    switch (item.type) {
      // Development & Tools
      case "slack":
      case "slack_reaction":
        return <Slack className="w-4 h-4 text-white" />;
      case "github_commit":
      case "github_pr":
        return <Github className="w-4 h-4 text-white" />;

      // Business & Sales
      case "sales":
      case "revenue":
        return <TrendingUp className="w-4 h-4 text-white" />;
      case "order":
      case "purchase":
        return <ShoppingCart className="w-4 h-4 text-white" />;
      case "payment":
        return <CreditCard className="w-4 h-4 text-white" />;
      case "refund":
        return <DollarSign className="w-4 h-4 text-white" />;
      case "product":
        return <Package className="w-4 h-4 text-white" />;

      // Users & Customers
      case "customer":
      case "user_signup":
        return <UserPlus className="w-4 h-4 text-white" />;
      case "user_update":
        return <User className="w-4 h-4 text-white" />;

      // Communication & Alerts
      case "email":
        return <Mail className="w-4 h-4 text-white" />;
      case "meeting":
      case "calendar":
        return <Calendar className="w-4 h-4 text-white" />;
      case "alert":
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-white" />;
      case "notification":
        return <Bell className="w-4 h-4 text-white" />;

      // System & AI
      case "insight":
        return <Lightbulb className="w-4 h-4 text-white" />;
      case "action":
        return <Zap className="w-4 h-4 text-white" />;
      case "security":
        return <Shield className="w-4 h-4 text-white" />;
      case "file":
      case "document":
        return <FileText className="w-4 h-4 text-white" />;
      case "success":
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-white" />;

      default:
        // Default to a generic "sparkle" for AI or general activity
        return <Sparkles className="w-4 h-4 text-white" />;
    }
  };

  const getIconBg = () => {
    switch (item.type) {
      // Brands
      case "slack":
      case "slack_reaction":
        return "bg-gradient-to-br from-[#4A154B] to-[#611f69] text-white";
      case "github_commit":
      case "github_pr":
        return "bg-gradient-to-br from-[#24292F] to-[#424a53] text-white";

      // Success / Growth (Teal/Green)
      case "sales":
      case "revenue":
      case "success":
      case "completed":
        return "bg-gradient-to-br from-[#16C8C7] to-[#0e8a89] text-white";

      // Primary / Insight (Purple/Indigo)
      case "insight":
      case "product":
      case "meeting":
      case "calendar":
      case "email":
        return "bg-gradient-to-br from-[#887CFD] to-[#6f63e3] text-white";

      // Action / Warning (Amber/Orange)
      case "action":
      case "alert":
      case "warning":
      case "refund":
        return "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white";

      // Info / Neutral (Blue)
      case "customer":
      case "user_signup":
      case "user_update":
      case "file":
      case "document":
        return "bg-gradient-to-br from-[#3B82F6] to-[#2563EB] text-white";

      // Critical / Security (Red)
      case "security":
      case "error":
        return "bg-gradient-to-br from-[#EF4444] to-[#DC2626] text-white";

      // Commerce (Pink/Rose)
      case "order":
      case "purchase":
      case "payment":
        return "bg-gradient-to-br from-[#EC4899] to-[#DB2777] text-white";

      default:
        // Default Gradient
        return "bg-gradient-to-br from-[#887CFD] to-[#16C8C7] text-white";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative flex gap-6 pb-12 last:pb-0 group"
    >
      {/* Vertical Line with Gradient */}
      {!isLast && (
        <div className="absolute left-[28px] top-12 bottom-0 w-[2px] bg-gradient-to-b from-gray-100 via-gray-200 to-transparent dark:from-gray-800 dark:via-gray-800/50" />
      )}

      {/* Icon with Premium Shadow */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-none ring-4 ring-white dark:ring-[#0b0f14] ${getIconBg()} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          {React.cloneElement(getIcon(), { className: "w-6 h-6" })}
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.user}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-800"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-800">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-gray-900 dark:text-white text-base hover:text-[#887CFD] transition-colors cursor-pointer">
                    {item.user}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {item.action}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span className="font-medium">{item.time}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                  {item.target && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-[#887CFD] bg-[#887CFD]/10 px-2 py-0.5 rounded-full">
                        {item.target}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button className="text-gray-400 hover:text-[#887CFD] transition-colors p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Message Content */}
          {item.content && (
            <div className="pl-[52px]">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800/50 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AiLiveFeedPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [langMode, setLangMode] = useState("original");
  const [translatedTexts, setTranslatedTexts] = useState({});

  const { data, isLoading, isError } = useGetAiLiveMessagesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId, pollingInterval: 5000 },
  );

  const [translateReport, { isLoading: isTranslating }] =
    useTranslateReportMutation();

  // Process API data into Timeline format
  // If API data is present, we map it. Otherwise, for design demo, we might show mock data if empty?
  // Ideally, we should show "No Data" if API is empty.
  // For this task, I will prioritize showing the API data if available, mapped to the new look.

  const rawMessages = data?.messages ?? (Array.isArray(data) ? data : []);

  const formattedMessages = rawMessages.map((msg, idx) => {
    const isObj = typeof msg === "object" && msg !== null;
    const timestamp =
      isObj && msg.timestamp ? new Date(msg.timestamp) : new Date();
    const timeStr = timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const dateStr = timestamp
      .toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();

    return {
      id: idx,
      type: isObj ? msg.type : "info",
      user: isObj && msg.user ? msg.user : "AI Assistant", // Fallback user
      action: isObj && msg.action ? msg.action : "generated a new insight",
      target: isObj && msg.category ? `#${msg.category}` : null,
      time: timeStr,
      date: dateStr,
      content:
        langMode === "original"
          ? isObj
            ? msg.text
            : String(msg)
          : translatedTexts[idx],
      avatar: null, // Use default icon
    };
  });

  // Group by Date
  const groupedMessages = formattedMessages.reduce((groups, msg) => {
    const date = msg.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(msg);
    return groups;
  }, {});

  // Translation Logic
  const handleTranslate = async (targetLang) => {
    if (!formattedMessages.length) return;
    try {
      const texts = formattedMessages.map((m) => m.content); // Note: this might need adjustment if content is already translated
      // In a real app, always translate from SOURCE. Here we simplify.
      const sourceTexts = rawMessages.map((m) =>
        typeof m === "object" && m?.text ? m.text : String(m ?? ""),
      );

      const results = await Promise.all(
        sourceTexts.map((text) =>
          translateReport({ text, targetLang }).then(
            (r) => r.data?.translatedText ?? text,
          ),
        ),
      );
      const map = {};
      results.forEach((txt, i) => {
        map[i] = txt;
      });
      setTranslatedTexts(map);
      setLangMode(targetLang);
      toast.success(
        t("aiReport.translatedSuccess") || "Translated successfully",
      );
    } catch (err) {
      toast.error(t("aiReport.translateFailed") || "Translation failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b0f14] font-sans">
      {/* Header Background Gradient */}
      <div className="h-64 bg-gradient-to-b from-white to-[#F9FAFB] dark:from-[#1a1f26] dark:to-[#0b0f14] absolute top-0 left-0 right-0 pointer-events-none" />

      <div className="relative max-w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
              Latest activity
              <span className="relative inline-flex items-center justify-center h-6 px-3 rounded-full text-xs font-bold bg-gradient-to-r from-[#887CFD] to-[#16C8C7] text-white shadow-lg shadow-[#887CFD]/20">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
                Live
              </span>
            </h1>
            <p className="text-gray-500 mt-2 text-lg max-w-2xl">
              Real-time updates across your workspace, powered by AI insights.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {/* Translation Controls */}
            <div className="flex bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 shadow-sm">
              {["original", "bn", "en"].map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    mode === "original"
                      ? setLangMode("original")
                      : handleTranslate(mode)
                  }
                  disabled={isTranslating}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    (mode === "original" && langMode === "original") ||
                    langMode === mode
                      ? "bg-gradient-to-r from-[#887CFD] to-[#16C8C7] text-white shadow-md"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {mode === "original"
                    ? "Original"
                    : mode === "bn"
                      ? "বাংলা"
                      : "English"}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              className="gap-2 h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-[#887CFD] hover:text-[#887CFD] transition-all bg-white dark:bg-[#1a1f26] shadow-sm"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Main Content Area - Full Width Grid/List */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Feed Column */}
          <div className="bg-transparent min-h-[500px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-96 gap-4 text-gray-400 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-8 h-8 border-2 border-[#887CFD] border-t-transparent rounded-full animate-spin" />
                <p>Loading activity feed...</p>
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center h-96 gap-4 text-red-400 bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800">
                <Activity className="w-8 h-8 opacity-50" />
                <p>Failed to load live feed.</p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="space-y-8">
                {formattedMessages.length === 0 ? (
                  <div className="text-center py-20 bg-white dark:bg-[#1a1f26] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      New messages and insights will appear here automatically.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date} className="relative">
                      <div className="sticky top-4 z-20 mb-6">
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-[#1a1f26] border border-gray-200 dark:border-gray-700 text-gray-500 shadow-sm uppercase tracking-wider backdrop-blur-md bg-opacity-80">
                          {date}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {msgs.map((msg, idx) => (
                          <TimelineItem
                            key={idx}
                            item={msg}
                            isLast={idx === msgs.length - 1}
                            primaryColor="#887CFD"
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sidebar / Stats Column (Optional "Real Application" feel) */}
          <div className="hidden lg:block space-y-6">
            <div className="bg-white dark:bg-[#1a1f26] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Feed Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#887CFD]/10 flex items-center justify-center text-[#887CFD]">
                      <Zap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Activity
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formattedMessages.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#16C8C7]/10 flex items-center justify-center text-[#16C8C7]">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Users
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Active
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 leading-relaxed">
                  Live feed updates automatically every 5 seconds. Filters apply
                  to all incoming data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiLiveFeedPage;
