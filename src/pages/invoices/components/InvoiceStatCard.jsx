import React from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ArrowUp } from "lucide-react";

/**
 * InvoiceStatCard
 * Displays a metric with a sparkline chart roughly matching the provided design.
 */
const InvoiceStatCard = ({ 
  title, 
  value, 
  comparisonText, 
  data = [], 
  color = "#10B981" 
}) => {
  return (
    <div className="bg-[#FFFBF5] dark:bg-[#1a1f26] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden h-full min-h-[160px] shadow-sm border border-transparent dark:border-gray-800">
      <div className="flex justify-between items-start z-10">
        <div>
           <h3 className="text-gray-900 dark:text-gray-100 font-bold text-lg tracking-tight">{title}</h3>
           <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">{comparisonText}</p>
        </div>
        <div className="flex items-center gap-1">
            <span className="text-gray-900 dark:text-white font-bold text-2xl tracking-tight">{value}</span>
            <span className="text-emerald-500 mb-1">
                <ArrowUp size={16} strokeWidth={3} />
            </span>
        </div>
      </div>

      <div className="h-[80px] w-[120%] -ml-[10%] mt-4 absolute bottom-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="50%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <Area
              type="basis" 
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill="none"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvoiceStatCard;
