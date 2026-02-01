import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PieChart as PieChartIcon, ChevronDown } from "lucide-react";

export default function SalesDistributionCard({ data, filter, onFilterChange }) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="w-5 h-5" />
          Sales Distribution
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              {filter} <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange("Weekly")}>Weekly</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Monthly")}>Monthly</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange("Yearly")}>Yearly</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-full justify-between">
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(data ?? []).map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center sm:items-start text-center sm:text-left"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-1 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
                <p className="text-lg font-bold tracking-tight">${item.value}</p>
              </div>
            ))}
          </div>
          <div className="h-[200px] relative -mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data ?? []}
                  cx="50%"
                  cy="100%"
                  innerRadius={80}
                  outerRadius={110}
                  startAngle={180}
                  endAngle={0}
                  paddingAngle={0}
                  dataKey="value"
                  cornerRadius={8}
                  stroke="none"
                >
                  {(data ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
