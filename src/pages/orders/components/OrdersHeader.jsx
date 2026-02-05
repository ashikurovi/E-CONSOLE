import { Calendar, Download, Plus, PackageSearch } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OrdersHeader = ({
  dateRange,
  setDateRange,
  showDatePicker,
  setShowDatePicker,
  handleExport,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Orders
        </h1>
        <DropdownMenu open={showDatePicker} onOpenChange={setShowDatePicker}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 px-4 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {dateRange.start && dateRange.end
                ? `${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${new Date(dateRange.end).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                : dateRange.start
                  ? `From ${new Date(dateRange.start).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                  : t("orders.selectDateRange") || "Select Date Range"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-4">
            <DropdownMenuLabel>{t("orders.dateRange") || "Date Range"}</DropdownMenuLabel>
            <div className="space-y-3 mt-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  {t("orders.startDate") || "Start Date"}
                </label>
                <input
                  type="date"
                  value={dateRange.start || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  {t("orders.endDate") || "End Date"}
                </label>
                <input
                  type="date"
                  value={dateRange.end || ""}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateRange({ start: null, end: null });
                    setShowDatePicker(false);
                  }}
                  className="flex-1 text-xs"
                >
                  {t("common.clear") || "Clear"}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {t("common.apply") || "Apply"}
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handleExport}
          className="h-10 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold"
        >
          <Download className="w-4 h-4 mr-2" />
          {t("orders.export") || "Export"}
        </Button>
        <Button
          onClick={() => navigate("/orders/track")}
          variant="outline"
          className="h-10 rounded-xl border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm font-semibold"
        >
          <PackageSearch className="w-4 h-4 mr-2" />
          {t("orders.trackOrder") || "Order Tracking"}
        </Button>
        <Button
          onClick={() => navigate("/orders/create")}
          className="h-10 rounded-xl bg-[#5347CE] hover:bg-[#4338ca] text-white text-sm font-bold px-6"
        >
          Create order
        </Button>
      </div>
    </div>
  );
};

export default OrdersHeader;
