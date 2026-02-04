import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TrendingUp, Filter, ChevronDown, ArrowUpRight } from "lucide-react";

const CHART_COLORS = ["#5347CE", "#887CFD", "#4896FE", "#16C8C7", "#FF9F43"];

export default function SalesOverviewChart({
  data,
  filter,
  onFilterChange,
  totalRevenue,
  delta,
}) {
  const { t } = useTranslation();

  const getFilterLabel = (value) => {
    switch (value) {
      case "Daily":
        return t("dashboard.filterDaily");
      case "Weekly":
        return t("dashboard.filterWeekly");
      case "Monthly":
        return t("dashboard.filterMonthly");
      case "Yearly":
        return t("dashboard.filterYearly");
      default:
        return value;
    }
  };

  return (
    <Card className="lg:col-span-2 border-none shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 gap-4 sm:gap-0">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            {t("dashboard.salesOverviewTitle")}
          </CardTitle>
          <div className="flex flex-wrap items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">
              ${totalRevenue ?? "0.00"}
            </span>
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" /> {delta ?? "0%"}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {t("dashboard.salesOverviewLabel")}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 flex-1 sm:flex-none">
              <Filter className="w-3 h-3" /> {getFilterLabel(filter)}{" "}
              <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("Daily")}>
              {t("dashboard.filterDaily")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Weekly")}>
              {t("dashboard.filterWeekly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Monthly")}>
              {t("dashboard.filterMonthly")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Yearly")}>
              {t("dashboard.filterYearly")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend iconType="circle" />
              <Bar dataKey="Revenue" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
