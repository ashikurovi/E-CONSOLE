import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

const FraudPage = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fraudData, setFraudData] = useState(null);

  const runCheck = async () => {
    const phone = phoneNumber?.trim();
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://fraudchecker.link/free-fraud-checker-bd/api/search.php?phone=${encodeURIComponent(phone)}`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setFraudData(result.data);
        toast.success("Fraud check completed");
      } else {
        toast.error("No data found for this phone number");
        setFraudData(null);
      }
    } catch (error) {
      console.error("Fraud check error:", error);
      toast.error("Failed to check fraud data");
      setFraudData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeColor = (riskColor) => {
    switch (riskColor) {
      case "success":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "danger":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Fraud Checker</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-start md:items-end mb-4">
        <div className="flex-1 w-full md:w-auto">
          <label className="text-sm font-medium mb-1 block">Phone Number</label>
          <input
            type="text"
            placeholder="Enter phone number (e.g., 01581782193)"
            className="border rounded-md px-3 py-2 w-full dark:bg-[#242424]"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && runCheck()}
          />
        </div>

        <Button size="sm" variant="outline" onClick={runCheck} disabled={isLoading}>
          {isLoading ? "Checking..." : "Run Check"}
        </Button>
      </div>

      {fraudData && (
        <div className="space-y-4">
          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border border-black/10 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
              <p className="text-lg font-semibold">{fraudData.phoneNumber}</p>
            </div>
            <div className="p-4 rounded-lg border border-black/10 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
              <p className="text-lg font-semibold">{fraudData.totalOrders}</p>
            </div>
            <div className="p-4 rounded-lg border border-black/10 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">Delivered</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {fraudData.totalDelivered}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-black/10 dark:border-white/10">
              <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {fraudData.totalCancelled}
              </p>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="p-4 rounded-lg border border-black/10 dark:border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Risk Assessment</p>
                <p className="text-lg font-semibold mb-2">{fraudData.riskMessage}</p>
                <p className="text-sm">
                  Delivery Rate: <span className="font-semibold">{fraudData.deliveryRate}%</span>
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold uppercase ${getRiskBadgeColor(
                  fraudData.riskColor
                )}`}
              >
                {fraudData.riskLevel}
              </span>
            </div>
          </div>

          {/* Courier Breakdown */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Courier Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fraudData.couriers?.map((courier, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-black/10 dark:border-white/10 hover:shadow-md transition-shadow"
                >
                  <h4 className="text-lg font-semibold mb-3">{courier.name}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Total Orders</span>
                      <span className="font-semibold">{courier.orders}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Delivered</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {courier.delivered}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Cancelled</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {courier.cancelled}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/10 dark:border-white/10">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Delivery Rate</span>
                      <span className="font-bold text-lg">{courier.delivery_rate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Date */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last checked: {new Date(fraudData.searchDate).toLocaleString()}
          </div>
        </div>
      )}

      {!fraudData && !isLoading && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Enter a phone number to check fraud history
        </div>
      )}
    </div>
  );
};

export default FraudPage;