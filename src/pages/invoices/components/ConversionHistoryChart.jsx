import React from "react";
import { Bar, BarChart, ResponsiveContainer, Cell, Tooltip } from "recharts";

const ConversionHistoryChart = () => {
  const data = [
    { name: "Mon", value: 40 },
    { name: "Tue", value: 30 },
    { name: "Wed", value: 45 },
    { name: "Thu", value: 60 },
    { name: "Fri", value: 50 },
    { name: "Sat", value: 65 },
    { name: "Sun", value: 75 },
    { name: "Mon2", value: 80 },
  ];

  return (
    <div className="bg-[#FFFBF5] dark:bg-[#1a1f26] rounded-[24px] p-8 h-full flex flex-col shadow-sm border border-transparent dark:border-gray-800">
      <div className="mb-8">
        <h3 className="text-gray-900 dark:text-white font-bold text-lg">Conversion history</h3>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 font-medium">Week to week performance</p>
      </div>

      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={6}>
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                    return (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-xs">
                           <p className="font-bold mb-1 text-gray-900 dark:text-white">{payload[0].payload.name === 'Sun' ? 'Sunday' : payload[0].payload.name}</p>
                           <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                             <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                             <span>Sales: <span className="font-bold text-gray-900 dark:text-white">{payload[0].value}</span></span>
                           </div>
                        </div>
                    );
                    }
                    return null;
                }}
            />
            <Bar dataKey="value" radius={[10, 10, 10, 10]}>
               {data.map((entry, index) => (
                 <Cell 
                   key={`cell-${index}`} 
                   fill={
                     index === 6 ? "#10B981" : // Selected (Green)
                     index === 7 ? "#10B981" : 
                     index === 4 || index === 2 ? "#D4D4D8" : // Greyish
                     "#EAD39C" // Beige/Yellowish
                   }
                  />
               ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ConversionHistoryChart;
