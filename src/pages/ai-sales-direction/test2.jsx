
// import React, { useMemo } from "react";
// import { useSelector } from "react-redux";
// import {
//   AlertCircle,
//   Target,
//   TrendingUp,
//   RefreshCcw,
//   Sparkles,
//   Zap,
//   Loader2,
//   Radar,
//   BrainCircuit,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useGetAiSalesDirectionQuery } from "@/features/dashboard/dashboardApiSlice";

// const AiSalesDirectionPage = () => {
//   const { user } = useSelector((state) => state.auth);
//   const companyId = user?.companyId;

//   // Fetch AI Sales Direction Data
//   const { data: aiData, isLoading, isError } = useGetAiSalesDirectionQuery(
//     { companyId },
//     { skip: !companyId }
//   );

//   // Default Mock Data (Fallback)
//   const defaultPhases = [
//     {
//       id: "phase-1",
//       phase: "PHASE I",
//       title: "Best Seller Alert",
//       description: "Restock OVI as it's the top seller, with 8 sales",
//       icon: Zap,
//       type: "alert",
//       badgeColor: "bg-rose-500",
//     },
//     {
//       id: "phase-2",
//       phase: "PHASE II",
//       title: "Customer Engagement",
//       description: "Reach out to top customers (MST HASINA BEGUM) for loyalty program or promotions",
//       icon: Target,
//       type: "engagement",
//       badgeColor: "bg-indigo-500",
//     },
//     {
//       id: "phase-3",
//       phase: "PHASE III",
//       title: "Inventory Alert",
//       description: "Review and restock products with 2 items out of stock",
//       icon: AlertCircle,
//       type: "inventory",
//       badgeColor: "bg-red-500",
//     },
//     {
//       id: "phase-4",
//       phase: "PHASE IV",
//       title: "Revenue Growth",
//       description: "Review Average Order Value ($2.00) and consider upselling strategies",
//       icon: TrendingUp,
//       type: "growth",
//       badgeColor: "bg-indigo-500",
//     },
//     {
//       id: "phase-5",
//       phase: "PHASE V",
//       title: "Customer Retention",
//       description: "Maintain 100% Repeat Purchase Rate by offering personalized promotions or loyalty rewards",
//       icon: RefreshCcw,
//       type: "retention",
//       badgeColor: "bg-rose-500",
//     },
//   ];

//   // Merge/Map API Data
//   const phases = useMemo(() => {
//     if (!aiData || !Array.isArray(aiData) || aiData.length === 0) {
//       return defaultPhases;
//     }

//     // Map API response to UI structure
//     // Assuming API returns array of { title, description, type, ... }
//     return aiData.slice(0, 5).map((item, index) => {
//       // Assign Icon & Color based on type or index
//       let Icon = Target;
//       let badgeColor = "bg-indigo-500";

//       if (item.type === "alert" || index === 0) {
//         Icon = Zap;
//         badgeColor = "bg-rose-500";
//       } else if (item.type === "inventory" || index === 2) {
//         Icon = AlertCircle;
//         badgeColor = "bg-red-500";
//       } else if (item.type === "growth" || index === 3) {
//         Icon = TrendingUp;
//         badgeColor = "bg-indigo-500";
//       } else if (item.type === "retention" || index === 4) {
//         Icon = RefreshCcw;
//         badgeColor = "bg-rose-500";
//       }

//       return {
//         id: `phase-${index + 1}`,
//         phase: `PHASE ${["I", "II", "III", "IV", "V"][index]}`,
//         title: item.title || "Strategic Insight",
//         description: item.description || "No description available.",
//         icon: Icon,
//         badgeColor,
//       };
//     });
//   }, [aiData]);

//   // Layout Configuration
//   const layoutConfig = {
//     "phase-1": { pos: "top-[10%] right-[10%]", card: "flex-row-reverse text-right" },
//     "phase-2": { pos: "top-[40%] right-[-5%]", card: "flex-row-reverse text-right" },
//     "phase-3": { pos: "bottom-[-5%] left-1/2 -translate-x-1/2", card: "flex-col items-center text-center" },
//     "phase-4": { pos: "top-[40%] left-[-5%]", card: "flex-row text-left" },
//     "phase-5": { pos: "top-[10%] left-[10%]", card: "flex-row text-left" },
//   };

//   return (
//     <div className="min-h-screen w-full bg-slate-50/50 flex flex-col items-center justify-center p-8 overflow-hidden relative">
//       {/* Background ambient glow */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl -z-10 pointer-events-none" />

//       <div className="relative w-full max-w-[1000px] aspect-[4/3] md:aspect-[16/9] flex items-center justify-center">
        
//         {/* --- CENTRAL HUB (Enhanced Design) --- */}
//         <div className="relative z-20 flex flex-col items-center justify-center w-72 h-72 rounded-full bg-white shadow-[0_0_60px_-15px_rgba(99,102,241,0.4)] border-4 border-white group">
            
//             {/* Outer Pulsing Rings */}
//             <div className="absolute -inset-4 border border-indigo-100 rounded-full animate-ping opacity-20" />
//             <div className="absolute -inset-1 border border-indigo-50 rounded-full animate-pulse opacity-40" />

//             {/* Spinning Dashed Ring */}
//             <div className="absolute inset-5 border-2 border-dashed border-indigo-200/60 rounded-full animate-spin-slow" />
            
//             {/* Inner Rotating Radar/Scanner Effect */}
//             <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
//                  <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-transparent via-indigo-500/10 to-transparent rotate-[0deg] animate-spin-slow origin-bottom-left" />
//             </div>

//             {/* Center Content */}
//             <div className="relative z-10 flex flex-col items-center gap-3 scale-110 transition-transform duration-700 hover:scale-115">
//                 <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-inner text-indigo-600 mb-1 border border-indigo-100">
//                     {isLoading ? (
//                         <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
//                     ) : (
//                         <BrainCircuit className="w-7 h-7 fill-indigo-500/10" />
//                     )}
//                 </div>
                
//                 <div className="text-center">
//                     <h1 className="text-3xl font-bold text-slate-800 leading-none tracking-tight">
//                         AI Sales
//                     </h1>
//                     <span className="text-xl font-medium text-indigo-500 tracking-wide">Direction</span>
//                 </div>

//                 <div className={cn(
//                     "flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-300",
//                     isLoading ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600 shadow-sm"
//                 )}>
//                     <div className={cn(
//                         "w-2 h-2 rounded-full", 
//                         isLoading ? "bg-amber-500 animate-bounce" : "bg-emerald-500 animate-pulse"
//                     )} />
//                     {isLoading ? "Processing Data..." : "Live Insights"}
//                 </div>
//             </div>

//             {/* Decorative Orbit Rings */}
//             <div className="absolute -inset-20 border border-indigo-100/50 rounded-full -z-10" />
//             <div className="absolute -inset-40 border border-dashed border-indigo-50 rounded-full -z-20 opacity-60" />
            
//             {/* Connecting Arrows Ring SVG */}
//              <svg className="absolute w-[180%] h-[180%] -z-10 animate-spin-reverse-slower opacity-20 pointer-events-none">
//                 <defs>
//                     <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                         <stop offset="0%" stopColor="#818cf8" stopOpacity="0" />
//                         <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
//                         <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
//                     </linearGradient>
//                 </defs>
//                 <circle cx="50%" cy="50%" r="48%" fill="none" stroke="url(#circleGradient)" strokeWidth="1.5" strokeDasharray="8 8" />
//             </svg>
//         </div>

//         {/* --- SATELLITES (Phases) --- */}
//         {phases.map((phase, index) => {
//             const config = layoutConfig[phase.id] || layoutConfig["phase-1"];
            
//             return (
//                 <div 
//                     key={phase.id} 
//                     className={cn(
//                         "absolute z-30 transition-all duration-700 ease-out hover:scale-105 hover:z-40", 
//                         config.pos,
//                         isLoading && "opacity-50 grayscale scale-95" // Dim satellites while loading
//                     )}
//                     style={{ transitionDelay: `${index * 100}ms` }}
//                 >
//                     <div className={cn("flex items-center gap-4", config.card)}>
//                         {/* Icon Node */}
//                         <div className="relative group cursor-pointer">
//                             <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10 group-hover:opacity-30 transition-opacity" />
                            
//                             <div className="relative w-16 h-16 rounded-full bg-white border-4 border-indigo-50 flex items-center justify-center shadow-lg group-hover:border-indigo-200 group-hover:shadow-indigo-200/50 transition-all duration-300">
//                                 <div className="w-10 h-10 rounded-full bg-indigo-50/80 flex items-center justify-center text-indigo-600">
//                                     <phase.icon className="w-5 h-5" />
//                                 </div>
//                             </div>
                            
//                             {/* Phase Badge */}
//                             <div className={cn(
//                                 "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-md whitespace-nowrap tracking-wide",
//                                 phase.badgeColor
//                             )}>
//                                 {phase.phase}
//                             </div>
//                         </div>

//                         {/* Content Card */}
//                         <div className="max-w-[280px]">
//                             <h3 className="text-sm font-bold text-slate-800 mb-1.5 px-1">
//                                 {phase.title}
//                             </h3>
//                             <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-slate-100 text-xs text-slate-600 leading-relaxed relative transition-all hover:shadow-md hover:border-indigo-100">
//                                 {phase.description}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             );
//         })}

//         {/* Bottom Status Bar */}
//         <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 transition-all duration-500 delay-500" style={{ opacity: isLoading ? 0 : 1, transform: isLoading ? 'translate(-50%, 20px)' : 'translate(-50%, 0)' }}>
//              <div className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-emerald-100/50">
//                 <div className="w-5 h-5 rounded-full border-2 border-emerald-500 flex items-center justify-center">
//                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
//                 </div>
//                 <span className="text-sm font-medium text-emerald-800">
//                     {phases.length} Strategic Insights Loaded
//                 </span>
//                 <Sparkles className="w-4 h-4 text-emerald-500 ml-2" />
//              </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AiSalesDirectionPage;
