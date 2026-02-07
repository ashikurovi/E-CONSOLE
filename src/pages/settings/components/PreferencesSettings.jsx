import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const STORAGE_KEY_THEME = "theme";
const STORAGE_KEY_DARK = "darkMode";
const STORAGE_KEY_CUSTOM_COLOR = "customColor";
const DEFAULT_PRIMARY = "#5347CE";

/** Convert hex to HSL string for CSS var(--primary): "H S% L%" */
const hexToHSL = (hex) => {
  const n = hex.replace(/^#/, "");
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lR = Math.round(l * 100);
  return `${h} ${s}% ${lR}%`;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY_THEME);
  if (stored && ["light", "dark", "custom"].includes(stored)) return stored;
  return localStorage.getItem(STORAGE_KEY_DARK) === "true" ? "dark" : "light";
};

const getStoredCustomColor = () => {
  if (typeof window === "undefined") return DEFAULT_PRIMARY;
  return localStorage.getItem(STORAGE_KEY_CUSTOM_COLOR) || DEFAULT_PRIMARY;
};

const applyTheme = (theme, customColor, useDarkForCustom) => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.removeAttribute("data-theme");
    root.style.removeProperty("--nexus-primary");
    root.style.removeProperty("--nexus-secondary");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    localStorage.setItem(STORAGE_KEY_DARK, "true");
  } else if (theme === "custom" && customColor) {
    root.setAttribute("data-theme", "custom");
    root.style.setProperty("--nexus-primary", customColor);
    root.style.setProperty("--nexus-secondary", customColor);
    root.style.setProperty("--primary", hexToHSL(customColor));
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    if (useDarkForCustom !== undefined) {
      if (useDarkForCustom) {
        root.classList.add("dark");
        localStorage.setItem(STORAGE_KEY_DARK, "true");
      } else {
        root.classList.remove("dark");
        localStorage.setItem(STORAGE_KEY_DARK, "false");
      }
    }
  } else {
    root.classList.remove("dark");
    root.removeAttribute("data-theme");
    root.style.removeProperty("--nexus-primary");
    root.style.removeProperty("--nexus-secondary");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    localStorage.setItem(STORAGE_KEY_DARK, "false");
  }
  if (theme === "dark") {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
  }
  localStorage.setItem(STORAGE_KEY_THEME, theme);
};

const isDarkStored = () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY_DARK) === "true";

const PreferencesSettings = () => {
  const [theme, setTheme] = useState(getStoredTheme);
  const [customColor, setCustomColor] = useState(getStoredCustomColor);
  const [customUseDark, setCustomUseDark] = useState(isDarkStored);

  useEffect(() => {
    applyTheme(theme === "custom" ? "custom" : theme, theme === "custom" ? customColor : null);
    if (theme === "custom") setCustomUseDark(isDarkStored());
  }, [theme, customColor]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (newTheme !== "custom") applyTheme(newTheme, null);
  };

  const handleCustomColorChange = (hex) => {
    setCustomColor(hex);
    localStorage.setItem(STORAGE_KEY_CUSTOM_COLOR, hex);
    if (theme === "custom") applyTheme("custom", hex);
  };

  const handleCustomDarkToggle = () => {
    const next = !customUseDark;
    setCustomUseDark(next);
    applyTheme("custom", customColor, next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Customization according to your preferences</p>
      </div>

      <div className="space-y-8">
        {/* Select Theme */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Select Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Light Mode */}
            <div 
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all bg-white",
                theme === "light" ? "border-nexus-primary ring-1 ring-nexus-primary" : "border-gray-200 dark:border-gray-700"
              )}
              onClick={() => handleThemeChange("light")}
            >
              <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-4 relative overflow-hidden border border-gray-100">
                {/* Mock UI for Light Mode */}
                <div className="absolute inset-0 p-2 flex gap-2">
                  <div className="w-1/4 bg-white rounded border border-gray-100 h-full flex flex-col gap-1 p-1">
                    <div className="h-2 w-full bg-gray-200 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-gray-100 rounded-sm"></div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-2">
                    <div className="h-8 bg-white border border-gray-100 rounded w-full flex items-center px-2 gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-200"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-200"></div>
                        <div className="h-2 w-2 rounded-full bg-green-200"></div>
                    </div>
                    <div className="flex-1 bg-nexus-primary rounded w-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Light Mode (Active)</span>
                {theme === "light" && <CheckCircle2 className="h-5 w-5 text-nexus-primary fill-nexus-primary text-white" />}
              </div>
            </div>

            {/* Dark Mode */}
            <div 
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all bg-[#1e293b]",
                theme === "dark" ? "border-nexus-primary ring-1 ring-nexus-primary" : "border-gray-700"
              )}
              onClick={() => handleThemeChange("dark")}
            >
              <div className="aspect-[4/3] bg-gray-900 rounded-lg mb-4 relative overflow-hidden border border-gray-800">
                {/* Mock UI for Dark Mode */}
                <div className="absolute inset-0 p-2 flex gap-2">
                  <div className="w-1/4 bg-gray-800 rounded border border-gray-700 h-full flex flex-col gap-1 p-1">
                     <div className="h-2 w-full bg-gray-700 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-gray-700 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-gray-700 rounded-sm"></div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-2">
                    <div className="h-8 bg-gray-800 border border-gray-700 rounded w-full flex items-center px-2 gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-900"></div>
                        <div className="h-2 w-2 rounded-full bg-yellow-900"></div>
                        <div className="h-2 w-2 rounded-full bg-green-900"></div>
                    </div>
                    <div className="flex-1 bg-nexus-primary rounded w-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-white">Dark Mode</span>
                {theme === "dark" && <CheckCircle2 className="h-5 w-5 text-nexus-primary fill-nexus-primary text-white" />}
              </div>
            </div>

            {/* Custom Color */}
            <div 
              className={cn(
                "cursor-pointer rounded-xl border-2 p-4 transition-all bg-white dark:bg-[#1e293b]",
                theme === "custom" ? "ring-1 ring-offset-2 ring-offset-white dark:ring-offset-[#1e293b]" : "border-gray-200 dark:border-gray-700"
              )}
              style={theme === "custom" ? { borderColor: customColor } : undefined}
              onClick={() => handleThemeChange("custom")}
            >
              <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-lg mb-4 relative overflow-hidden border border-gray-100 dark:border-gray-800">
                 <div className="absolute inset-0 p-2 flex gap-2">
                  <div className="w-1/4 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 h-full flex flex-col gap-1 p-1">
                    <div className="h-2 w-full rounded-sm opacity-60" style={{ backgroundColor: customColor }}></div>
                    <div className="h-2 w-3/4 rounded-sm opacity-40" style={{ backgroundColor: customColor }}></div>
                    <div className="h-2 w-3/4 rounded-sm opacity-40" style={{ backgroundColor: customColor }}></div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-2">
                    <div className="h-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded w-full flex items-center px-2 gap-1">
                        <div className="h-2 w-2 rounded-full opacity-70" style={{ backgroundColor: customColor }}></div>
                        <div className="h-2 w-2 rounded-full opacity-70" style={{ backgroundColor: customColor }}></div>
                        <div className="h-2 w-2 rounded-full opacity-70" style={{ backgroundColor: customColor }}></div>
                    </div>
                    <div className="flex-1 rounded w-full" style={{ backgroundColor: customColor }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900 dark:text-white">Custom Color</span>
                {theme === "custom" && <CheckCircle2 className="h-5 w-5 text-white shrink-0" style={{ color: customColor }} />}
              </div>
            </div>
          </div>

          {/* Custom color picker - visible when Custom is selected */}
          {theme === "custom" && (
            <div className="mt-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-dark" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">Use dark mode for this theme</Label>
                <Switch id="custom-dark" checked={customUseDark} onCheckedChange={handleCustomDarkToggle} />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Choose your color</h4>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                    aria-label="Pick custom primary color"
                  />
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (/^#[0-9A-Fa-f]{6}$/.test(v) || v === "") handleCustomColorChange(v || DEFAULT_PRIMARY);
                    }}
                    className="w-28 px-3 py-2 text-sm font-mono rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-nexus-primary"
                    placeholder="#5347CE"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["#5347CE", "#2563eb", "#059669", "#dc2626", "#ea580c", "#7c3aed", "#0891b2"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleCustomColorChange(preset)}
                      className={cn(
                        "w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110",
                        customColor === preset ? "border-gray-900 dark:border-white scale-110" : "border-gray-200 dark:border-gray-600"
                      )}
                      style={{ backgroundColor: preset }}
                      aria-label={`Use ${preset}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;
