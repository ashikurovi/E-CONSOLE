import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiSalesDirectionQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import { Target, AlertCircle, Minus, ChevronRight, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

const priorityConfig = {
  high: {
    icon: AlertCircle,
    bg: "bg-rose-50 dark:bg-rose-900/15",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    badge: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200/50 dark:border-rose-800/50",
  },
  medium: {
    icon: Target,
    bg: "bg-amber-50 dark:bg-amber-900/15",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200/50 dark:border-amber-800/50",
  },
  low: {
    icon: Minus,
    bg: "bg-gray-50 dark:bg-gray-800/50",
    iconBg: "bg-gray-100 dark:bg-gray-800",
    iconColor: "text-gray-600 dark:text-gray-400",
    badge: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200/50 dark:border-gray-700/50",
  },
  info: {
    icon: ChevronRight,
    bg: "bg-blue-50 dark:bg-blue-900/15",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200/50 dark:border-blue-800/50",
  },
};

const DirectionCard = ({ direction, index, displayTitle, displayAction }) => {
  const priority = (direction?.priority || "medium").toLowerCase();
  const config = priorityConfig[priority] || priorityConfig.medium;
  const Icon = config.icon;

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
                {displayTitle ?? direction?.title ?? "Action"}
              </span>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.iconBg} ${config.badge}`}
              >
                {priority}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
              {displayAction ?? direction?.action ?? "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AiSalesDirectionPage = () => {
  const { t } = useTranslation();
  const authUser = useSelector((state) => state.auth.user);
  const [langMode, setLangMode] = useState("original"); // "original" | "bn" | "bn-Latn" | "en"
  const [translatedDirections, setTranslatedDirections] = useState([]);

  const { data, isLoading, isError } = useGetAiSalesDirectionQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const [translateReport, { isLoading: isTranslating }] = useTranslateReportMutation();

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
        })
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
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">
            {t("nav.aiSalesDirection") || "AI Sales Direction"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("aiSalesDirection.subtitle") ||
              "AI-powered sales recommendations and direction."}
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
          {t("common.error") || "Failed to load sales direction."}
        </div>
      )}

      {!isLoading && !isError && hasDirections && (
        <>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {generatedAt && (
              <p className="text-xs text-black/50 dark:text-white/50">
                {t("aiSalesDirection.generatedAt") || "Generated"} —{" "}
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
            {directions.map((dir, idx) => {
              const disp = getDisplayDirection(idx);
              const direction =
                typeof dir === "object" && dir !== null
                  ? dir
                  : { title: "Action", action: String(dir), priority: "medium" };
              return (
                <DirectionCard
                  key={idx}
                  direction={direction}
                  index={idx}
                  displayTitle={disp?.title}
                  displayAction={disp?.action}
                />
              );
            })}
          </div>
        </>
      )}

      {!isLoading && !isError && !hasDirections && (
        <div className="py-12 text-center text-black/60 dark:text-white/60">
          {t("aiSalesDirection.noData") || "No sales direction available."}
        </div>
      )}
    </div>
  );
};

export default AiSalesDirectionPage;
