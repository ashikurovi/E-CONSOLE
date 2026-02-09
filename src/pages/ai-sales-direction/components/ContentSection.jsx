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
      <div className="hidden md:block">
        <CircularStrategyMap
          directions={directions}
          getDisplayDirection={getDisplayDirection}
          t={t}
        />
      </div>
    </div>
  );
};

export default ContentSection;
