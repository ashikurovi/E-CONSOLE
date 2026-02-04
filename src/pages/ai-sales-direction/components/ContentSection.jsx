import { motion } from "framer-motion";
import { CheckCircle2, Award } from "lucide-react";
import TimelineItem from "./TimelineItem";
import CircularStrategyMap from "./CircularStrategyMap";

// Content Section
const ContentSection = ({ directions, getDisplayDirection, t }) => {
  return (
    <div className="relative pb-16">
      {/* Mobile Timeline */}
      <div className="block lg:hidden space-y-4 max-w-3xl mx-auto">
        {directions.map((dir, idx) => {
          const disp = getDisplayDirection(idx);
          const direction =
            typeof dir === "object" && dir !== null
              ? dir
              : {
                  title: t("aiSalesDirection.actionStep"),
                  action: String(dir),
                  priority: "medium",
                };

          return (
            <TimelineItem
              key={idx}
              direction={direction}
              index={idx}
              total={directions.length}
              displayTitle={disp?.title}
              displayAction={disp?.action}
              t={t}
            />
          );
        })}
      </div>

      {/* Desktop Circular View */}
      <div className="hidden lg:block">
        <CircularStrategyMap
          directions={directions}
          getDisplayDirection={getDisplayDirection}
          t={t}
        />
      </div>

      {/* Completion Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: directions.length * 0.15 + 0.8 }}
        className="mt-12 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 border-2 border-green-100 dark:border-green-900/30 text-base font-black shadow-xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
          <CheckCircle2 className="w-5 h-5 relative z-10" />
          <span className="relative z-10">
            {t("aiSalesDirection.allInsightsLoaded")}
          </span>
          <Award className="w-5 h-5 relative z-10" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ContentSection;
