import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

/**
 * OrderStatCard Component
 * 
 * A modernized stat card inspired by the screenshot, featuring a title, 
 * large value, trend percentage, and a sparkline chart.
 * 
 * @param {string} title - Label of the stat
 * @param {string|number} value - Main stat value
 * @param {string} delta - Trend percentage (e.g. "+25.2%")
 * @param {Array} chartData - Data points for the sparkline [ { value: 10 }, { value: 20 }, ... ]
 * @param {string} tone - Color theme ('green', 'red', 'default')
 */
const OrderStatCard = ({ title, value, delta, chartData = [], tone = 'default' }) => {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');
  const TrendIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus;

  const styles = {
    green: {
      text: "text-emerald-500",
      bg: "bg-emerald-50/50 dark:bg-emerald-500/10",
      line: "#10b981"
    },
    red: {
      text: "text-rose-500",
      bg: "bg-rose-50/50 dark:bg-rose-500/10",
      line: "#f43f5e"
    },
    default: {
      text: "text-gray-500",
      bg: "bg-gray-50/50 dark:bg-gray-500/10",
      line: "#94a3b8"
    }
  };

  const activeStyle = styles[tone] || styles.default;

  return (
    <Card className="border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 shadow-none rounded-[24px] overflow-hidden">
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {value}
            </h3>
            <span className="text-gray-400 font-light text-2xl">-</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className={`flex items-center gap-1 text-xs font-bold ${activeStyle.text}`}>
              <TrendIcon className="w-3.5 h-3.5" strokeWidth={3} />
              <span>{delta} last week</span>
            </div>
            
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={activeStyle.line} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatCard;
