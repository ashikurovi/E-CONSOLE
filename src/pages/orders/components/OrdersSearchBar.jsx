import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const OrdersSearchBar = ({ searchQuery, setSearchQuery }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="relative w-full max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors pointer-events-none" />
        <input
          type="text"
          placeholder={t("orders.searchPlaceholder") || "Search orders by ID, customer, phone, email, tracking..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-12 pr-10 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-purple-500/10 transition-all text-sm font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label={t("common.clear") || "Clear search"}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {!searchQuery && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-gray-100 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-[10px] font-bold text-gray-400 pointer-events-none">
            ⌘ /
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersSearchBar;
