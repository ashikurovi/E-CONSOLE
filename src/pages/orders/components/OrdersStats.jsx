import { useTranslation } from "react-i18next";
import OrderStatCard from "./OrderStatCard";

const OrdersStats = ({ stats }) => {
  const { t } = useTranslation();

  // Mock data for sparklines
  const sparklineData = [
    { value: 10 },
    { value: 25 },
    { value: 15 },
    { value: 30 },
    { value: 22 },
    { value: 45 },
    { value: 35 },
    { value: 55 },
  ];

  const orderStats = [
    {
      title: t("orders.statsTotal") || "Total Orders",
      value: stats?.total || 0,
      delta: "+25.2%",
      tone: "green",
    },
    {
      title: t("orders.statsPending") || "Pending",
      value: stats?.pending || 0,
      delta: "+5.2%",
      tone: "amber",
    },
    {
      title: t("orders.statsProcessing") || "Processing",
      value: stats?.processing || 0,
      delta: "+8.2%",
      tone: "blue",
    },
    {
      title: t("orders.statsPaid") || "Paid",
      value: stats?.paid || 0,
      delta: "+15.2%",
      tone: "green",
    },
    {
      title: t("orders.statsShipped") || "Shipped",
      value: stats?.shipped || 0,
      delta: "+10.2%",
      tone: "blue",
    },
    {
      title: t("orders.statsDelivered") || "Delivered",
      value: stats?.delivered || 0,
      delta: "+12.2%",
      tone: "green",
    },
    {
      title: t("orders.statsCancelledOrders") || "Cancelled",
      value: stats?.cancelled || 0,
      delta: "-1.2%",
      tone: "red",
    },
    {
      title: t("orders.statsRefunded") || "Refunded",
      value: stats?.refunded || 0,
      delta: "-0.5%",
      tone: "red",
    },
    {
      title: t("orders.statsUnpaid") || "Unpaid",
      value: stats?.unpaidCount || 0,
      delta: "+18.2%",
      tone: "amber",
    },
    {
      title: t("orders.statsRevenue") || "Total Revenue",
      value: `৳${Number(stats?.totalRevenue || 0).toLocaleString()}`,
      delta: "+22.2%",
      tone: "green",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {orderStats.map((stat, i) => (
        <OrderStatCard
          key={i}
          title={stat.title}
          value={stat.value}
          delta={stat.delta}
          tone={stat.tone}
          chartData={sparklineData}
        />
      ))}
    </div>
  );
};

export default OrdersStats;
