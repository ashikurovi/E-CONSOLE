import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiLiveMessagesQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import { MessageSquare, TrendingUp, Lightbulb, Zap, Info, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

const typeConfig = {
  sales: {
    icon: TrendingUp,
    bg: "bg-emerald-50 dark:bg-emerald-900/15",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
  },
  insight: {
    icon: Lightbulb,
    bg: "bg-blue-50 dark:bg-blue-900/15",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/50 dark:border-blue-800/50",
  },
  action: {
    icon: Zap,
    bg: "bg-amber-50 dark:bg-amber-900/15",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200/50 dark:border-amber-800/50",
  },
  info: {
    icon: Info,
    bg: "bg-gray-50 dark:bg-gray-800/50",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    badge: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200/50 dark:border-gray-700/50",
  },
};

const MessageCard = ({ message, index, displayText }) => {
  const config = typeConfig[message?.type] || typeConfig.info;
  const Icon = config.icon;

  const formattedTime = message?.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Card
      className={`overflow-hidden border ${config.border} shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      <CardContent className={`p-4 ${config.bg}`}>
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 p-2.5 rounded-xl ${config.iconBg} ${config.iconColor} transition-transform group-hover:scale-105`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${config.badge}`}
              >
                {message?.type || "info"}
              </span>
              {formattedTime && (
                <span className="text-xs text-black/50 dark:text-white/50">
                  {formattedTime}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
              {displayText ?? message?.text ?? "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AiLiveFeedPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [langMode, setLangMode] = useState("original"); // "original" | "bn" | "bn-Latn" | "en"
  const [translatedTexts, setTranslatedTexts] = useState({});

  const { data, isLoading, isError } = useGetAiLiveMessagesQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const [translateReport, { isLoading: isTranslating }] = useTranslateReportMutation();

  const messages = data?.messages ?? (Array.isArray(data) ? data : []);
  const generatedAt = data?.generatedAt;
  const hasMessages = Array.isArray(messages) && messages.length > 0;

  const getDisplayText = (idx) =>
    langMode === "original" ? undefined : translatedTexts[idx];

  const getSourceText = (idx) => {
    const m = messages[idx];
    const orig = typeof m === "object" && m?.text ? m.text : String(m ?? "");
    return getDisplayText(idx) ?? orig;
  };

  const handleTranslate = async (targetLang) => {
    if (!hasMessages) return;
    try {
      const texts = messages.map((_, idx) => getSourceText(idx));
      const results = await Promise.all(
        texts.map((text) =>
          translateReport({ text, targetLang }).then((r) => r.data?.translatedText ?? text)
        )
      );
      const map = {};
      results.forEach((txt, i) => {
        map[i] = txt;
      });
      setTranslatedTexts(map);
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

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">
            {t("nav.aiLiveFeed") || "AI Live Feed"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("aiLiveFeed.subtitle") ||
              "Real-time AI insights and activity feed."}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="py-12 text-center text-black/60 dark:text-white/60">
          {t("common.loading") || "Loading..."}
        </div>
      )}

      {isError && (
        <div className="py-12 text-center text-red-500">
          {t("common.error") || "Failed to load live feed."}
        </div>
      )}

      {!isLoading && !isError && hasMessages && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {generatedAt && (
              <p className="text-xs text-black/50 dark:text-white/50">
                {t("aiLiveFeed.generatedAt") || "Generated"} —{" "}
                {new Date(generatedAt).toLocaleString()}
              </p>
            )}
            <div className="flex flex-wrap gap-2 ml-auto">
              <button
                onClick={() => handleTranslate("bn")}
                disabled={isTranslating || langMode === "bn"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t("aiReport.translateToBengali") || "Translate to Bengali"}
              >
                <Languages className="h-4 w-4" />
                {t("aiReport.toBengali") || "বাংলা"}
              </button>
              <button
                onClick={() => handleTranslate("bn-Latn")}
                disabled={isTranslating || langMode === "bn-Latn"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t("aiReport.translateToMinglish") || "Translate to Minglish"}
              >
                <Languages className="h-4 w-4" />
                {t("aiReport.toMinglish") || "Minglish"}
              </button>
              <button
                onClick={() => handleTranslate("en")}
                disabled={isTranslating || langMode === "en"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={t("aiReport.translateToEnglish") || "Translate to English"}
              >
                <Languages className="h-4 w-4" />
                {t("aiReport.toEnglish") || "English"}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {messages.map((msg, idx) => (
              <MessageCard
                key={idx}
                message={
                  typeof msg === "object" && msg !== null
                    ? msg
                    : { text: String(msg), type: "info", timestamp: null }
                }
                index={idx}
                displayText={getDisplayText(idx)}
              />
            ))}
          </div>
        </>
      )}

      {!isLoading && !isError && !hasMessages && (
          <div className="py-12 text-center text-black/60 dark:text-white/60">
            {t("aiLiveFeed.noData") || "No live messages yet."}
          </div>
        )}
    </div>
  );
};

export default AiLiveFeedPage;
