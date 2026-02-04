import React from "react";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// -----------------------------------------------------------------------------
// LiveFeedHeader section: page title, live badge, language switcher, filter
// Kept in one file with sub-components to meet ~150 lines per section.
// -----------------------------------------------------------------------------

/**
 * Language mode options for the feed (original, bn, en).
 */
const LANGUAGE_OPTIONS = [
  { key: "original", labelKey: "aiLiveFeed.original" },
  { key: "bn", labelKey: "aiLiveFeed.bangla" },
  { key: "en", labelKey: "aiLiveFeed.english" },
];

/**
 * Animated "Live" badge shown next to the page title.
 */
const LiveBadge = () => {
  const { t } = useTranslation();
  return (
    <span className="relative inline-flex items-center justify-center h-6 px-3 rounded-full text-xs font-bold bg-gradient-to-r from-[#887CFD] to-[#16C8C7] text-white shadow-lg shadow-[#887CFD]/20">
      <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-white opacity-20"></span>
      {t("aiLiveFeed.live")}
    </span>
  );
};

/**
 * Language switcher pill: Original | Bangla | English.
 */
const LanguageSwitcher = ({
  langMode,
  onLangChange,
  onTranslate,
  isTranslating,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-800 p-1.5 shadow-sm">
      {LANGUAGE_OPTIONS.map(({ key, labelKey }) => {
        const isActive =
          (key === "original" && langMode === "original") || langMode === key;
        return (
          <button
            key={key}
            onClick={() =>
              key === "original" ? onLangChange("original") : onTranslate(key)
            }
            disabled={isTranslating}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-[#887CFD] to-[#16C8C7] text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Title block: "Latest Activity" + Live badge + subtitle.
 */
const TitleBlock = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
        {t("aiLiveFeed.latestActivity")}
        <LiveBadge />
      </h1>
      <p className="text-gray-500 mt-2 text-lg max-w-2xl">
        {t("aiLiveFeed.subtitleDescription")}
      </p>
    </div>
  );
};

/**
 * Filter button (outline style) for future filter panel.
 */
const FilterButton = () => {
  const { t } = useTranslation();
  return (
    <Button
      variant="outline"
      className="gap-2 h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:border-[#887CFD] hover:text-[#887CFD] transition-all bg-white dark:bg-[#1a1f26] shadow-sm"
    >
      <Filter className="w-4 h-4" />
      {t("aiLiveFeed.filters")}
    </Button>
  );
};

// -----------------------------------------------------------------------------
// Main export: full header with title block and actions
// -----------------------------------------------------------------------------

/**
 * Header section for the AI Live Feed page.
 * Renders title, live badge, subtitle, language switcher, and filter button.
 * @param {string} langMode - "original" | "bn" | "en"
 * @param {function} onLangChange - Called when switching to original
 * @param {function} onTranslate - Called with target lang ("bn" | "en")
 * @param {boolean} isTranslating - Disables language buttons while translating
 */
const LiveFeedHeader = ({
  langMode,
  onLangChange,
  onTranslate,
  isTranslating,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
      <TitleBlock />
      <div className="flex items-center gap-3 self-start md:self-center">
        <LanguageSwitcher
          langMode={langMode}
          onLangChange={onLangChange}
          onTranslate={onTranslate}
          isTranslating={isTranslating}
        />
        <FilterButton />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// LiveFeedHeader expects: langMode, onLangChange, onTranslate, isTranslating.
// Section: LiveFeedHeader — title, badge, language switcher, filter (~150 lines).
// -----------------------------------------------------------------------------

export default LiveFeedHeader;
