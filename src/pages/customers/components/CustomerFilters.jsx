import React from "react";
import { useTranslation } from "react-i18next";

const CustomerFilters = ({
  selectedSuccessfulOrders,
  setSelectedSuccessfulOrders,
  SUCCESSFUL_ORDERS_OPTIONS,
  selectedCancelledOrders,
  setSelectedCancelledOrders,
  CANCELLED_ORDERS_OPTIONS,
  selectedStatus,
  setSelectedStatus,
  STATUS_OPTIONS,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("customers.filterBySuccessfulOrders")}
        </label>
        <select
          value={selectedSuccessfulOrders.value}
          onChange={(e) => {
            const selected = SUCCESSFUL_ORDERS_OPTIONS.find(
              (opt) => opt.value === e.target.value,
            );
            setSelectedSuccessfulOrders(selected);
          }}
          className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {SUCCESSFUL_ORDERS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("customers.filterByCancelledOrders")}
        </label>
        <select
          value={selectedCancelledOrders.value}
          onChange={(e) => {
            const selected = CANCELLED_ORDERS_OPTIONS.find(
              (opt) => opt.value === e.target.value,
            );
            setSelectedCancelledOrders(selected);
          }}
          className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {CANCELLED_ORDERS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-black/70 dark:text-white/70 mb-2 block">
          {t("customers.filterByStatus")}
        </label>
        <select
          value={selectedStatus.value}
          onChange={(e) => {
            const selected = STATUS_OPTIONS.find(
              (opt) => opt.value === e.target.value,
            );
            setSelectedStatus(selected);
          }}
          className="w-full h-10 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-gray-800 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CustomerFilters;

