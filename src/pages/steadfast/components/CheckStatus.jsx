import React, { useState } from "react";
import {
  useGetStatusByConsignmentIdQuery,
  useGetStatusByInvoiceQuery,
  useGetStatusByTrackingCodeQuery,
} from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import PrimaryButton from "@/components/buttons/primary-button";
import TextField from "@/components/input/TextField";
import { Search } from "lucide-react";

const CheckStatus = () => {
  const [searchType, setSearchType] = useState("consignment");
  const [searchValue, setSearchValue] = useState("");
  const [shouldFetch, setShouldFetch] = useState(false);

  const {
    data: statusByCid,
    isLoading: loadingCid,
    refetch: refetchCid,
  } = useGetStatusByConsignmentIdQuery(searchValue, {
    skip: !shouldFetch || searchType !== "consignment" || !searchValue,
  });

  const {
    data: statusByInvoice,
    isLoading: loadingInvoice,
    refetch: refetchInvoice,
  } = useGetStatusByInvoiceQuery(searchValue, {
    skip: !shouldFetch || searchType !== "invoice" || !searchValue,
  });

  const {
    data: statusByTracking,
    isLoading: loadingTracking,
    refetch: refetchTracking,
  } = useGetStatusByTrackingCodeQuery(searchValue, {
    skip: !shouldFetch || searchType !== "tracking" || !searchValue,
  });

  const isLoading = loadingCid || loadingInvoice || loadingTracking;

  const handleSearch = () => {
    if (!searchValue.trim()) {
      toast.error("Please enter a search value");
      return;
    }
    setShouldFetch(true);
    
    if (searchType === "consignment") {
      refetchCid();
    } else if (searchType === "invoice") {
      refetchInvoice();
    } else {
      refetchTracking();
    }
  };

  const getStatusData = () => {
    if (searchType === "consignment") return statusByCid;
    if (searchType === "invoice") return statusByInvoice;
    return statusByTracking;
  };

  const statusData = getStatusData();

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    delivered_approval_pending: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    partial_delivered_approval_pending: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    cancelled_approval_pending: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    unknown_approval_pending: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
    partial_delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    hold: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    in_review: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    unknown: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Check Delivery Status</h3>

      <div className="space-y-4">
        <div>
          <label className="text-black/50 dark:text-white/50 text-sm ml-1 mb-2 block">
            Search By
          </label>
          <select
            value={searchType}
            onChange={(e) => {
              setSearchType(e.target.value);
              setSearchValue("");
              setShouldFetch(false);
            }}
            className="border border-black/5 dark:border-white/10 py-2.5 px-4 bg-bg50 w-full outline-none focus:border-green-300/50 dark:focus:border-green-300/50 dark:text-white/90 rounded"
          >
            <option value="consignment">Consignment ID</option>
            <option value="invoice">Invoice ID</option>
            <option value="tracking">Tracking Code</option>
          </select>
        </div>

        <div className="flex gap-2">
          <TextField
            placeholder={
              searchType === "consignment"
                ? "Enter Consignment ID"
                : searchType === "invoice"
                ? "Enter Invoice ID"
                : "Enter Tracking Code"
            }
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setShouldFetch(false);
            }}
            className="flex-1"
          />
          <PrimaryButton
            onClick={handleSearch}
            isLoading={isLoading}
            className="px-6"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </PrimaryButton>
        </div>

        {statusData && (
          <div className="mt-6 p-4 border border-black/10 dark:border-white/10 rounded-lg">
            <h4 className="text-md font-semibold mb-2">Status Result</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-black/60 dark:text-white/60">Status: </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[statusData.delivery_status] || statusColors.unknown
                  }`}
                >
                  {statusData.delivery_status?.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              {statusData.status && (
                <div>
                  <span className="text-sm text-black/60 dark:text-white/60">HTTP Status: </span>
                  <span className="text-sm font-medium">{statusData.status}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckStatus;
