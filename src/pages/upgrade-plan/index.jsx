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
import { Crown } from "lucide-react";
import {
  PackageCard,
  ConfirmationModal,
  PaymentModal,
  CurrentPackageInfo,
  PaymentVerificationBanner,
  LoadingState,
  EmptyState,
  PageHeader,
} from "./components";

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
        totalAmount: Number(invoiceAmount.toFixed(2)),
        paidAmount: 0,
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
    return <LoadingState message="Loading user data..." />;
  }

  // Show error if user is not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-12 text-center">
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
      <PageHeader />

      {/* Payment Verification Banner */}
      {pendingInvoiceId && invoiceData && (
        <PaymentVerificationBanner onCheckNow={() => refetchInvoice()} />
      )}

      {/* Current Package Info */}
      {user?.package && <CurrentPackageInfo packageData={user.package} />}

      {/* Loading State */}
      {isLoading && <LoadingState message="Loading packages..." />}

      {/* Packages Grid */}
      {!isLoading && sortedPackages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              isCurrentPackage={pkg.id === currentPackageId}
              onSelect={handleSelectPackage}
            />
          ))}
        </div>
      )}

      {/* No Packages */}
      {!isLoading && sortedPackages.length === 0 && <EmptyState />}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setSelectedPackage(null);
        }}
        selectedPackage={selectedPackage}
        onConfirm={handleConfirmUpgrade}
        isLoading={isUpdating || isCreatingInvoice}
      />

      {/* Payment Method Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setCreatedInvoice(null);
          setSelectedPaymentMethod(null);
          setBankPaymentData({ bankName: "", accLastDigit: "" });
        }}
        invoice={createdInvoice}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        bankPaymentData={bankPaymentData}
        onBankPaymentDataChange={setBankPaymentData}
        onBkashPayment={handleBkashPayment}
        onBankPayment={handleBankPayment}
        isLoadingBkash={isInitiatingBkash}
        isLoadingBank={isSubmittingBank}
      />
    </div>
  );
};

export default UpgradePlanPage;
