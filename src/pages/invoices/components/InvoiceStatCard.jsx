import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUp, ArrowDown } from "lucide-react";

const InvoiceStatCard = ({ 
  title, 
  value, 
  comparisonText, 
  trend = "up", // 'up' | 'down' | 'neutral'
  data = [], 
  color = "#10B981" // Default emerald/green
}) => {
  return (
    <div className="bg-[#FFFBF5] dark:bg-[#1a1f26] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden h-full min-h-[160px]">
      <div>
        <div className="flex justify-between items-start">
          <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg">{title}</h3>
          {trend !== "neutral" && (
             <div className="flex items-center text-gray-900 dark:text-white font-bold text-lg">
                {value}
                <span className={`ml-2 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </span>
             </div>
          )}
          {trend === "neutral" && (
             <span className="text-gray-900 dark:text-white font-bold text-lg">{value}</span>
          )}
        </div>
        <p className="text-gray-500 text-xs mt-1">{comparisonText}</p>
      </div>

      <div className="h-16 w-full mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.0} />
                <stop offset="100%" stopColor={color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Area
              type="basis" // Smooth curve
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvoiceStatCard;
