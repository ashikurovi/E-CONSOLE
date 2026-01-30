import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetPaymentsQuery, useGetPaymentQuery } from "@/features/steadfast/steadfastApiSlice";
import ReusableTable from "@/components/table/reusable-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const Payments = () => {
  const { t } = useTranslation();
  const { data: payments = [], isLoading } = useGetPaymentsQuery();
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  
  const { data: paymentDetails } = useGetPaymentQuery(selectedPaymentId, {
    skip: !selectedPaymentId,
  });

  const headers = [
    { header: t("steadfast.paymentId"), field: "id" },
    { header: t("steadfast.amount"), field: "amount" },
    { header: t("steadfast.date"), field: "date" },
    { header: t("common.actions"), field: "actions" },
  ];

  const tableData = Array.isArray(payments)
    ? payments.map((payment) => ({
        id: payment.id || payment.payment_id || "-",
        amount: payment.amount
          ? `৳${Number(payment.amount).toLocaleString("en-BD")}`
          : "-",
        date: payment.date
          ? new Date(payment.date).toLocaleString()
          : payment.created_at
          ? new Date(payment.created_at).toLocaleString()
          : "-",
        actions: (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedPaymentId(payment.id || payment.payment_id)}
            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
          >
            <Eye className="h-4 w-4" />
          </Button>
        ),
      }))
    : [];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t("steadfast.paymentsTitle")}</h3>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={payments.length}
        isLoading={isLoading}
        py="py-2"
      />

      {paymentDetails && (
        <div className="mt-6 p-4 border border-black/10 dark:border-white/10 rounded-lg">
          <h4 className="text-md font-semibold mb-4">{t("steadfast.paymentDetails")}</h4>
          <pre className="text-xs font-mono overflow-x-auto">
            {JSON.stringify(paymentDetails, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Payments;
