import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import {
  useGetRefundPoliciesQuery,
} from "@/features/refund-policy/refundPolicyApiSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const RefundPolicyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.auth.user);
  const { data: policies = [], isLoading } = useGetRefundPoliciesQuery({ companyId: authUser?.companyId });

  // Get the latest policy (most recent)
  const latestPolicy = policies.length > 0 ? policies[0] : null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{t("refundPolicy.title")}</h2>
        {latestPolicy ? (
          <Button
            size="sm"
            onClick={() => navigate("/refund-policy/edit")}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t("refundPolicy.edit")}
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => navigate("/refund-policy/create")}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("refundPolicy.create")}
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">{t("common.loading")}</div>
      ) : latestPolicy ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-black/5 dark:border-gray-800">
            <div 
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: latestPolicy.content || "" }}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Last updated: {latestPolicy.updatedAt ? new Date(latestPolicy.updatedAt).toLocaleString() : "-"}</p>
            <p>Created: {latestPolicy.createdAt ? new Date(latestPolicy.createdAt).toLocaleString() : "-"}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">{t("refundPolicy.noPolicyFound")}</p>
        </div>
      )}

    </div>
  );
};

export default RefundPolicyPage;
