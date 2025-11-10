import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = ({ title, value, delta, icon: Icon, tone = "default" }) => {
  const toneBg =
    tone === "green"
      ? "bg-emerald-50 dark:bg-emerald-900/20"
      : tone === "blue"
      ? "bg-blue-50 dark:bg-blue-900/20"
      : tone === "red"
      ? "bg-rose-50 dark:bg-rose-900/20"
      : "bg-gray-50 dark:bg-white/5";

  return (
    <Card className={`border-none ${toneBg}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-black/60 dark:text-white/70">
            {title}
          </CardTitle>
          {Icon ? <Icon className="h-4 w-4 opacity-70" /> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {delta ? (
          <div
            className={`text-xs mt-1 ${
              delta.startsWith("+") ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {delta}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default StatCard;