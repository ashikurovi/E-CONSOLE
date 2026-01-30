import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Store, Search, MapPin, Calculator, PackagePlus } from "lucide-react";
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
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">{t("pathao.title")}</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("pathao.description")}
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

export default PathaoPage;
