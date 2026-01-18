import React, { useState } from "react";
import {
  useGetReturnRequestsQuery,
  useCreateReturnRequestMutation,
  useGetReturnRequestQuery,
} from "@/features/steadfast/steadfastApiSlice";
import toast from "react-hot-toast";
import TextField from "@/components/input/TextField";
import PrimaryButton from "@/components/buttons/primary-button";
import ReusableTable from "@/components/table/reusable-table";
import { Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const ReturnRequests = () => {
  const { data: returnRequests = [], isLoading, refetch } = useGetReturnRequestsQuery();
  const [createReturnRequest, { isLoading: isCreating }] = useCreateReturnRequestMutation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    consignment_id: "",
    invoice: "",
    tracking_code: "",
    reason: "",
  });
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const { data: selectedRequest } = useGetReturnRequestQuery(selectedRequestId, {
    skip: !selectedRequestId,
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const identifier = formData.consignment_id || formData.invoice || formData.tracking_code;
    if (!identifier) {
      toast.error("Please provide consignment_id, invoice, or tracking_code");
      return;
    }

    try {
      const body = {
        ...(formData.consignment_id && { consignment_id: formData.consignment_id }),
        ...(formData.invoice && { invoice: formData.invoice }),
        ...(formData.tracking_code && { tracking_code: formData.tracking_code }),
        ...(formData.reason && { reason: formData.reason }),
      };

      await createReturnRequest(body).unwrap();
      toast.success("Return request created successfully");
      setShowCreateForm(false);
      setFormData({
        consignment_id: "",
        invoice: "",
        tracking_code: "",
        reason: "",
      });
      refetch();
    } catch (error) {
      const errorMessage = error?.data?.message || "Failed to create return request";
      const errorDetails = error?.data?.details;
      
      if (error?.status === 429) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 }
        );
      } else if (error?.status === 401) {
        toast.error(
          `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ""}`,
          { duration: 6000 }
        );
      } else {
        toast.error(errorMessage);
      }
      console.error("Create return request error:", error);
    }
  };

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    approved: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    processing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    completed: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const headers = [
    { header: "ID", field: "id" },
    { header: "Consignment ID", field: "consignment_id" },
    { header: "Reason", field: "reason" },
    { header: "Status", field: "status" },
    { header: "Created At", field: "created_at" },
    { header: "Actions", field: "actions" },
  ];

  const tableData = returnRequests.map((request) => ({
    id: request.id,
    consignment_id: request.consignment_id || "-",
    reason: request.reason || "-",
    status: (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[request.status] || statusColors.pending
        }`}
      >
        {request.status?.toUpperCase()}
      </span>
    ),
    created_at: request.created_at
      ? new Date(request.created_at).toLocaleString()
      : "-",
    actions: (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setSelectedRequestId(request.id)}
        className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Return Requests</h3>
        <PrimaryButton
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Return Request
        </PrimaryButton>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 border border-black/10 dark:border-white/10 rounded-lg">
          <h4 className="text-md font-semibold mb-4">Create Return Request</h4>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Consignment ID"
                name="consignment_id"
                value={formData.consignment_id}
                onChange={(e) =>
                  setFormData({ ...formData, consignment_id: e.target.value })
                }
                placeholder="1424107"
              />
              <TextField
                label="Invoice ID"
                name="invoice"
                value={formData.invoice}
                onChange={(e) =>
                  setFormData({ ...formData, invoice: e.target.value })
                }
                placeholder="INV-001"
              />
              <TextField
                label="Tracking Code"
                name="tracking_code"
                value={formData.tracking_code}
                onChange={(e) =>
                  setFormData({ ...formData, tracking_code: e.target.value })
                }
                placeholder="15BAEB8A"
              />
            </div>
            <TextField
              label="Reason (Optional)"
              name="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Return reason"
              multiline
              rows={2}
            />
            <div className="flex gap-2">
              <PrimaryButton type="submit" isLoading={isCreating}>
                Create Request
              </PrimaryButton>
              <PrimaryButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    consignment_id: "",
                    invoice: "",
                    tracking_code: "",
                    reason: "",
                  });
                }}
              >
                Cancel
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      <ReusableTable
        data={tableData}
        headers={headers}
        total={returnRequests.length}
        isLoading={isLoading}
        py="py-2"
      />

      {selectedRequest && (
        <div className="mt-6 p-4 border border-black/10 dark:border-white/10 rounded-lg">
          <h4 className="text-md font-semibold mb-4">Return Request Details</h4>
          <pre className="text-xs font-mono overflow-x-auto">
            {JSON.stringify(selectedRequest, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ReturnRequests;
