import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Import Settings Components
import GeneralSettings from "./components/GeneralSettings";
import PreferencesSettings from "./components/PreferencesSettings";
import NotificationSettings from "./components/NotificationSettings";
import AccountSettings from "./components/AccountSettings";
import UserPermissionSettings from "./components/UserPermissionSettings";

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";

  // Redirect to default tab if none provided
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "general" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings />;
      case "preferences":
        return <PreferencesSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "account":
        return <AccountSettings />;
      case "permissions":
        return <UserPermissionSettings />;
      case "billings":
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Billings Settings Coming Soon
          </div>
        );
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Customize until match to your workflows
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-200 h-10 px-6"
          >
            Cancel
          </Button>
          <Button className="bg-nexus-primary hover:bg-nexus-primary/90 text-white min-w-[100px] h-10 px-6">
            Save
          </Button>
        </div>
      </div>

      <div className="w-full">
        {/* Content Area */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm min-h-[600px]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
