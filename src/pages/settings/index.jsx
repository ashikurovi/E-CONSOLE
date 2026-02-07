import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

// Import Settings Components
import PreferencesSettings from "./components/PreferencesSettings";
import NotificationSettings from "./components/NotificationSettings";
import AccountSettings from "./components/AccountSettings";
import UserPermissionSettings from "./components/UserPermissionSettings";
import CourierSettings from "./components/CourierSettings";
import DomainSettings from "./components/DomainSettings";
import BillingSettings from "./components/BillingSettings";
import ProfileSettings from "./components/ProfileSettings";

const SettingsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "profile";
    const { t } = useTranslation();
    const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery();

    // Redirect to default tab if none provided
    useEffect(() => {
        if (!searchParams.get("tab")) {
            setSearchParams({ tab: "profile" }, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const tabs = [
        { id: "profile", label: "Profile" },
        { id: "preferences", label: "Preferences" },
        { id: "notifications", label: "Notifications" },
        { id: "account", label: "Account" },
        { id: "permissions", label: "Permissions" },
        { id: "courier", label: "Courier Integration" },
        { id: "domain", label: "Custom Domain" },
        { id: "billings", label: "Billings" },
    ];

    const renderContent = () => {
        if (isLoadingUser && (activeTab === "profile" || activeTab === "account" || activeTab === "courier" || activeTab === "domain" || activeTab === "billings" || activeTab === "notifications")) {
            return (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin h-10 w-10 border-2 border-nexus-primary border-t-transparent rounded-full" />
                </div>
            );
        }
        switch (activeTab) {
            case "profile":
                return <ProfileSettings user={currentUser} />;
            case "preferences":
                return <PreferencesSettings />;
            case "notifications":
                return <NotificationSettings user={currentUser} />;
            case "account":
                return <AccountSettings user={currentUser} />;
            case "permissions":
                return <UserPermissionSettings />;
            case "courier":
                return <CourierSettings user={currentUser} />;
            case "domain":
                return <DomainSettings user={currentUser} />;
            case "billings":
                return <BillingSettings user={currentUser} />;
            default:
                return <ProfileSettings user={currentUser} />;
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

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                            activeTab === tab.id
                                ? "bg-nexus-primary text-white"
                                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
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
