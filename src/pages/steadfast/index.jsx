import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  PackageCheck,
  Search,
  DollarSign,
  RotateCcw,
  CreditCard,
  Building2,
} from "lucide-react";
import CreateOrder from "./components/CreateOrder";
import BulkOrder from "./components/BulkOrder";
import CheckStatus from "./components/CheckStatus";
import CheckBalance from "./components/CheckBalance";
import ReturnRequests from "./components/ReturnRequests";
import Payments from "./components/Payments";
import PoliceStations from "./components/PoliceStations";

const SteadfastPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: t("steadfast.createOrder"), icon: Package },
    { id: "bulk", label: t("steadfast.bulkOrder"), icon: PackageCheck },
    { id: "status", label: t("steadfast.checkStatus"), icon: Search },
    { id: "balance", label: t("steadfast.balance"), icon: DollarSign },
    { id: "returns", label: t("steadfast.returnRequests"), icon: RotateCcw },
    { id: "payments", label: t("steadfast.payments"), icon: CreditCard },
    { id: "police", label: t("steadfast.policeStations"), icon: Building2 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateOrder />;
      case "bulk":
        return <BulkOrder />;
      case "status":
        return <CheckStatus />;
      case "balance":
        return <CheckBalance />;
      case "returns":
        return <ReturnRequests />;
      case "payments":
        return <Payments />;
      case "police":
        return <PoliceStations />;
      default:
        return <CreateOrder />;
    }
  };

  const API_KEY =
    import.meta.env.VITE_STEADFAST_API_KEY ||
    "ynl1e3u6p3bnxqu1lspdmz4zt1lpcxd2";
  const SECRET_KEY =
    import.meta.env.VITE_STEADFAST_SECRET_KEY || "brzlqfob09jelb5g06cblbon";

  return (
    <div className="rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10  p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{t("steadfast.title")}</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("steadfast.description")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-100/20 dark:border-gray-800/20 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-black/85 to-gray-800/85 dark:from-white/90 dark:to-gray-100/90 text-white dark:text-black backdrop-blur-md shadow-lg border border-white/20 dark:border-white/20 font-medium"
                  : "hover:bg-black/5 dark:hover:bg-white/10 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};

export default SteadfastPage;
