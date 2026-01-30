import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateBulkOrdersMutation,
  useGetStoresQuery,
  useGetCitiesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/buttons/primary-button";
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const BulkCreateOrder = () => {
  const { t } = useTranslation();
  const [createBulkOrders, { isLoading }] = useCreateBulkOrdersMutation();
  const { data: storesData } = useGetStoresQuery();
  const { data: citiesData } = useGetCitiesQuery();
  
  const [file, setFile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [results, setResults] = useState(null);
  const [parsing, setParsing] = useState(false);

  const stores = storesData?.data?.data || [];
  const cities = citiesData?.data?.data || [];

  // CSV Template
  const csvTemplate = `store_id,merchant_order_id,recipient_name,recipient_phone,recipient_address,recipient_city,recipient_zone,recipient_area,delivery_type,item_type,item_quantity,item_weight,amount_to_collect,item_description,special_instruction
1,ORDER001,John Doe,01712345678,"House 10, Road 5, Block A",1,1,1,48,2,1,0.5,1000,T-Shirt,Handle with care
1,ORDER002,Jane Smith,01812345678,"Flat 3B, Building 7",1,2,5,48,2,2,1.0,2000,Books,Fragile items`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathao_bulk_orders_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success(t("pathao.templateDownloaded"));
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error(t("pathao.uploadCsvOnly"));
      return;
    }

    setFile(selectedFile);
    setParsing(true);
    setResults(null);

    try {
      const text = await selectedFile.text();
      const parsedOrders = parseCSV(text);
      setOrders(parsedOrders);
      toast.success(t("pathao.parsedOrdersSuccess", { count: parsedOrders.length }));
    } catch (error) {
      toast.error(t("pathao.parseCsvFailed"));
      console.error("Parse error:", error);
      setOrders([]);
    } finally {
      setParsing(false);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const parsedOrders = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      if (values.length < headers.length) continue;

      const order = {};
      headers.forEach((header, index) => {
        let value = values[index]?.trim().replace(/^"|"$/g, "");
        
        // Convert numeric fields
        if ([
          "store_id",
          "recipient_city",
          "recipient_zone",
          "recipient_area",
          "delivery_type",
          "item_type",
          "item_quantity",
          "amount_to_collect"
        ].includes(header)) {
          value = Number(value);
        } else if (header === "item_weight") {
          value = parseFloat(value);
        }
        
        order[header] = value;
      });

      parsedOrders.push(order);
    }

    return parsedOrders;
  };

  const validateOrders = () => {
    const errors = [];
    orders.forEach((order, index) => {
      if (!order.store_id) errors.push(`Row ${index + 2}: Missing store_id`);
      if (!order.merchant_order_id) errors.push(`Row ${index + 2}: Missing merchant_order_id`);
      if (!order.recipient_name) errors.push(`Row ${index + 2}: Missing recipient_name`);
      if (!order.recipient_phone) errors.push(`Row ${index + 2}: Missing recipient_phone`);
      if (!order.recipient_address) errors.push(`Row ${index + 2}: Missing recipient_address`);
      if (!order.recipient_city) errors.push(`Row ${index + 2}: Missing recipient_city`);
      if (!order.recipient_zone) errors.push(`Row ${index + 2}: Missing recipient_zone`);
      if (!order.recipient_area) errors.push(`Row ${index + 2}: Missing recipient_area`);
    });
    return errors;
  };

  const handleSubmit = async () => {
    if (orders.length === 0) {
      toast.error(t("pathao.noOrdersToCreate"));
      return;
    }

    const validationErrors = validateOrders();
    if (validationErrors.length > 0) {
      toast.error(t("pathao.validationFailed", { error: validationErrors[0] }));
      console.error("All errors:", validationErrors);
      return;
    }

    try {
      const result = await createBulkOrders({ orders }).unwrap();
      
      if (result.code === 200 || result.type === "success") {
        const successCount = result.data?.success_count || orders.length;
        const failedCount = result.data?.failed_count || 0;
        
        setResults({
          success: true,
          total: orders.length,
          successful: successCount,
          failed: failedCount,
          details: result.data?.details || [],
        });

        toast.success(t("pathao.bulkOrderCreated") + ` ${successCount} ${t("pathao.successful")}, ${failedCount} ${t("pathao.failed")}`);
        
        // Reset form
        setFile(null);
        setOrders([]);
        document.getElementById("file-input").value = "";
      }
    } catch (error) {
      const errorMessage = error?.data?.message || t("pathao.bulkOrderCreateFailed");
      toast.error(errorMessage);
      console.error("Bulk order error:", error);
      
      setResults({
        success: false,
        error: errorMessage,
        details: error?.data?.errors || [],
      });
    }
  };

  const clearFile = () => {
    setFile(null);
    setOrders([]);
    setResults(null);
    document.getElementById("file-input").value = "";
  };

  return (
    <div className="max-w-4xl">
      <h3 className="text-lg font-semibold mb-4">{t("pathao.bulkCreateOrders")}</h3>
      
      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {t("pathao.howToUseBulkOrder")}
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>{t("pathao.bulkOrderStep1")}</li>
              <li>{t("pathao.bulkOrderStep2")}</li>
              <li>{t("pathao.bulkOrderStep3")}</li>
              <li>{t("pathao.bulkOrderStep4")}</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="mb-6">
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          {t("pathao.downloadCsvTemplate")}
        </button>
      </div>

      {/* Upload Section */}
      <div className="mb-6">
        <label className="text-black/70 dark:text-white/70 text-sm font-medium mb-3 block">
          {t("pathao.uploadCsvFile")}
        </label>
        <div className="border-2 border-dashed border-black/10 dark:border-white/10 rounded-lg p-8 text-center">
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={parsing || isLoading}
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            <Upload className="h-12 w-12 text-black/30 dark:text-white/30" />
            <div>
              <p className="text-sm font-medium text-black/70 dark:text-white/70">
                {t("pathao.clickToUploadCsv")}
              </p>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                {t("pathao.orDragAndDrop")}
              </p>
            </div>
          </label>
        </div>

        {file && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                {file.name}
              </span>
              <span className="text-xs text-green-700 dark:text-green-300">
                ({orders.length} orders)
              </span>
            </div>
            <button
              onClick={clearFile}
              className="text-xs text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 underline"
            >
              {t("pathao.remove")}
            </button>
          </div>
        )}
      </div>

      {/* Orders Preview */}
      {orders.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">
            {t("pathao.ordersPreview", { count: orders.length })}
          </h4>
          <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-black/5 dark:bg-white/5 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">{t("pathao.orderId")}</th>
                    <th className="px-3 py-2 text-left">{t("pathao.recipient")}</th>
                    <th className="px-3 py-2 text-left">{t("customers.phone")}</th>
                    <th className="px-3 py-2 text-left">{t("pathao.city")}</th>
                    <th className="px-3 py-2 text-left">{t("pathao.amountToCollect")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={index}
                      className="border-t border-black/5 dark:border-white/5"
                    >
                      <td className="px-3 py-2">{index + 1}</td>
                      <td className="px-3 py-2">{order.merchant_order_id}</td>
                      <td className="px-3 py-2">{order.recipient_name}</td>
                      <td className="px-3 py-2">{order.recipient_phone}</td>
                      <td className="px-3 py-2">
                        {cities.find(c => c.city_id === order.recipient_city)?.city_name || order.recipient_city}
                      </td>
                      <td className="px-3 py-2">৳{order.amount_to_collect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {orders.length > 0 && (
        <div className="flex gap-3">
          <PrimaryButton
            onClick={handleSubmit}
            isLoading={isLoading}
            className="flex-1"
          >
            {t("pathao.createOrdersCount", { count: orders.length })}
          </PrimaryButton>
          <button
            onClick={clearFile}
            disabled={isLoading}
            className="px-4 py-2 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className={`mt-6 p-4 rounded-lg border ${
          results.success
            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
        }`}>
          <div className="flex items-start gap-3">
            {results.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className={`font-semibold mb-2 ${
                results.success
                  ? "text-green-900 dark:text-green-100"
                  : "text-red-900 dark:text-red-100"
              }`}>
                {results.success ? t("pathao.bulkOrderCreated") : t("pathao.bulkOrderFailed")}
              </h4>
              
              {results.success && (
                <div className="text-sm space-y-1 text-green-800 dark:text-green-200">
                  <p>{t("pathao.totalOrders")}: {results.total}</p>
                  <p>{t("pathao.successful")}: {results.successful}</p>
                  {results.failed > 0 && <p>{t("pathao.failed")}: {results.failed}</p>}
                </div>
              )}

              {!results.success && (
                <p className="text-sm text-red-800 dark:text-red-200">
                  {results.error}
                </p>
              )}

              {results.details && results.details.length > 0 && (
                <div className="mt-3 text-xs">
                  <p className="font-medium mb-1">{t("pathao.details")}:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    {results.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Format Reference */}
      <div className="mt-8 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg">
        <h4 className="text-sm font-semibold mb-2">{t("pathao.csvFormatReference")}</h4>
        <div className="text-xs space-y-1 text-black/60 dark:text-white/60">
          <p><strong>{t("pathao.requiredFields")}:</strong></p>
          <ul className="list-disc list-inside ml-2 space-y-0.5">
            <li>store_id (numeric)</li>
            <li>merchant_order_id (text)</li>
            <li>recipient_name, recipient_phone, recipient_address</li>
            <li>recipient_city, recipient_zone, recipient_area (numeric IDs)</li>
            <li>delivery_type (48=Normal, 12=On-Demand)</li>
            <li>item_type (1=Document, 2=Parcel)</li>
            <li>item_quantity, item_weight, amount_to_collect</li>
          </ul>
          <p className="mt-2"><strong>{t("pathao.optionalFields")}:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>item_description, special_instruction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateOrder;
