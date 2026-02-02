import React from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateInvoiceFooter({
  onCancel,
  onSave,
  isLoading,
}) {
  return (
    <div className="flex justify-between items-center pt-10 border-t border-gray-100 dark:border-gray-800">
      <Button
        variant="outline"
        className="px-10 border-gray-200 dark:border-gray-700"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className="px-10 bg-[#7c3aed] hover:bg-[#6d28d9] text-white"
        onClick={onSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Save
      </Button>
    </div>
  );
}
