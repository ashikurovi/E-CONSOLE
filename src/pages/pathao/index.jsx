import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  Store,
  Search,
  MapPin,
  Calculator,
  PackagePlus,
} from "lucide-react";
import CreateOrder from "./components/CreateOrder";
import BulkCreateOrder from "./components/BulkCreateOrder";
import ManageStores from "./components/ManageStores";
import ViewOrders from "./components/ViewOrders";
import Locations from "./components/Locations";
import PriceCalculator from "./components/PriceCalculator";

const PathaoPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: t("pathao.createOrder"), icon: Package },
    { id: "bulk", label: t("pathao.bulkOrders"), icon: PackagePlus },
    { id: "orders", label: t("pathao.viewOrders"), icon: Search },
    { id: "stores", label: t("pathao.manageStores"), icon: Store },
    { id: "locations", label: t("pathao.locations"), icon: MapPin },
    { id: "calculator", label: t("pathao.priceCalculator"), icon: Calculator },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateOrder />;
      case "bulk":
        return <BulkCreateOrder />;
      case "orders":
        return <ViewOrders />;
      case "stores":
        return <ManageStores />;
      case "locations":
        return <Locations />;
      case "calculator":
        return <PriceCalculator />;
      default:
        return <CreateOrder />;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t("pathao.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("pathao.description")}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-[#1a1f26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#976DF7] text-white shadow-lg shadow-[#976DF7]/25 scale-100"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default PathaoPage;
