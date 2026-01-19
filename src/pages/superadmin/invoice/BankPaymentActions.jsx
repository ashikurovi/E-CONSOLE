import React, { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";
import { useVerifyBankPaymentMutation, useRejectBankPaymentMutation } from "@/features/invoice/invoiceApiSlice";

const BankPaymentActions = ({ invoice }) => {
  const [verifyBankPayment, { isLoading: isVerifying }] = useVerifyBankPaymentMutation();
  const [rejectBankPayment, { isLoading: isRejecting }] = useRejectBankPaymentMutation();
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleVerify = async () => {
    if (!window.confirm(`Verify bank payment for invoice ${invoice.invoiceNumber}?`)) {
      return;
    }

    const res = await verifyBankPayment(invoice.id);
    if (res?.data) {
      toast.success("Bank payment verified successfully");
    } else {
      toast.error(res?.error?.data?.message || "Failed to verify payment");
    }
  };

  const handleReject = async () => {
    const res = await rejectBankPayment({
      id: invoice.id,
      reason: rejectReason || undefined,
    });
    
    if (res?.data) {
      toast.success("Bank payment rejected");
      setShowRejectDialog(false);
      setRejectReason("");
    } else {
      toast.error(res?.error?.data?.message || "Failed to reject payment");
    }
  };

  // Don't show actions if no bank payment or already verified/rejected
  if (!invoice?.bankPayment) {
    return null;
  }

  const { status } = invoice.bankPayment;

  return (
    <div className="flex items-center gap-2">
      {status === "pending" && (
        <>
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={isVerifying}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isVerifying ? "Verifying..." : "Approve Payment"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={isRejecting}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject Payment
          </Button>
        </>
      )}

      {status === "verified" && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Payment Verified
          </span>
        </div>
      )}

      {status === "rejected" && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            Payment Rejected
          </span>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Bank Payment</DialogTitle>
            <p className="text-sm text-black/60 dark:text-white/60 mt-2">
              Invoice: {invoice.invoiceNumber}
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                You are about to reject this bank payment. This action will update the payment status.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70 dark:text-white/70">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <p className="text-xs text-black/50 dark:text-white/50">
                Providing a reason helps the customer understand why the payment was rejected.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isRejecting ? "Rejecting..." : "Reject Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankPaymentActions;
