import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export default function RadialChartComponent({
  chartData = [],
  chartConfig = {},
  total,
  name = "Total Amount",
  className
}) {
  const safeConfig = chartConfig || {};

  return (
    <ChartContainer
      config={safeConfig}
      className={`mx-auto aspect-square w-full ${className}`}
    >
      <RadialBarChart
        data={chartData}
        startAngle={180}
        endAngle={0}
        innerRadius={116}
        outerRadius={200}
      >
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 16}
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 4}
                      className="fill-muted-foreground"
                    >
                      {name}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
        {Object.keys(safeConfig).map((key) => (
          <RadialBar
            key={key}
            dataKey={key}
            stackId="a"
            cornerRadius={5}
            fill={safeConfig[key]?.color}
            className="stroke-transparent stroke-2"
          />
        ))}
      </RadialBarChart>
    </ChartContainer>
  );
}
