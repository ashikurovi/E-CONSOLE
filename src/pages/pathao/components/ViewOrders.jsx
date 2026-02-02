import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetOrdersQuery, useViewOrderQuery } from "@/features/pathao/pathaoApiSlice";
import { Package, Search, Eye, RefreshCw, Filter, FileText, Smartphone, DollarSign, MapPin, User, Calendar, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

const ViewOrders = () => {
  const { t } = useTranslation();
  const { data: ordersData, isLoading, refetch } = useGetOrdersQuery();
  const [searchConsignmentId, setSearchConsignmentId] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);
  
  const { data: singleOrderData, isLoading: isLoadingOrder } = useViewOrderQuery(
    searchConsignmentId,
    { skip: !shouldFetch || !searchConsignmentId }
  );

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSearch = (data) => {
    setSearchConsignmentId(data.consignment_id);
    setShouldFetch(true);
  };

  const orders = ordersData?.data?.data || [];
  const singleOrder = singleOrderData?.data?.data;

  return (
    <div className="min-h-screen  dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-7">
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-2xl">
              <Package className="w-5 h-5 text-white" />
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
            className="group h-12 px-6 text-base font-semibold border-2 border-[#8B5CF6]/20 bg-white dark:bg-gray-900 text-[#8B5CF6] hover:bg-[#8B5CF6]/5 dark:hover:bg-[#8B5CF6]/10 rounded-2xl transition-all duration-300"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
            {t("steadfast.refresh")}
          </Button>
        </div>

        {/* Search by Consignment ID */}
        <div className="border-2 border-[#8B5CF6]/20 bg-gradient-to-br from-[#8B5CF6]/5 via-white to-[#8B5CF6]/5 dark:from-[#8B5CF6]/10 dark:via-gray-900 dark:to-[#8B5CF6]/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b-2 border-[#8B5CF6]/10 bg-white/50 dark:bg-gray-950/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
                <Search className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("pathao.searchByConsignmentId")}
              </h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter a consignment ID to view detailed order information
            </p>
            
            <form onSubmit={handleSubmit(onSearch)} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
              <div className="flex-1">
                <input
                  {...register("consignment_id", { required: t("pathao.consignmentIdRequired") })}
                  placeholder={t("pathao.enterConsignmentId")}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] focus:border-transparent transition-all text-[15px] font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                {errors.consignment_id && (
                  <span className="text-red-500 text-xs font-medium ml-1 mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.consignment_id.message}
                  </span>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={isLoadingOrder}
                className="group h-14 px-8 text-base font-bold bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] text-white rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingOrder ? (
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                )}
                {t("pathao.view")}
              </Button>
            </form>
          </div>

          {/* Single Order Details */}
          {singleOrder && (
            <div className="p-6">
              <div className="bg-white dark:bg-gray-950/50 rounded-2xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-[#8B5CF6]/10 to-[#8B5CF6]/5 border-b-2 border-[#8B5CF6]/10 flex items-center justify-between">
                  <span className="font-bold text-[#8B5CF6] flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5" />
                    Order Details
                  </span>
                  <span className="px-4 py-2 rounded-full bg-[#8B5CF6] text-white text-sm font-bold">
                    {singleOrder.order_status}
                  </span>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Order Info */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-6 bg-[#8B5CF6] rounded-full"></div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Order Information
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/30 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                          {t("pathao.consignmentId")}
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white text-base">
                          {singleOrder.consignment_id}
                        </p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/30 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                          {t("pathao.merchantOrderId")}
                        </p>
                        <p className="font-bold text-gray-900 dark:text-white text-base">
                          {singleOrder.merchant_order_id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">
                          {t("pathao.amountToCollect")}
                        </p>
                      </div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400 text-2xl">
                        ৳{singleOrder.amount_to_collect}
                      </p>
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1.5 h-6 bg-[#8B5CF6] rounded-full"></div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Recipient Information
                      </h5>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-950/30 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {singleOrder.recipient_name?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white text-base mb-1">
                            {singleOrder.recipient_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Smartphone className="w-4 h-4 text-[#8B5CF6]" />
                            <span className="font-medium">{singleOrder.recipient_phone}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950/30 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-[#8B5CF6]/10 rounded-lg mt-0.5">
                            <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold uppercase tracking-wide">
                              Delivery Address
                            </p>
                            <p className="text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed">
                              {singleOrder.recipient_address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* All Orders Table */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("pathao.allOrders")}
            </h4>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-950/50 rounded-3xl border-2 border-gray-100 dark:border-gray-800">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#8B5CF6]/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="mt-4 text-base font-semibold text-gray-600 dark:text-gray-400">
                {t("pathao.loadingOrders")}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
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
            <div className="bg-white dark:bg-gray-950/50 rounded-3xl border-2 border-gray-100 dark:border-gray-800 overflow-hidden">
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