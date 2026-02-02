import React from "react";
import { Button } from "@/components/ui/button";

export default function ExtraInfoSection({
  extraInfoTab,
  setExtraInfoTab,
  invoiceData,
  setInvoiceData,
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 dark:text-white underline decoration-[#7c3aed] decoration-2 underline-offset-8 mb-6">
        Extra Information
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={extraInfoTab === "notes" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "notes"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("notes")}
        >
          Add Notes
        </Button>
        <Button
          variant={extraInfoTab === "terms" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "terms"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("terms")}
        >
          Add Terms & Conditions
        </Button>
        <Button
          variant={extraInfoTab === "bank" ? "default" : "outline"}
          size="sm"
          className={
            extraInfoTab === "bank"
              ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
              : "border-gray-200 dark:border-gray-800"
          }
          onClick={() => setExtraInfoTab("bank")}
        >
          Add Bank Details
        </Button>
      </div>
      {extraInfoTab === "notes" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium">
            Additional Notes
          </label>
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            placeholder="Add any additional information..."
            value={invoiceData.notes}
            onChange={(e) =>
              setInvoiceData({ ...invoiceData, notes: e.target.value })
            }
          />
        </div>
      )}
      {extraInfoTab === "terms" && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium">
            Terms & Conditions
          </label>
          <textarea
            className="w-full h-32 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20"
            placeholder="Add terms and conditions..."
            value={invoiceData.termsAndConditions}
            onChange={(e) =>
              setInvoiceData({
                ...invoiceData,
                termsAndConditions: e.target.value,
              })
            }
          />
        </div>
      )}
      {extraInfoTab === "bank" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <label className="text-xs text-gray-500 font-medium block">
            Bank Details
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Bank Name</label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g. ABC Bank"
                value={invoiceData.bankDetails?.bankName || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      bankName: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Account Number</label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g. 782459739212"
                value={invoiceData.bankDetails?.accountNumber || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      accountNumber: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                IFSC / Routing Code
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder="e.g. ABC0001345"
                value={invoiceData.bankDetails?.ifscCode || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      ifscCode: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                Payment Reference
              </label>
              <input
                className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
                placeholder={`e.g. ${invoiceData.invoiceNumber || "Invoice number"}`}
                value={invoiceData.bankDetails?.paymentReference || ""}
                onChange={(e) =>
                  setInvoiceData({
                    ...invoiceData,
                    bankDetails: {
                      ...invoiceData.bankDetails,
                      paymentReference: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
