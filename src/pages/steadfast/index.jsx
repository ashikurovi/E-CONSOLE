import React, { useState } from "react";
import { Package, PackageCheck, Search, DollarSign, RotateCcw, CreditCard, Building2, AlertTriangle } from "lucide-react";
import CreateOrder from "./components/CreateOrder";
import BulkOrder from "./components/BulkOrder";
import CheckStatus from "./components/CheckStatus";
import CheckBalance from "./components/CheckBalance";
import ReturnRequests from "./components/ReturnRequests";
import Payments from "./components/Payments";
import PoliceStations from "./components/PoliceStations";

const SteadfastPage = () => {
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: "Create Order", icon: Package },
    { id: "bulk", label: "Bulk Order", icon: PackageCheck },
    { id: "status", label: "Check Status", icon: Search },
    { id: "balance", label: "Balance", icon: DollarSign },
    { id: "returns", label: "Return Requests", icon: RotateCcw },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "police", label: "Police Stations", icon: Building2 },
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

  const API_KEY = import.meta.env.VITE_STEADFAST_API_KEY || "ynl1e3u6p3bnxqu1lspdmz4zt1lpcxd2";
  const SECRET_KEY = import.meta.env.VITE_STEADFAST_SECRET_KEY || "brzlqfob09jelb5g06cblbon";


  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
     
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Steadfast Courier</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          Manage your courier orders, track deliveries, and handle returns
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
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
