import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import {
  useGetRefundPoliciesQuery,
} from "@/features/refund-policy/refundPolicyApiSlice";
import RefundPolicyForm from "./components/RefundPolicyForm";
import RefundPolicyEditForm from "./components/RefundPolicyEditForm";

const RefundPolicyPage = () => {
  const { data: policies = [], isLoading } = useGetRefundPoliciesQuery();
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Get the latest policy (most recent)
  const latestPolicy = policies.length > 0 ? policies[0] : null;

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Refund Policy</h2>
        {latestPolicy ? (
          <Button
            size="sm"
            onClick={() => setEditingPolicy(latestPolicy)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : latestPolicy ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-black/5 dark:border-white/10">
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
          <p className="mb-4">No Refund Policy found. Click "Create" to add one.</p>
        </div>
      )}

      {isCreating && (
        <RefundPolicyForm
          onClose={() => setIsCreating(false)}
          onSuccess={() => setIsCreating(false)}
        />
      )}

      {editingPolicy && (
        <RefundPolicyEditForm
          policy={editingPolicy}
          onClose={() => setEditingPolicy(null)}
        />
      )}
    </div>
  );
};

export default RefundPolicyPage;
