import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PreferencesSettings = () => {
  const [theme, setTheme] = useState("light");

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
              onClick={() => setTheme("light")}
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
              onClick={() => setTheme("dark")}
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
                "cursor-pointer rounded-xl border-2 p-4 transition-all bg-white",
                theme === "custom" ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              )}
              onClick={() => setTheme("custom")}
            >
              <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-4 relative overflow-hidden border border-gray-100">
                 {/* Mock UI for Custom */}
                 <div className="absolute inset-0 p-2 flex gap-2">
                  <div className="w-1/4 bg-white rounded border border-blue-100 h-full flex flex-col gap-1 p-1">
                    <div className="h-2 w-full bg-blue-100 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-blue-50 rounded-sm"></div>
                    <div className="h-2 w-3/4 bg-blue-50 rounded-sm"></div>
                  </div>
                  <div className="w-3/4 flex flex-col gap-2">
                    <div className="h-8 bg-white border border-blue-100 rounded w-full flex items-center px-2 gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-200"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-200"></div>
                        <div className="h-2 w-2 rounded-full bg-blue-200"></div>
                    </div>
                    <div className="flex-1 bg-blue-400 rounded w-full"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Custom Color</span>
                {theme === "custom" && <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500 text-white" />}
              </div>
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label className="text-base">Time Zone</Label>
            <div className="md:col-span-2">
              <Select defaultValue="pst">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Time Zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pst">(UTC - 08:00) Pacific Time (US & Canada)</SelectItem>
                  <SelectItem value="est">(UTC - 05:00) Eastern Time (US & Canada)</SelectItem>
                  <SelectItem value="utc">(UTC + 00:00) Coordinated Universal Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label className="text-base">Language</Label>
            <div className="md:col-span-2">
              <Select defaultValue="en-us">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">English (US)</SelectItem>
                  <SelectItem value="en-uk">English (UK)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label className="text-base">Sidebar Size</Label>
            <div className="md:col-span-2">
              <Select defaultValue="medium">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Sidebar Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (180px)</SelectItem>
                  <SelectItem value="medium">Medium (200px)</SelectItem>
                  <SelectItem value="large">Large (240px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Label className="text-base">Icons Size</Label>
            <div className="md:col-span-2">
              <Select defaultValue="small">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select Icons Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (24px)</SelectItem>
                  <SelectItem value="medium">Medium (32px)</SelectItem>
                  <SelectItem value="large">Large (48px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;
