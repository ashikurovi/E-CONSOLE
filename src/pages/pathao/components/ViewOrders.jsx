import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useGetOrdersQuery,
  useViewOrderQuery,
} from "@/features/pathao/pathaoApiSlice";
import {
  Package,
  Search,
  Eye,
  RefreshCw,
  Filter,
  FileText,
  Smartphone,
  DollarSign,
  MapPin,
  User,
  Calendar,
  Truck,
  Barcode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import Dropdown from "@/components/dropdown/dropdown";
import TextField from "@/components/input/TextField";
import toast from "react-hot-toast";

const ViewOrders = () => {
  const { t } = useTranslation();
  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const [searchType, setSearchType] = useState("consignment");
  const [searchValue, setSearchValue] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: singleOrderData,
    isLoading: isLoadingOrder,
    error: searchError,
  } = useViewOrderQuery(searchValue, { skip: !shouldFetch || !searchValue });

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error(t("pathao.enterSearchValue", "Please enter a search value"));
      return;
    }
    setShouldFetch(true);
  };

  const orders = ordersData?.data?.data || [];
  const singleOrder = singleOrderData?.data?.data;

  const searchOptions = [
    {
      label: t("pathao.consignmentId", "Consignment ID"),
      value: "consignment",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: t("pathao.merchantOrderId", "Merchant Order ID"),
      value: "merchant_order_id",
      icon: <FileText className="w-4 h-4" />,
    },
    // Tracking code might not be directly supported by this endpoint, but we can add it for UI parity
    // and maybe implement client-side filtering later if needed
  ];

  const currentOption = searchOptions.find((opt) => opt.value === searchType);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl shadow-lg shadow-[#8B5CF6]/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#8B5CF6] bg-clip-text text-transparent">
                {t("pathao.viewOrdersTitle")}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Track and manage your delivery orders
              </p>
            </div>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="group h-12 px-6 text-base font-semibold border-2 border-[#8B5CF6]/20 bg-white dark:bg-gray-900 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 dark:hover:bg-[#8B5CF6]/10 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
            />
            {t("steadfast.refresh")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Search */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-[#8B5CF6]/20 shadow-xl shadow-[#8B5CF6]/5 overflow-hidden h-full">
              <div className="p-6 border-b-2 border-[#8B5CF6]/10 bg-gradient-to-r from-[#8B5CF6]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl shadow-md shadow-[#8B5CF6]/20">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("pathao.trackOrder")}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-1">
                  Enter order details to find specific shipment information
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-1">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block uppercase tracking-wide">
                      {t("steadfast.searchBy", "Search By")}
                    </label>
                    <Dropdown
                      options={searchOptions}
                      setSelectedOption={(opt) => {
                        setSearchType(opt.value);
                        setSearchValue("");
                        setShouldFetch(false);
                      }}
                      className="w-full"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        {currentOption?.icon &&
                          React.cloneElement(currentOption.icon, {
                            className: "w-4 h-4 text-[#8B5CF6]",
                          })}
                        {currentOption?.label}
                      </div>
                    </Dropdown>
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex gap-2 items-end h-full">
                      <div className="flex-1">
                        <TextField
                          label={t("steadfast.enterValue", "Search Value")}
                          placeholder={
                            searchType === "consignment"
                              ? t(
                                  "pathao.enterConsignmentId",
                                  "Enter Consignment ID",
                                )
                              : t(
                                  "pathao.enterMerchantOrderId",
                                  "Enter Merchant Order ID",
                                )
                          }
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            setShouldFetch(false);
                          }}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleSearch}
                    disabled={isLoadingOrder}
                    className="w-full md:w-auto h-14 px-10 text-base font-bold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8B5CF6]/20 hover:shadow-xl hover:shadow-[#8B5CF6]/30 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoadingOrder ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5 mr-2" />
                        {t("pathao.trackShipment")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Result */}
          <div className="lg:col-span-1">
            {singleOrder ? (
              <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-emerald-100 dark:border-emerald-900/30 shadow-xl shadow-emerald-500/5 overflow-hidden h-full flex flex-col">
                <div className="p-5 border-b-2 border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-r from-emerald-50/50 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      Result Found
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wide">
                    {singleOrder.order_status}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Consignment ID
                    </p>
                    <p className="text-lg font-bold text-[#8B5CF6]">
                      {singleOrder.consignment_id}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">
                      Recipient
                    </p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">
                      {singleOrder.recipient_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />{" "}
                      {singleOrder.recipient_phone}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-xs text-emerald-600 uppercase font-bold mb-1">
                      Amount to Collect
                    </p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                      ৳{singleOrder.amount_to_collect}
                    </p>
                  </div>
                </div>
              </div>
            ) : searchError ? (
              <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-red-100 dark:border-red-900/30 shadow-xl shadow-red-500/5 overflow-hidden h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Order Not Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We couldn't find any order with that ID. Please check and try
                  again.
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden h-full flex flex-col items-center justify-center p-8 text-center opacity-60">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-full mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Ready to Track
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter a consignment ID to see the details here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Orders Table */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl shadow-md shadow-[#8B5CF6]/20">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("pathao.allOrders")}
            </h4>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-base font-semibold text-gray-600 dark:text-gray-400">
                {t("pathao.loadingOrders")}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[24px] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
              <div className="p-5 bg-gray-100 dark:bg-gray-800 rounded-2xl inline-block mb-4">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t("pathao.noOrdersFound")}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your orders will appear here once created
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-950/50 rounded-[24px] border-2 border-gray-100 dark:border-gray-800 overflow-hidden shadow-xl shadow-gray-200/50 dark:shadow-none">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 border-b-2 border-gray-100 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("pathao.consignmentId")}
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("pathao.orderId")}
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("pathao.recipient")}
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("customers.phone")}
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("pathao.amountToCollect")}
                      </th>
                      <th className="px-6 py-5 text-left font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-xs">
                        {t("common.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.map((order) => (
                      <tr
                        key={order.consignment_id}
                        className="group hover:bg-[#8B5CF6]/5 dark:hover:bg-[#8B5CF6]/10 transition-colors duration-200"
                      >
                        <td className="px-6 py-5">
                          <span className="font-bold text-[#8B5CF6] text-[15px]">
                            {order.consignment_id}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-[15px]">
                            {order.merchant_order_id}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#7C3AED]/20 flex items-center justify-center text-[#8B5CF6] font-bold text-sm border-2 border-[#8B5CF6]/20">
                              {order.recipient_name?.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white text-[15px]">
                              {order.recipient_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 text-[15px] font-medium">
                              {order.recipient_phone}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="font-bold text-gray-900 dark:text-white text-[15px]">
                            ৳{order.amount_to_collect}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 dark:from-blue-900/30 dark:to-blue-900/20 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-900/30">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            {order.order_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewOrders;
