import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateBulkOrdersMutation } from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/buttons/primary-button";
import { Upload, Download } from "lucide-react";

const BulkOrder = () => {
  const { t } = useTranslation();
  const [createBulkOrders, { isLoading }] = useCreateBulkOrdersMutation();
  const [ordersJson, setOrdersJson] = useState("");
  const [results, setResults] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const parsed = JSON.parse(content);
        setOrdersJson(JSON.stringify(parsed, null, 2));
        toast.success(t("steadfast.fileLoadedSuccess"));
      } catch (error) {
        toast.error(t("steadfast.invalidJsonFile"));
        console.error("File read error:", error);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ordersJson.trim()) {
      toast.error(t("steadfast.provideOrdersData"));
      return;
    }

    try {
      const orders = JSON.parse(ordersJson);

      if (!Array.isArray(orders)) {
        toast.error(t("steadfast.ordersMustBeArray"));
        return;
      }

      if (orders.length > 500) {
        toast.error(t("steadfast.max500Orders"));
        return;
      }

      // Validate each order
      const invalidOrders = orders.filter(
        (order) =>
          !order.invoice ||
          !order.recipient_name ||
          !order.recipient_phone ||
          !order.recipient_address ||
          order.cod_amount === undefined,
      );

      if (invalidOrders.length > 0) {
        toast.error(
          t("steadfast.ordersMissingFields", { count: invalidOrders.length }),
        );
        return;
      }

      const result = await createBulkOrders(orders).unwrap();
      setResults(result);

      const successCount = result.filter((r) => r.status === "success").length;
      const errorCount = result.filter((r) => r.status === "error").length;

      toast.success(
        t("steadfast.bulkOrderSuccess", {
          success: successCount,
          failed: errorCount,
        }),
      );
    } catch (error) {
      const errorMessage =
        error?.data?.message || t("steadfast.bulkOrderFailed");
      const errorDetails = error?.data?.details;

      if (error?.status === 429) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else if (error?.status === 401) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 },
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Bulk order error:", error);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        invoice: "INV-001",
        recipient_name: "John Doe",
        recipient_address: "House 44, Road 2/A, Dhanmondi, Dhaka 1209",
        recipient_phone: "01711111111",
        cod_amount: "1000.00",
        note: "Deliver within 3 PM",
        item_description: "Sample item",
        total_lot: "1",
        delivery_type: 0,
      },
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk-order-template.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">
        {t("steadfast.bulkOrderCreate")}
      </h3>
      <p className="text-sm text-black/60 dark:text-white/60 mb-4">
        {t("steadfast.bulkOrderDesc")}
      </p>

      <div className="flex gap-4 mb-6">
        <label className="flex items-center gap-2 px-6 py-2.5 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-lg cursor-pointer hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 shadow-sm">
          <Upload className="h-4 w-4" />
          <span className="font-medium">{t("steadfast.uploadJsonFile")}</span>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-6 py-2.5 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-lg hover:bg-white/80 dark:hover:bg-white/20 transition-all duration-300 shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span className="font-medium">{t("steadfast.downloadTemplate")}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
            {t("steadfast.ordersJsonLabel")}
          </label>
          <textarea
            value={ordersJson}
            onChange={(e) => setOrdersJson(e.target.value)}
            placeholder='[{"invoice": "INV-001", "recipient_name": "John Doe", "recipient_phone": "01711111111", "recipient_address": "Address", "cod_amount": "1000.00"}]'
            className="border border-black/10 dark:border-white/10 py-4 px-6 bg-white/50 dark:bg-white/5 w-full outline-none focus:border-black/20 dark:focus:border-white/30 dark:text-white/90 rounded-xl min-h-[300px] font-mono text-sm backdrop-blur-md shadow-inner transition-all duration-300"
            rows={15}
          />
        </div>
        <PrimaryButton
          type="submit"
          isLoading={isLoading}
          className="px-8 py-2.5 !bg-black/80 dark:!bg-white/90 !text-white dark:!text-black backdrop-blur-md shadow-lg border border-white/20 hover:!bg-black dark:hover:!bg-white transition-all duration-300"
        >
          {t("steadfast.createBulkOrders")}
        </PrimaryButton>
      </form>

      {results && (
        <div className="mt-6">
          <h4 className="text-md font-semibold mb-2">
            {t("steadfast.results")}
          </h4>
          <div className="max-h-96 overflow-y-auto border border-black/10 dark:border-white/10 rounded-xl p-6 bg-white/50 dark:bg-white/5 backdrop-blur-md shadow-inner">
            <pre className="text-xs font-mono overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOrder;
