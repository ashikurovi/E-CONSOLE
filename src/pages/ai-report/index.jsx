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
} from "lucide-react";
import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
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

const SectionHeader = ({ title, subtitle, icon: Icon, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
    <div className="flex items-start gap-3 sm:gap-4">
      {Icon && (
        <div className="p-2.5 sm:p-3 bg-violet-50 dark:bg-violet-500/10 rounded-2xl text-violet-600 dark:text-violet-400">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

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

  const lineChartData = dashboardData?.lineChartData || [];
  const radialChartData = dashboardData?.radialChartData || [
    { paid: 0, unpaid: 0 },
  ];
  const paidPercentage = radialChartData[0]?.paid || 0;

  const lineChartConfig = {
    desktop: {
      label: t("dashboard.incomeGrowth"),
      color: "hsl(var(--chart-1))",
    },
  };
  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "hsl(var(--chart-2))" },
    unpaid: { label: t("dashboard.unpaid"), color: "hsl(var(--chart-5))" },
  };

  return (
    <div className="space-y-4 md:space-y-8 min-h-screen bg-[#F8F9FC] dark:bg-black/10 p-3 sm:p-4 lg:p-10 font-sans text-slate-900 dark:text-slate-100">
      <GlassCard className="p-4 sm:p-8">
        <SectionHeader
          title={t("nav.aiDailyReport") || "AI Daily Report"}
          subtitle={
            t("aiReport.subtitle") ||
            "AI-generated daily insights for your store."
          }
          icon={Sparkles}
        />
      </GlassCard>

      {isLoading && (
        <div className="py-12 text-center text-black/60 dark:text-white/60">
          {t("common.loading") || "Loading..."}
        </div>
      )}

      {isError && (
        <div className="py-12 text-center text-red-500">
          {t("common.error") || "Failed to load AI report."}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
            <GlassCard className="xl:col-span-2 p-4 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                {t("dashboard.revenue_analytics") || "Revenue Analytics"}
              </h3>
              <div className="h-[280px] w-full">
                <LineChartComponent
                  chartData={lineChartData}
                  chartConfig={lineChartConfig}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-8 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                {t("dashboard.order_status") || "Order Status"}
              </h3>
              <div className="flex-1 min-h-[240px] flex items-center justify-center">
                <RadialChartComponent
                  chartData={radialChartData}
                  chartConfig={radialChartConfig}
                  total={`${paidPercentage}%`}
                  name={t("dashboard.paidOrders") || "Paid Orders"}
                />
              </div>
            </GlassCard>
          </div>

          {/* Report Section */}
          {hasReport && (
            <GlassCard className="p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                {generatedAt && (
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {t("aiReport.generatedAt") || "Generated"} —{" "}
                    {new Date(generatedAt).toLocaleString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTranslate("bn")}
                    disabled={isTranslating || reportLang === "bn"}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 sm:flex-none"
                    title={
                      t("aiReport.translateToBengali") || "Translate to Bengali"
                    }
                  >
                    <Languages className="h-4 w-4" />
                    <span className="truncate">
                      {t("aiReport.toBengali") || "বাংলা"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTranslate("bn-Latn")}
                    disabled={isTranslating || reportLang === "bn-Latn"}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 sm:flex-none"
                    title={
                      t("aiReport.translateToMinglish") ||
                      "Translate to Minglish"
                    }
                  >
                    <Languages className="h-4 w-4" />
                    <span className="truncate">
                      {t("aiReport.toMinglish") || "Minglish"}
                    </span>
                  </button>
                  <button
                    onClick={() => handleTranslate("en")}
                    disabled={isTranslating || reportLang === "en"}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 sm:flex-none"
                    title={
                      t("aiReport.translateToEnglish") || "Translate to English"
                    }
                  >
                    <Languages className="h-4 w-4" />
                    <span className="truncate">
                      {t("aiReport.toEnglish") || "English"}
                    </span>
                  </button>
                  {isSpeaking ? (
                    <button
                      onClick={handleStopSpeak}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all flex-1 sm:flex-none"
                      title={t("aiReport.stopListening") || "Stop"}
                    >
                      <Square className="h-4 w-4" />
                      <span className="truncate">
                        {t("aiReport.stop") || "Stop"}
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSpeak("en")}
                        disabled={isTranslating}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 sm:flex-none"
                        title={
                          t("aiReport.listenEnglish") || "Listen in English"
                        }
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="truncate">
                          {t("aiReport.listenEnglish") || "Listen (EN)"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleSpeak("bn")}
                        disabled={isTranslating}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 sm:flex-none"
                        title={
                          t("aiReport.listenBengali") || "Listen in Bangla"
                        }
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="truncate">
                          {t("aiReport.listenBengali") || "Listen (বাংলা)"}
                        </span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all flex-1 sm:flex-none"
                    title={t("aiReport.downloadReport") || "Download Report"}
                  >
                    <Download className="h-4 w-4" />
                    <span className="truncate">
                      {t("aiReport.download") || "Download"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="overflow-hidden border border-violet-100 dark:border-violet-500/10 rounded-2xl bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-500/5 dark:to-transparent p-4 sm:p-8">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div className="hidden sm:block flex-shrink-0 p-3 sm:p-4 rounded-2xl bg-white dark:bg-white/5 text-violet-600 dark:text-violet-400 shadow-sm">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                    {paragraphs.length > 0 ? (
                      paragraphs.map((para, idx) => (
                        <p
                          key={idx}
                          className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium"
                        >
                          {para.trim()}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300 font-medium whitespace-pre-wrap">
                        {displayText}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Separate Report Section (Expandable) */}
              <div className="mt-6 sm:mt-8">
                <button
                  onClick={() => setShowSeparateReport(!showSeparateReport)}
                  className="flex items-center gap-3 w-full py-3 sm:py-4 px-4 sm:px-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all text-left group"
                >
                  {showSeparateReport ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                  )}
                  <span className="font-bold text-sm sm:text-base text-gray-700 dark:text-gray-200">
                    {t("aiReport.separateReport") || "View Full Report"}
                  </span>
                </button>
                {showSeparateReport && (
                  <div className="mt-4 p-4 sm:p-6 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                    <pre className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                      {displayText}
                    </pre>
                    <button
                      onClick={handleDownloadReport}
                      className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all transform hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4" />
                      {t("aiReport.downloadAsPdf") || "Download as PDF"}
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          )}

          {!hasReport && (
            <div className="py-12 text-center text-black/60 dark:text-white/60">
              {t("aiReport.noData") || "No report data available."}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AiReportPage;
