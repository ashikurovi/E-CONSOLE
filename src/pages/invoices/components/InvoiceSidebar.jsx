import React from "react";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function InvoiceSidebar({ invoiceData, setInvoiceData }) {
  return (
    <div className="lg:col-span-4 flex flex-col items-end space-y-6">
      <div className="w-full max-w-[240px] p-6 rounded-xl bg-gray-50 dark:bg-black/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-2">
        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1a1f26] flex items-center justify-center text-[#7c3aed] shadow-sm">
          <span className="text-xl font-bold">S</span>
        </div>
        <span className="text-xl font-bold dark:text-white">SquadCart</span>
      </div>
      <div className="w-full space-y-4">
        <select
          value={invoiceData.status}
          onChange={(e) =>
            setInvoiceData({ ...invoiceData, status: e.target.value })
          }
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
        >
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          defaultValue="currency"
          className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm"
        >
          <option value="currency">Currency</option>
          <option value="usd">USD</option>
          <option value="bdt">BDT</option>
        </select>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="tax"
              checked={invoiceData.enableTax}
              onCheckedChange={(val) =>
                setInvoiceData({ ...invoiceData, enableTax: val })
              }
            />
            <label htmlFor="tax" className="text-xs">
              Enable tax
            </label>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
