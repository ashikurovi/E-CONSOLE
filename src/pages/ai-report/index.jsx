import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiReportQuery,
  useGetDashboardQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import { Sparkles, FileText, Languages, Download, ChevronDown, ChevronUp, Volume2, Square } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import LineChartComponent from "@/components/charts/line-chart";
import RadialChartComponent from "@/components/charts/radial-chart";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

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
    { skip: !authUser?.companyId }
  );

  const { data: dashboardData } = useGetDashboardQuery(
    { companyId: authUser?.companyId },
    { skip: !authUser?.companyId }
  );

  const [translateReport, { isLoading: isTranslating }] = useTranslateReportMutation();

  const reportText = data?.report ?? (typeof data === "string" ? data : null);
  const generatedAt = data?.generatedAt;
  const hasReport = reportText && reportText.trim().length > 0;

  const displayText =
    reportLang === "original"
      ? reportText
      : translatedText ?? reportText;

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
        text: reportLang === "original" ? reportText : translatedText ?? reportText,
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
      if (reportLang === "en" || reportLang === "original") return reportLang === "en" ? (translatedText ?? reportText) : reportText;
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
      toast.error(t("aiReport.speakNotSupported") || "Text-to-speech is not supported in your browser.");
      return;
    }
    let textToSpeak = getTextForLang(targetLang);
    if (!textToSpeak) {
      try {
        const res = await translateReport({
          text: reportLang === "original" ? reportText : translatedText ?? reportText,
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
        ? (t("aiReport.listeningBengali") || "Listening in Bangla")
        : (t("aiReport.listeningEnglish") || "Listening in English")
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
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
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
        28
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
  const radialChartData = dashboardData?.radialChartData || [{ paid: 0, unpaid: 0 }];
  const paidPercentage = radialChartData[0]?.paid || 0;

  const lineChartConfig = {
    desktop: { label: t("dashboard.incomeGrowth"), color: "hsl(var(--chart-1))" },
  };
  const radialChartConfig = {
    paid: { label: t("dashboard.paid"), color: "hsl(var(--chart-2))" },
    unpaid: { label: t("dashboard.unpaid"), color: "hsl(var(--chart-5))" },
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
        <div>
          <h2 className="text-xl font-semibold">
            {t("nav.aiDailyReport") || "AI Daily Report"}
          </h2>
          <p className="text-sm text-black/60 dark:text-white/60">
            {t("aiReport.subtitle") || "AI-generated daily insights for your store."}
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
          {t("common.error") || "Failed to load AI report."}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t("dashboard.revenue_analytics") || "Revenue Analytics"}
              </h3>
              <div className="h-[280px] w-full">
                <LineChartComponent chartData={lineChartData} chartConfig={lineChartConfig} />
              </div>
            </div>
            <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
            </div>
          </div>

          {/* Report Section */}
          {hasReport && (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {generatedAt && (
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {t("aiReport.generatedAt") || "Generated"} —{" "}
                    {new Date(generatedAt).toLocaleString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 ml-auto">
                  <button
                    onClick={() => handleTranslate("bn")}
                    disabled={isTranslating || reportLang === "bn"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("aiReport.translateToBengali") || "Translate to Bengali"}
                  >
                    <Languages className="h-4 w-4" />
                    {t("aiReport.toBengali") || "বাংলা"}
                  </button>
                  <button
                    onClick={() => handleTranslate("bn-Latn")}
                    disabled={isTranslating || reportLang === "bn-Latn"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("aiReport.translateToMinglish") || "Translate to Minglish"}
                  >
                    <Languages className="h-4 w-4" />
                    {t("aiReport.toMinglish") || "Minglish"}
                  </button>
                  <button
                    onClick={() => handleTranslate("en")}
                    disabled={isTranslating || reportLang === "en"}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 hover:bg-violet-200 dark:hover:bg-violet-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title={t("aiReport.translateToEnglish") || "Translate to English"}
                  >
                    <Languages className="h-4 w-4" />
                    {t("aiReport.toEnglish") || "English"}
                  </button>
                  {isSpeaking ? (
                    <button
                      onClick={handleStopSpeak}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      title={t("aiReport.stopListening") || "Stop"}
                    >
                      <Square className="h-4 w-4" />
                      {t("aiReport.stop") || "Stop"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleSpeak("en")}
                        disabled={isTranslating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t("aiReport.listenEnglish") || "Listen in English"}
                      >
                        <Volume2 className="h-4 w-4" />
                        {t("aiReport.listenEnglish") || "Listen (EN)"}
                      </button>
                      <button
                        onClick={() => handleSpeak("bn")}
                        disabled={isTranslating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={t("aiReport.listenBengali") || "Listen in Bangla"}
                      >
                        <Volume2 className="h-4 w-4" />
                        {t("aiReport.listenBengali") || "Listen (বাংলা)"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                    title={t("aiReport.downloadReport") || "Download Report"}
                  >
                    <Download className="h-4 w-4" />
                    {t("aiReport.download") || "Download"}
                  </button>
                </div>
              </div>

              <Card className="overflow-hidden border border-violet-200/50 dark:border-violet-800/50 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6 bg-gradient-to-br from-violet-50/50 to-transparent dark:from-violet-900/10 dark:to-transparent">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      {paragraphs.length > 0 ? (
                        paragraphs.map((para, idx) => (
                          <p
                            key={idx}
                            className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                          >
                            {para.trim()}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {displayText}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Separate Report Section (Expandable) */}
              <div className="mt-6">
                <button
                  onClick={() => setShowSeparateReport(!showSeparateReport)}
                  className="flex items-center gap-2 w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  {showSeparateReport ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {t("aiReport.separateReport") || "View Full Report"}
                  </span>
                </button>
                {showSeparateReport && (
                  <div className="mt-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
                      {displayText}
                    </pre>
                    <button
                      onClick={handleDownloadReport}
                      className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      {t("aiReport.downloadAsPdf") || "Download as PDF"}
                    </button>
                  </div>
                )}
              </div>
            </>
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
