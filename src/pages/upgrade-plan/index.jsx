import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { 
  useCreateInvoiceMutation,
  useInitiateBkashPaymentMutation,
  useSubmitBankPaymentMutation,
  useGetInvoiceQuery,
} from "@/features/invoice/invoiceApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Check, Star, ArrowRight, Package, Zap, Crown, CreditCard, Building2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const UpgradePlanPage = () => {
  const dispatch = useDispatch();
  // Fetch user data from API instead of localStorage
  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useGetCurrentUserQuery();
  const { data: packages = [], isLoading } = useGetPackagesQuery();
  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();
  const [createInvoice, { isLoading: isCreatingInvoice }] = useCreateInvoiceMutation();
  const [initiateBkashPayment, { isLoading: isInitiatingBkash }] = useInitiateBkashPaymentMutation();
  const [submitBankPayment, { isLoading: isSubmittingBank }] = useSubmitBankPaymentMutation();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [bankPaymentData, setBankPaymentData] = useState({
    bankName: "",
    accLastDigit: "",
  });
  const [pendingInvoiceId, setPendingInvoiceId] = useState(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Query to check invoice status for automatic package upgrade
  const { data: invoiceData, refetch: refetchInvoice } = useGetInvoiceQuery(
    pendingInvoiceId,
    { 
      skip: !pendingInvoiceId,
      pollingInterval: 5000, // Poll every 5 seconds when there's a pending invoice
    }
  );

  // Get user ID from different possible fields
  const userId = user?.userId || user?.sub || user?.id;
  const currentPackageId = user?.package?.id;

  // Helper function to upgrade package after payment is verified
  const upgradePackageAfterPayment = useCallback(async (invoiceData, packageData) => {
    try {
      // Update user's package
      const updateRes = await updateSystemuser({
        id: userId,
        packageId: packageData.id,
      });

      if (updateRes?.error) {
        toast.error(updateRes.error?.data?.message || "Failed to update package");
        return false;
      }

      // Refetch user data from API to get fresh data
      await refetchUser();

      // Update user in Redux state as well
      dispatch(userDetailsFetched({
        package: packageData,
      }));

      toast.success(`Successfully upgraded to ${packageData.name}!`);
      return true;
    } catch (error) {
      console.error("Package upgrade error:", error);
      toast.error("Failed to upgrade package");
      return false;
    }
  }, [userId, updateSystemuser, dispatch, refetchUser]);

  // Check for pending package upgrades after payment (e.g., returning from bKash)
  useEffect(() => {
    const checkPendingUpgrade = () => {
      const pendingPackage = sessionStorage.getItem('pendingPackageUpgrade');
      const pendingInvoice = sessionStorage.getItem('pendingInvoice');
      
      if (pendingPackage && pendingInvoice) {
        try {
          const packageData = JSON.parse(pendingPackage);
          const invoiceData = JSON.parse(pendingInvoice);
          
          // Set selected package and pending invoice ID for tracking
          setSelectedPackage(packageData);
          setPendingInvoiceId(invoiceData.id);
          
          // Show a notification that we're checking payment status
          toast.info("Checking your payment status...");
        } catch (error) {
          console.error("Error checking pending upgrade:", error);
          // Clear invalid session storage
          sessionStorage.removeItem('pendingPackageUpgrade');
          sessionStorage.removeItem('pendingInvoice');
        }
      }
    };
    
    if (userId) {
      checkPendingUpgrade();
    }
  }, [userId]);

  // Auto-upgrade package when invoice is paid/verified
  useEffect(() => {
    const handleAutomaticUpgrade = async () => {
      // Prevent duplicate upgrades
      if (isUpgrading) return;
      
      if (!invoiceData || !selectedPackage || !pendingInvoiceId) return;

      const invoice = invoiceData;
      const invoiceStatus = invoice?.status?.toLowerCase();

      console.log("Checking invoice status:", invoiceStatus, "Invoice ID:", pendingInvoiceId);

      // Check if invoice is paid
      if (invoiceStatus === 'paid') {
        try {
          setIsUpgrading(true);
          console.log("Invoice is paid, upgrading package to:", selectedPackage.name);
          
          // Upgrade the package
          const success = await upgradePackageAfterPayment(invoice, selectedPackage);
          
          if (success) {
            // Clear session storage and pending states
            sessionStorage.removeItem('pendingPackageUpgrade');
            sessionStorage.removeItem('pendingInvoice');
            setPendingInvoiceId(null);
            setSelectedPackage(null);
            
            toast.success(`Payment verified! Your package has been upgraded to ${selectedPackage.name}!`);
          }
        } catch (error) {
          console.error("Auto-upgrade error:", error);
          toast.error("Payment verified but package upgrade failed. Please contact support.");
        } finally {
          setIsUpgrading(false);
        }
      } else if (invoiceStatus === 'pending') {
        // Still pending, keep polling
        console.log("Invoice still pending, waiting for payment verification...");
      } else if (invoiceStatus === 'cancelled' || invoiceStatus === 'failed') {
        // Payment failed or cancelled
        toast.error(`Payment ${invoiceStatus}. Please try again.`);
        
        // Clear session storage and pending states
        sessionStorage.removeItem('pendingPackageUpgrade');
        sessionStorage.removeItem('pendingInvoice');
        setPendingInvoiceId(null);
        setSelectedPackage(null);
      }
    };

    handleAutomaticUpgrade();
  }, [invoiceData, selectedPackage, pendingInvoiceId, upgradePackageAfterPayment, isUpgrading]);

  // Sort packages: featured first, then by price
  const sortedPackages = useMemo(() => {
    return [...packages].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      const priceA = parseFloat(a.discountPrice || a.price);
      const priceB = parseFloat(b.discountPrice || b.price);
      return priceA - priceB;
    });
  }, [packages]);

  const handleSelectPackage = (pkg) => {
    if (pkg.id === currentPackageId) {
      toast.error("This is your current package");
      return;
    }
    setSelectedPackage(pkg);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    if (!selectedPackage) return;

    // Validate userId exists
    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    try {
      // Step 1: Create invoice for the new package (DO NOT upgrade package yet)
      const invoiceAmount = parseFloat(selectedPackage.discountPrice || selectedPackage.price);
      const invoiceRes = await createInvoice({
        customerId: userId,
        totalAmount: invoiceAmount.toFixed(2),
        paidAmount: "0.00",
        dueAmount: invoiceAmount.toFixed(2),
        amountType: "package",
        status: "pending",
        packageId: selectedPackage.id, // Store package ID in invoice for later upgrade
      });

      if (invoiceRes?.error) {
        toast.error(invoiceRes.error?.data?.message || "Failed to create invoice");
        return;
      }

      // Step 2: Store invoice and show payment modal
      const invoiceData = invoiceRes?.data || invoiceRes;
      setCreatedInvoice(invoiceData);
      setPendingInvoiceId(invoiceData.id); // Start tracking invoice status
      setIsConfirmModalOpen(false);
      setIsPaymentModalOpen(true);
      
      toast.success(`Invoice created! Please complete payment to upgrade to ${selectedPackage.name}.`);
    } catch (error) {
      console.error("Invoice creation error:", error);
      toast.error("An error occurred during invoice creation");
    }
  };

  const handleBkashPayment = async () => {
    if (!createdInvoice?.id) {
      toast.error("Invoice not found");
      return;
    }

    try {
      const result = await initiateBkashPayment({
        invoiceId: createdInvoice.id,
      });

      if (result?.error) {
        toast.error(result.error?.data?.message || "Failed to initiate bKash payment");
        return;
      }

      const responseData = result?.data || result;
      const bkashURL = responseData?.bkashURL || responseData?.data?.bkashURL;
      
      if (bkashURL) {
        // Store selected package for upgrade after payment
        sessionStorage.setItem('pendingPackageUpgrade', JSON.stringify(selectedPackage));
        sessionStorage.setItem('pendingInvoice', JSON.stringify(createdInvoice));
        
        // Redirect to bKash payment page
        // After successful payment, bKash callback should verify invoice and upgrade package
        window.location.href = bkashURL;
      } else {
        toast.error("bKash payment URL not received");
      }
    } catch (error) {
      console.error("bKash payment error:", error);
      toast.error("Failed to initiate bKash payment");
    }
  };

  const handleBankPayment = async () => {
    if (!createdInvoice?.id) {
      toast.error("Invoice not found");
      return;
    }

    if (!bankPaymentData.bankName || !bankPaymentData.accLastDigit) {
      toast.error("Please fill in all bank payment details");
      return;
    }

    try {
      const result = await submitBankPayment({
        invoiceId: createdInvoice.id,
        bankName: bankPaymentData.bankName,
        accLastDigit: bankPaymentData.accLastDigit,
      });

      if (result?.error) {
        toast.error(result.error?.data?.message || "Failed to submit bank payment");
        return;
      }

      toast.success(`Bank payment submitted! Your package will be upgraded to ${selectedPackage?.name} after admin verifies the payment.`);
      setIsPaymentModalOpen(false);
      
      // Set pending invoice ID for automatic upgrade tracking
      setPendingInvoiceId(createdInvoice.id);
      
      // Store in sessionStorage for persistence across page refreshes
      sessionStorage.setItem('pendingPackageUpgrade', JSON.stringify(selectedPackage));
      sessionStorage.setItem('pendingInvoice', JSON.stringify(createdInvoice));
      
      // Clear form data but keep selectedPackage for automatic upgrade
      setCreatedInvoice(null);
      setBankPaymentData({ bankName: "", accLastDigit: "" });
    } catch (error) {
      console.error("Bank payment error:", error);
      toast.error("Failed to submit bank payment");
    }
  };

  // Show loading if user data is being fetched
  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-12 text-center">
          <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-sm text-black/60 dark:text-white/60">Loading user data...</p>
        </div>
      </div>
    );
  }

  // Show error if user is not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-12 text-center">
          <Crown className="h-16 w-16 text-black/20 dark:text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please Log In</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            You need to be logged in to view and upgrade your plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-semibold">Upgrade Your Plan</h1>
        </div>
        <p className="text-sm text-black/60 dark:text-white/60">
          Choose the perfect package for your business needs. Upgrade or downgrade anytime.
        </p>
      </div>

      {/* Payment Verification Banner */}
      {pendingInvoiceId && invoiceData && (
        <div className="rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-300/20 dark:border-emerald-500/20 p-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                Verifying Payment...
              </h3>
              <p className="text-xs text-green-600/70 dark:text-green-300/70">
                We're checking your payment status. Your package will be upgraded automatically once payment is confirmed.
              </p>
            </div>
            <Button
              onClick={() => refetchInvoice()}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-500/30 hover:bg-green-500/10"
            >
              Check Now
            </Button>
          </div>
        </div>
      )}

      {/* Current Package Info */}
      {user?.package && (
        <div className="rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-300/20 dark:border-purple-500/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Your Current Package
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {user.package.name}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-1">
                ৳{parseFloat(user.package.discountPrice || user.package.price).toFixed(2)}/month
              </p>
            </div>
            {user.package.isFeatured && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-xs font-medium rounded-full flex items-center gap-1">
                <Star className="h-3 w-3 fill-current" />
                Featured
              </span>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-sm text-black/60 dark:text-white/60">Loading packages...</p>
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {!isLoading && sortedPackages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPackages.map((pkg) => {
            const isCurrentPackage = pkg.id === currentPackageId;
            const price = parseFloat(pkg.discountPrice || pkg.price);
            const originalPrice = pkg.discountPrice ? parseFloat(pkg.price) : null;

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl border p-6 transition-all ${
                  isCurrentPackage
                    ? "bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-700"
                    : pkg.isFeatured
                    ? "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-300 dark:border-amber-700 shadow-lg"
                    : "bg-white dark:bg-[#242424] border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:shadow-md"
                }`}
              >
                {/* Package Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {pkg.name}
                      {pkg.isFeatured && (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </h3>
                    <p className="text-xs text-black/60 dark:text-white/60 mt-1 line-clamp-2">
                      {pkg.description}
                    </p>
                  </div>
                  {isCurrentPackage && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Active
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">৳{price.toFixed(2)}</span>
                    <span className="text-sm text-black/60 dark:text-white/60">/month</span>
                  </div>
                  {originalPrice && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-black/40 dark:text-white/40 line-through">
                        ৳{originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-full font-medium">
                        {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {pkg.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-black/70 dark:text-white/70">
                          {feature.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectPackage(pkg)}
                  disabled={isCurrentPackage}
                  className={`w-full ${
                    isCurrentPackage
                      ? "bg-green-500/20 text-green-700 dark:text-green-300 cursor-not-allowed"
                      : pkg.isFeatured
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                      : "bg-black hover:bg-black/90 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black"
                  }`}
                >
                  {isCurrentPackage ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : (
                    <>
                      {pkg.isFeatured ? (
                        <Zap className="h-4 w-4 mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-2" />
                      )}
                      Select Plan
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* No Packages */}
      {!isLoading && sortedPackages.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-12 text-center">
          <Package className="h-16 w-16 text-black/20 dark:text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Packages Available</h3>
          <p className="text-sm text-black/60 dark:text-white/60">
            There are currently no subscription packages available. Please check back later.
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Plan Upgrade</DialogTitle>
          </DialogHeader>
          {selectedPackage && (
            <div className="space-y-4">
              <p className="text-sm text-black/60 dark:text-white/60">
                You are about to upgrade to:
              </p>
              
              <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  {selectedPackage.name}
                  {selectedPackage.isFeatured && (
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  )}
                </h4>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                  {selectedPackage.description}
                </p>
                <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      ৳{parseFloat(selectedPackage.discountPrice || selectedPackage.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-black/60 dark:text-white/60">/month</span>
                  </div>
                  {selectedPackage.discountPrice && (
                    <span className="text-sm text-black/40 dark:text-white/40 line-through">
                      ৳{parseFloat(selectedPackage.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-2">
                  What happens next:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• An invoice will be created for this package</li>
                  <li>• You'll be prompted to complete the payment</li>
                  <li>• Package will be upgraded after payment is verified</li>
                  <li>• You'll get access to all features once payment is confirmed</li>
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setSelectedPackage(null);
              }}
              disabled={isUpdating || isCreatingInvoice}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpgrade}
              disabled={isUpdating || isCreatingInvoice}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isUpdating || isCreatingInvoice ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Upgrade
                </>
              )}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Payment Method Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          {createdInvoice && (
            <div className="space-y-4">
              <div className="rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-black/60 dark:text-white/60">Invoice Number:</span>
                  <span className="text-sm font-semibold">{createdInvoice.invoiceNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/60 dark:text-white/60">Amount Due:</span>
                  <span className="text-lg font-bold">৳{parseFloat(createdInvoice.dueAmount || createdInvoice.totalAmount).toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-black/70 dark:text-white/70">Select Payment Method</label>
                
                {/* bKash Merchant Payment */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("bkash")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === "bkash"
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === "bkash"
                        ? "bg-green-500 text-white"
                        : "bg-black/5 dark:bg-white/5"
                    }`}>
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">bKash Merchant</p>
                      <p className="text-xs text-black/60 dark:text-white/60">Pay securely via bKash</p>
                    </div>
                    {selectedPaymentMethod === "bkash" && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </button>

                {/* Bank Payment */}
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod("bank")}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedPaymentMethod === "bank"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPaymentMethod === "bank"
                        ? "bg-blue-500 text-white"
                        : "bg-black/5 dark:bg-white/5"
                    }`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold">Bank Payment</p>
                      <p className="text-xs text-black/60 dark:text-white/60">Bank transfer (admin verification required)</p>
                    </div>
                    {selectedPaymentMethod === "bank" && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </button>
              </div>

              {/* Bank Payment Form */}
              {selectedPaymentMethod === "bank" && (
                <div className="space-y-3 pt-2 border-t border-black/10 dark:border-white/10">
                  <div className="space-y-2">
                    <label htmlFor="bankName" className="text-sm font-medium text-black/70 dark:text-white/70">Bank Name</label>
                    <input
                      id="bankName"
                      type="text"
                      placeholder="e.g., Dutch Bangla Bank"
                      value={bankPaymentData.bankName}
                      onChange={(e) => setBankPaymentData({ ...bankPaymentData, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="accLastDigit" className="text-sm font-medium text-black/70 dark:text-white/70">Account Last 4 Digits</label>
                    <input
                      id="accLastDigit"
                      type="text"
                      placeholder="e.g., 1234"
                      maxLength={4}
                      value={bankPaymentData.accLastDigit}
                      onChange={(e) => setBankPaymentData({ ...bankPaymentData, accLastDigit: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#242424] text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
                    />
                  </div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    After admin verifies your payment, your package will be automatically upgraded.
                  </p>
                </div>
              )}

              {/* Payment Info for bKash */}
              {selectedPaymentMethod === "bkash" && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    You will be redirected to bKash payment gateway to complete your payment securely.
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setCreatedInvoice(null);
                setSelectedPaymentMethod(null);
                setBankPaymentData({ bankName: "", accLastDigit: "" });
              }}
              disabled={isInitiatingBkash || isSubmittingBank}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            {selectedPaymentMethod === "bkash" && (
              <Button
                type="button"
                onClick={handleBkashPayment}
                disabled={isInitiatingBkash}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isInitiatingBkash ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay with bKash
                  </>
                )}
              </Button>
            )}
            {selectedPaymentMethod === "bank" && (
              <Button
                type="button"
                onClick={handleBankPayment}
                disabled={isSubmittingBank}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSubmittingBank ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Submit Bank Payment
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradePlanPage;
