import { CartesianGrid, Area, AreaChart, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import moment from "moment";

/**
 * LineChartComponent
 * 
 * Renders a responsive area chart with a smooth gradient fill.
 * Used for visualizing trends over time (e.g., Income Growth).
 * 
 * Props:
 * @param {Array} chartData - Array of data points (e.g., [{ month: '2024-01', totalPNL: 1000 }])
 * @param {Object} chartConfig - Configuration object for chart colors and labels
 */
export default function LineChartComponent({ chartData, chartConfig }) {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="colorTotalPNL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Grid Lines (Horizontal only, subtle) */}
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />

            {/* X-Axis (Months) */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => moment(value).format("MMM")}
              stroke="var(--foreground)"
              opacity={0.5}
              fontSize={12}
            />

            {/* Tooltip */}
            <ChartTooltip
              cursor={{ stroke: "var(--foreground)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.3 }}
              content={<ChartTooltipContent indicator="dot" />}
            />

            {/* Area (The Chart itself) */}
            <Area
              type="monotone"
              dataKey="totalPNL"
              stroke="var(--color-desktop)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotalPNL)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
