import React from "react";
import { useTranslation } from "react-i18next";
import { useGetBalanceQuery } from "@/features/steadfast/steadfastApiSlice";
import { DollarSign, RefreshCw } from "lucide-react";
import PrimaryButton from "@/components/buttons/primary-button";

const CheckBalance = () => {
  const { t } = useTranslation();
  const { data, isLoading, refetch } = useGetBalanceQuery();

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">{t("steadfast.currentBalance")}</h3>

      <div className="p-6 border border-black/10 dark:border-white/10 rounded-lg bg-white/50 dark:bg-white/5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-black/60 dark:text-white/60">{t("steadfast.currentBalance")}</p>
              <p className="text-3xl font-bold">
                {isLoading ? (
                  <span className="text-black/30 dark:text-white/30">{t("steadfast.loading")}</span>
                ) : (
                  `৳${data?.current_balance?.toLocaleString("en-BD") || "0.00"}`
                )}
              </p>
            </div>
          </div>
          <PrimaryButton
            onClick={() => refetch()}
            isLoading={isLoading}
            className="px-8 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black backdrop-blur-md shadow-lg border border-white/20 hover:!bg-black dark:hover:!bg-white transition-all duration-300 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("steadfast.refresh")}
          </PrimaryButton>
        </div>
        <p className="text-xs text-black/50 dark:text-white/50 mt-4">
          {t("steadfast.lastUpdated")}: {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default CheckBalance;
