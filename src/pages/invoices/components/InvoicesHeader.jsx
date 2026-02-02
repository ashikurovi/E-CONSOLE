import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicesHeader({ onNewInvoice }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Invoices
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and track your invoices
        </p>
      </div>
      <Button
        className="bg-[#5347CE] hover:bg-[#4338ca] text-white px-6 shadow-lg shadow-[#5347CE]/20"
        onClick={onNewInvoice}
      >
        <Plus className="w-4 h-4 mr-2" />
        New Invoice
      </Button>
    </div>
  );
}
