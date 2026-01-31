import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";

const LanguageSwitcher = ({ variant = "default", className = "" }) => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("squadcart_lang", newLang);
  };

  const currentLang =
    i18n.language === "en" ? t("language.english") : t("language.bangla");
  const nextLang =
    i18n.language === "en" ? t("language.bangla") : t("language.english");

  if (variant === "compact") {
    return (
      <button
        onClick={toggleLanguage}
        title={t("language.switchTo")}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-black dark:text-white ${className}`}
      >
        <Languages className="h-4 w-4" />
        <span>{i18n.language === "en" ? "EN" : "বাং"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      title={t("language.switchTo")}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-black dark:text-white"
    >
      <Languages className="h-4 w-4" />
      <span>{currentLang}</span>
      <span className="text-xs opacity-70">→ {nextLang}</span>
    </button>
  );
};

export default LanguageSwitcher;
