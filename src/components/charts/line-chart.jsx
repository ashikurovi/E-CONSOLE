import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  ComposedChart,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import moment from "moment";

/**
 * LineChartComponent
 *
 * Renders a responsive composed chart with background bars and a dashed line.
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
          <ComposedChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 20,
              bottom: 0,
            }}
          >
            {/* Background Bars */}
            <Bar
              dataKey="totalPNL"
              barSize={40}
              fill="transparent"
              background={{
                fill: "var(--muted)",
                radius: [20, 20, 20, 20],
                opacity: 0.2
              }}
            />

            {/* X-Axis */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => {
                 // Try to detect if it's a date string or day name
                 if (moment(value, moment.ISO_8601, true).isValid()) {
                     return moment(value).format("MMM");
                 }
                 return value;
              }}
              stroke="var(--foreground)"
              opacity={0.5}
              fontSize={12}
            />

            {/* Tooltip */}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />

            {/* Dashed Line */}
            <Line
              type="linear"
              dataKey="totalPNL"
              stroke="#F25F33"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{
                fill: "#F25F33",
                stroke: "var(--background)",
                strokeWidth: 2,
                r: 4,
                fillOpacity: 1
              }}
              activeDot={{
                r: 6,
                fill: "#F25F33",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
