import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateBulkOrdersMutation,
  useGetStoresQuery,
  useGetCitiesQuery,
} from "@/features/pathao/pathaoApiSlice";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Download, FileText, AlertCircle, CheckCircle, XCircle, Loader2, Package, Sparkles } from "lucide-react";

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
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Premium Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.bulkCreateOrders")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                {t("pathao.bulkCreateOrdersDesc") || "Upload a CSV file to create multiple orders at once"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-7">
          {/* Instructions Card */}
          <Card className="border-2 border-[#8B5CF6]/20  rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-[#8B5CF6]/10 bg-white/50 dark:bg-gray-950/50 pb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {t("pathao.howToUseBulkOrder")}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Follow these simple steps to create orders in bulk
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ol className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep1") || "Download the CSV template"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep2") || "Fill in your order details"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep3") || "Upload the completed CSV file"}
                  </p>
                </li>
                <li className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <p className="text-[15px] text-gray-700 dark:text-gray-300 pt-1">
                    {t("pathao.bulkOrderStep4") || "Review and submit your orders"}
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Download Template Button */}
          <div>
            <Button
              onClick={downloadTemplate}
              className="group h-14 px-8 text-base font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300"
            >
              <Download className="mr-3 h-5 w-5 group-hover:translate-y-0.5 transition-transform duration-300" />
              {t("pathao.downloadCsvTemplate")}
            </Button>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 pb-5">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {t("pathao.uploadCsvFile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed border-[#8B5CF6]/30 rounded-2xl p-12 text-center hover:bg-[#8B5CF6]/5 hover:border-[#8B5CF6]/50 transition-all duration-300 cursor-pointer">
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
                  className="cursor-pointer flex flex-col items-center gap-4 w-full h-full"
                >
                  <div className="p-5 bg-gradient-to-br from-[#8B5CF6]/10 to-[#7C3AED]/10 rounded-2xl">
                    <Upload className="h-10 w-10 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                      {t("pathao.clickToUploadCsv")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t("pathao.orDragAndDrop")}
                    </p>
                  </div>
                </label>
              </div>

              {file && (
                <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                      <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                        {file.name}
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        {orders.length} orders detected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="px-4 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors duration-200"
                  >
                    {t("pathao.remove")}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Preview */}
          {orders.length > 0 && (
            <Card className="border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 rounded-3xl overflow-hidden">
              <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 bg-gradient-to-r from-[#8B5CF6]/5 to-white dark:from-[#8B5CF6]/10 dark:to-gray-900 pb-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("pathao.ordersPreview", { count: orders.length })}
                  </CardTitle>
                  <div className="px-4 py-2 bg-[#8B5CF6] text-white text-sm font-bold rounded-full">
                    {orders.length} Orders
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">#</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t("pathao.orderId")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t("pathao.recipient")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t("customers.phone")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t("pathao.city")}</th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300">{t("pathao.amountToCollect")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {orders.map((order, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#8B5CF6]/5 dark:hover:bg-[#8B5CF6]/10 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{index + 1}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{order.merchant_order_id}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{order.recipient_name}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{order.recipient_phone}</td>
                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {cities.find(c => c.city_id === order.recipient_city)?.city_name || order.recipient_city}
                          </td>
                          <td className="px-6 py-4 font-semibold text-[#8B5CF6]">৳{order.amount_to_collect}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {orders.length > 0 && (
            <div className="flex gap-4">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="group flex-1 h-14 text-base font-bold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                {!isLoading && <CheckCircle className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />}
                {t("pathao.createOrdersCount", { count: orders.length })}
              </Button>
              <Button
                onClick={clearFile}
                disabled={isLoading}
                className="h-14 px-8 text-base font-semibold border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all duration-300"
              >
                {t("common.cancel")}
              </Button>
            </div>
          )}

          {/* Results */}
          {results && (
            <Card className={`border-2 rounded-3xl overflow-hidden ${
              results.success
                ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-900/20 dark:via-gray-900 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                : "bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-900/20 dark:via-gray-900 dark:to-red-900/10 border-red-200 dark:border-red-800"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    results.success
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}>
                    {results.success ? (
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-xl font-bold mb-3 ${
                      results.success
                        ? "text-emerald-900 dark:text-emerald-100"
                        : "text-red-900 dark:text-red-100"
                    }`}>
                      {results.success ? t("pathao.bulkOrderCreated") : t("pathao.bulkOrderFailed")}
                    </h4>
                    
                    {results.success && (
                      <div className="space-y-2 text-[15px] text-emerald-800 dark:text-emerald-200">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{t("pathao.totalOrders")}:</span>
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full font-bold">{results.total}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{t("pathao.successful")}:</span>
                          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full font-bold">{results.successful}</span>
                        </div>
                        {results.failed > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{t("pathao.failed")}:</span>
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full font-bold">{results.failed}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!results.success && (
                      <p className="text-[15px] font-medium text-red-800 dark:text-red-200">
                        {results.error}
                      </p>
                    )}

                    {results.details && results.details.length > 0 && (
                      <div className="mt-4 p-4 bg-white/50 dark:bg-gray-950/50 rounded-xl border border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">{t("pathao.details")}:</p>
                        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                          {results.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[#8B5CF6] mt-1">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CSV Format Reference */}
          <Card className="border-2 border-gray-100 dark:border-gray-800 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 rounded-3xl overflow-hidden">
            <CardHeader className="border-b-2 border-gray-100 dark:border-gray-800 pb-5">
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                {t("pathao.csvFormatReference")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5 text-[15px]">
                <div>
                  <p className="font-bold text-[#8B5CF6] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full"></span>
                    {t("pathao.requiredFields")}:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 ml-4">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">store_id</code>
                      <span className="text-xs text-gray-500">(numeric)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">merchant_order_id</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_name</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_phone</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_address</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_city</code>
                      <span className="text-xs text-gray-500">(ID)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_zone</code>
                      <span className="text-xs text-gray-500">(ID)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">recipient_area</code>
                      <span className="text-xs text-gray-500">(ID)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">delivery_type</code>
                      <span className="text-xs text-gray-500">(48/12)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">item_type</code>
                      <span className="text-xs text-gray-500">(1/2)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">item_quantity</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">item_weight</code>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">amount_to_collect</code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {t("pathao.optionalFields")}:
                  </p>
                  <div className="flex flex-wrap gap-3 ml-4">
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">item_description</code>
                    <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300">special_instruction</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateOrder;