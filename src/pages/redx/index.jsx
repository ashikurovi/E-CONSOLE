import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Package, Store, MapPin, Calculator, Search } from "lucide-react";
import CreateOrder from "./components/CreateOrder";
import ManageStores from "./components/ManageStores";
import Locations from "./components/Locations";
import PriceCalculator from "./components/PriceCalculator";
import TrackParcel from "./components/TrackParcel";

const RedXPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("create");

  const tabs = [
    { id: "create", label: t("redx.createOrder"), icon: Package },
    { id: "track", label: t("redx.trackParcel"), icon: Search },
    { id: "stores", label: t("redx.manageStores"), icon: Store },
    { id: "locations", label: t("redx.locations"), icon: MapPin },
    { id: "calculator", label: t("redx.priceCalculator"), icon: Calculator },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "create":
        return <CreateOrder />;
      case "track":
        return <TrackParcel />;
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
        <h2 className="text-2xl font-semibold mb-2">{t("redx.title")}</h2>
        <p className="text-sm text-black/60 dark:text-white/60">
          {t("redx.description")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-black/10 dark:border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-red-600 text-white dark:bg-red-500"
                  : "bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 hover:bg-black/10 dark:hover:bg-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default RedXPage;
