import React from "react";
import ProductsStatCard from "@/pages/products/components/list/ProductsStatCard";

const CustomerStatsSection = ({ statCards }) => {
  if (!statCards?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <ProductsStatCard key={index} stat={stat} index={index} />
      ))}
    </div>
  );
};

export default CustomerStatsSection;

