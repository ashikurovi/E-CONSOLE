import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  useGetAiSalesDirectionQuery,
  useTranslateReportMutation,
} from "@/features/dashboard/dashboardApiSlice";
import {
  BarChart3,
  PenTool,
  Layers,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// --- Design Constants ---
const PRIMARY_COLOR = "#F97316"; // Orange-500
const SECONDARY_COLOR = "#FB923C"; // Orange-400

const CircularStrategyMap = ({ directions }) => {
  const total = directions.length || 4; // Default to 4 if empty for skeleton
  const center = 450; // Increased canvas size
  const radiusRing = 240;
  
  // Map index to specific positions/icons based on the design
  // Design has: Left (I), Top (II), Right (III), Bottom (IV) roughly? 
  // actually usually circular layouts are balanced.
  // We will distribute evenly.
  
  const getPos = (angleDeg, r) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + Math.cos(angleRad) * r,
      y: center + Math.sin(angleRad) * r,
    };
  };

  const drawVariant = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.4, type: "spring", duration: 2, bounce: 0 },
        opacity: { delay: i * 0.4, duration: 0.1 },
      },
    }),
  };

  // Default icons/titles if data is missing (or mapping strategy)
  const defaultPhases = [
    { icon: BarChart3, label: "Analysis" },
    { icon: PenTool, label: "Design" },
    { icon: Layers, label: "Implementation" },
    { icon: Rocket, label: "Deployment" },
  ];

  return (
    <div className="relative w-[900px] h-[900px] mx-auto flex items-center justify-center select-none scale-50 md:scale-65 lg:scale-75 transition-transform origin-center">
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
        
        {/* Main Orange Ring */}
        <motion.circle
           cx={center}
           cy={center}
           r={radiusRing}
           fill="none"
           stroke={PRIMARY_COLOR}
           strokeWidth="6" // Thick orange ring
           initial={{ pathLength: 0, rotate: -90 }}
           animate={{ pathLength: 1, rotate: -90 }}
           transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Inner Dashed Ring - Grey faint */}
        <circle
           cx={center}
           cy={center}
           r={radiusRing - 60}
           fill="none"
           stroke="#E5E7EB" // gray-200
           strokeWidth="2"
           strokeDasharray="8 8"
        />

         {/* Inner Faint Solid Ring */}
         <circle
           cx={center}
           cy={center}
           r={radiusRing - 120}
           fill="none"
           stroke="#F3F4F6" // gray-100
           strokeWidth="1"
        />

        {/* Nodes and Connectors */}
        {directions.map((dir, index) => {
           // Position logic: 
           // 4 items: Top-Left (I), Top-Right (II), Bottom-Right (III), Bottom-Left (IV) ?
           // Or 0, 90, 180, 270?
           // Let's use 4 cardinal points rotated by 45deg to match X shape or + shape.
           // Screenshot looks like +, i.e., Left, Top, Right, Bottom?
           // Actually typically:
           // Phase I: Analysis (Left)
           // Phase II: Design (Top)
           // Phase III: Implementation (Right)
           // Phase IV: Deployment (Bottom)
           // Let's try: Left (180), Top (270 or -90), Right (0), Bottom (90).
           
           const angles = [180, 270, 0, 90]; 
           const angle = angles[index % 4];
           const pos = getPos(angle, radiusRing);
           const outerPos = getPos(angle, radiusRing + 80); // Line extension

           return (
             <g key={index}>
               {/* Node Circle on Ring */}
               <motion.circle
                 cx={pos.x}
                 cy={pos.y}
                 r="16"
                 fill="white"
                 stroke={PRIMARY_COLOR}
                 strokeWidth="6"
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ delay: 1 + index * 0.2, type: "spring" }}
               />
               
               {/* Extension Line (Pole) */}
               <motion.line
                 x1={pos.x}
                 y1={pos.y}
                 x2={outerPos.x}
                 y2={outerPos.y}
                 stroke={PRIMARY_COLOR}
                 strokeWidth="6"
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: 1 }}
                 transition={{ delay: 1.2 + index * 0.2, duration: 0.5 }}
               />
               
               {/* Outer Icon Circle */}
               <motion.circle
                  cx={outerPos.x}
                  cy={outerPos.y}
                  r="24"
                  fill="white"
                  stroke={PRIMARY_COLOR}
                  strokeWidth="6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5 + index * 0.2, type: "spring" }}
               />
             </g>
           );
        })}
      </svg>

      {/* Central Texts */}
      <motion.div 
        className="absolute z-20 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
          <h1 className="text-6xl font-black text-black dark:text-white tracking-tighter">UI/UX</h1>
          <p className="text-xl text-[#F97316] font-medium mt-2">Design & Prototyping</p>
      </motion.div>

      {/* Render Text Content Blocks */}
      {directions.map((dir, index) => {
          const angles = [180, 270, 0, 90]; 
          const angle = angles[index % 4];
          const outerPos = getPos(angle, radiusRing + 80); // Same as outer circle center
          
          const PhaseIcon = defaultPhases[index % 4].icon;
          const phaseLabel = defaultPhases[index % 4].label; // or dir.title
          
          // Determine text position relative to outer circle
          // Left (180): Text to the Left
          // Top (270): Text to Top? Or Left/Right? 
          // Right (0): Text to Right
          // Bottom (90): Text to Bottom?
          
          // Actually design usually puts text block nearby.
          
          let style = {};
          let align = "text-left";
          
          if (angle === 180) { // Left
             style = { right: 900 - outerPos.x + 40, top: outerPos.y - 60 }; // Position relative to container
             align = "text-left"; // Actually text should be on valid side
          } else if (angle === 0) { // Right
             style = { left: outerPos.x + 40, top: outerPos.y - 60 };
             align = "text-left";
          } else if (angle === 270) { // Top
             style = { left: outerPos.x + 40, top: outerPos.y - 20 }; // Offset
             align = "text-left";
          } else { // Bottom
             style = { left: outerPos.x + 40, top: outerPos.y - 80 };
             align = "text-left";
          }
           
          // Custom override for purely cardinal look
          const isLeft = angle > 90 && angle < 270;
          const isTop = angle > 180;
          
          const xOffset = isLeft ? -340 : 50;
          const yOffset = -50;
          
          return (
            <motion.div
               key={index}
               className={`absolute w-80 ${isLeft ? "text-right" : "text-left"}`}
               style={{
                 left: outerPos.x + (isLeft ? -350 : 50),
                 top: outerPos.y - 60
               }}
               initial={{ opacity: 0, x: isLeft ? 20 : -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 2 + index * 0.2 }}
            >
               <div className={`flex flex-col ${isLeft ? "items-end" : "items-start"}`}>
                  <p className="text-gray-400 text-sm font-medium mb-1">Phase {["I", "II", "III", "IV"][index]}:</p>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-2">{phaseLabel}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {/* Display actual dynamic action text here */}
                    {dir.action || "No action data available."}
                  </p>
                  
                  {/* Icon floating near the Text? No, icon is in the circle */}
               </div>
            </motion.div>
          );
      })}
      
      {/* Overlay Icons on the circles */}
      {directions.map((dir, index) => {
         const angles = [180, 270, 0, 90]; 
         const angle = angles[index % 4];
         const outerPos = getPos(angle, radiusRing + 80);
         const PhaseIcon = defaultPhases[index % 4].icon;

         return (
            <motion.div
              key={`icon-${index}`}
              className="absolute z-10 flex items-center justify-center pointer-events-none"
              style={{ left: outerPos.x - 12, top: outerPos.y - 12 }} // centered 24x24 icon? radius is 24, so size 48 diameter?
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.5 }}
            >
               {/* The circle radius was 24, so diameter 48. inner icon should be centered. */}
               {/* Coordinates for outerPos are center of circle. */}
               {/* We need to correct position to top/left of div to center it? No, if we use cx/cy in svg... */}
               {/* But I want to render Lucide Icon (HTML) on top of SVG? Or use foreignObject? */}
               {/* Easier to use absolute div on top of svg */}
            </motion.div>
         )
      })}
      
      {/* Re-render Icons as absolute divs to easily center */}
      {directions.map((dir, index) => {
           const angles = [180, 270, 0, 90]; 
           const angle = angles[index % 4];
           const outerPos = getPos(angle, radiusRing + 80);
           const PhaseIcon = defaultPhases[index % 4].icon;
           
           return (
             <motion.div
               key={`icon-real-${index}`}
               className="absolute w-12 h-12 flex items-center justify-center text-[#F97316]"
               style={{ 
                 left: outerPos.x, 
                 top: outerPos.y, 
                 transform: 'translate(-50%, -50%)' 
                }}
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1.8 + index*0.2 }}
             >
                <PhaseIcon size={24} strokeWidth={3} />
             </motion.div>
           );
      })}

    </div>
  );
};

const AiSalesDirectionPage = () => {
    const { t } = useTranslation();
    const authUser = useSelector((state) => state.auth.user);
    
    // Hardcoded directions for visual demo if API empty (to match Screenshot feel)
    // In real usage, this falls back to API data
    const { data, isLoading } = useGetAiSalesDirectionQuery(
        { companyId: authUser?.companyId },
        { skip: !authUser?.companyId }
    );

    const apiDirections = Array.isArray(data?.directions) ? data.directions : [];
    
    // Mock data for the screenshot look if no API data or partial data
    const mockDirections = [
        { title: "Analysis", action: "Conduct extensive field studies to understand how your users think." },
        { title: "Design", action: "Create a well-polished interface prototype that breathes with the user." },
        { title: "Implementation", action: "Converting the prototype into a more refined final product." },
        { title: "Deployment", action: "Usability testing lets us measure the final product against goals." }
    ];

    // Ensure we always have 4 items for the design
    const displayDirections = [...mockDirections];
    
    // Overlay available API data
    if (apiDirections.length > 0) {
        apiDirections.forEach((dir, index) => {
            if (index < 4) {
                displayDirections[index] = {
                    ...displayDirections[index], // Keep default title if missing
                    ...dir,
                    // If API returns mainly 'action', use that. 
                    // If it returns 'message' (common in errors), use that as action to show the error.
                    action: dir.action || dir.message || dir.description || mockDirections[index].action
                };
            }
        });
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0d1117] flex items-center justify-center p-10 overflow-hidden">
             {isLoading ? (
                 <div className="flex items-center justify-center animate-pulse">
                     <div className="w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                 </div>
             ) : (
                 <CircularStrategyMap directions={displayDirections} />
             )}
        </div>
    );
};

export default AiSalesDirectionPage;
