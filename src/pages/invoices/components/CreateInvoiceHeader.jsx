import React from "react";
import { ChevronLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateInvoiceHeader({ onBack, onPreview }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full bg-white dark:bg-[#1a1f26] shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Invoice
        </h1>
      </div>
      <Button
        variant="outline"
        className="bg-white dark:bg-[#1a1f26] border-gray-200 dark:border-gray-800"
        onClick={onPreview}
      >
        <Eye className="w-4 h-4 mr-2" />
        Preview
      </Button>
    </div>
  );
}
