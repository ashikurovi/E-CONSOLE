import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useGetOrdersQuery, useViewOrderQuery } from "@/features/pathao/pathaoApiSlice";
import { Package, Search, Eye, RefreshCw } from "lucide-react";
import PrimaryButton from "@/components/buttons/primary-button";
import TextField from "@/components/input/TextField";
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
    <div className="max-w-6xl">
      <h3 className="text-lg font-semibold mb-4">{t("pathao.viewOrdersTitle")}</h3>

      {/* Search by Consignment ID */}
      <div className="mb-6 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-black/5 dark:bg-white/5">
        <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t("pathao.searchByConsignmentId")}
        </h4>
        <form onSubmit={handleSubmit(onSearch)} className="flex gap-2">
          <div className="flex-1">
            <input
              {...register("consignment_id", { required: t("pathao.consignmentIdRequired") })}
              placeholder={t("pathao.enterConsignmentId")}
              className="border border-black/5 dark:border-gray-800 py-2.5 px-4 bg-gray-50 dark:bg-[#1a1f26] w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
            />
            {errors.consignment_id && (
              <span className="text-red-500 text-xs ml-1">{errors.consignment_id.message}</span>
            )}
          </div>
          <PrimaryButton type="submit" isLoading={isLoadingOrder}>
            <Eye className="h-4 w-4 mr-2" />
            {t("pathao.view")}
          </PrimaryButton>
        </form>

        {/* Single Order Details */}
        {singleOrder && (
          <div className="mt-4 p-4 border border-gray-100 dark:border-gray-800 rounded-lg bg-white dark:bg-[#1a1f26] space-y-6">
            {/* Order Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("pathao.orderInformation")}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("pathao.consignmentId")}</label>
                  <p className="font-medium">{singleOrder.consignment_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("pathao.merchantOrderId")}</label>
                  <p className="font-medium">{singleOrder.merchant_order_id}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("common.status")}</label>
                  <span className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                    {singleOrder.order_status}
                  </span>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("pathao.amountToCollect")}</label>
                  <p className="font-semibold text-lg">৳{singleOrder.amount_to_collect}</p>
                </div>
              </div>
            </div>

            {/* Recipient Information Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  {t("pathao.recipientInformation")}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("common.name")}</label>
                  <p className="font-medium">{singleOrder.recipient_name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("customers.phone")}</label>
                  <p className="font-medium">{singleOrder.recipient_phone}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-black/60 dark:text-white/60 block mb-1">{t("pathao.recipientAddress")}</label>
                  <p className="font-medium">{singleOrder.recipient_address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Orders */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-semibold">{t("pathao.allOrders")}</h4>
        <PrimaryButton onClick={() => refetch()} isLoading={isLoading} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          {t("steadfast.refresh")}
        </PrimaryButton>
      </div>

      {isLoading ? (
        <p className="text-black/60 dark:text-white/60">{t("pathao.loadingOrders")}</p>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center border border-gray-100 dark:border-gray-800 rounded-lg bg-black/5 dark:bg-white/5">
          <Package className="h-12 w-12 mx-auto mb-3 text-black/30 dark:text-white/30" />
          <p className="text-black/60 dark:text-white/60">{t("pathao.noOrdersFound")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="text-left py-3 px-2 font-semibold">{t("pathao.consignmentId")}</th>
                <th className="text-left py-3 px-2 font-semibold">{t("pathao.orderId")}</th>
                <th className="text-left py-3 px-2 font-semibold">{t("pathao.recipient")}</th>
                <th className="text-left py-3 px-2 font-semibold">{t("customers.phone")}</th>
                <th className="text-left py-3 px-2 font-semibold">{t("pathao.amountToCollect")}</th>
                <th className="text-left py-3 px-2 font-semibold">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.consignment_id}
                  className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <td className="py-3 px-2">{order.consignment_id}</td>
                  <td className="py-3 px-2">{order.merchant_order_id}</td>
                  <td className="py-3 px-2">{order.recipient_name}</td>
                  <td className="py-3 px-2">{order.recipient_phone}</td>
                  <td className="py-3 px-2">৳{order.amount_to_collect}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {order.order_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
