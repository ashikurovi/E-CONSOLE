import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Check,
  Book,
  Flame,
  Download,
  ChevronRight,
  CheckCircle2,
  X,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPackagesQuery } from "@/features/package/packageApiSlice";
import { API_ALLOWED_PERMISSION_VALUES } from "@/constants/feature-permission";
import { PaymentModal } from "./components";
import { useRevertPackageMutation } from "@/features/systemuser/systemuserApiSlice";
import { userDetailsFetched } from "@/features/auth/authSlice";
import {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useInitiateBkashPaymentMutation,
  useSubmitBankPaymentMutation,
} from "@/features/invoice/invoiceApiSlice";

// Format permission key for display (e.g. MANAGE_USERS -> "Manage users")
const featureLabel = (key) => {
  if (!key || typeof key !== "string") return key;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toLowerCase())
    .replace(/^./, (c) => c.toUpperCase());
};

// Format price from API (string "999.00" or number) for display
const formatPrice = (value) => {
  if (value == null || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return num % 1 === 0 ? String(num) : num.toFixed(2);
};

const OptimizedUpgradePlan = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth?.user);
  const userPackageId = currentUser?.packageId ?? currentUser?.package?.id;
  const [revertPackage, { isLoading: isReverting }] = useRevertPackageMutation();
  const [createInvoice] = useCreateInvoiceMutation();
  const [initiateBkashPayment] = useInitiateBkashPaymentMutation();
  const [submitBankPayment] = useSubmitBankPaymentMutation();

  const {
    data: packagesFromApi,
    isLoading: packagesLoading,
    isError: packagesError,
    error: packagesErrorDetail,
    refetch: refetchPackages,
  } = useGetPackagesQuery(undefined, { refetchOnMountOrArgChange: true });
  // Support both: API returns array directly (after transform) or { statusCode, message, data: [] }
  const packagesList = (() => {
    if (Array.isArray(packagesFromApi)) return packagesFromApi;
    if (packagesFromApi?.data && Array.isArray(packagesFromApi.data)) return packagesFromApi.data;
    return [];
  })();

  const {
    data: invoicesFromApi,
    isLoading: invoicesLoading,
  } = useGetInvoicesQuery(undefined, { refetchOnMountOrArgChange: true });
  const invoicesList = (() => {
    if (Array.isArray(invoicesFromApi)) return invoicesFromApi;
    if (invoicesFromApi?.data && Array.isArray(invoicesFromApi.data)) return invoicesFromApi.data;
    return [];
  })();

  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const plans = useMemo(() => {
    return packagesList.map((pkg) => {
      const isUserPackage =
        pkg.id === userPackageId ||
        (userPackageId != null && Number(pkg.id) === Number(userPackageId));
      // API returns price/discountPrice as strings e.g. "999.00", "799.00"
      const rawPrice = pkg.price != null ? pkg.price : null;
      const rawDiscount = pkg.discountPrice != null ? pkg.discountPrice : null;
      const price =
        rawDiscount != null && String(rawDiscount).trim() !== ""
          ? String(rawDiscount)
          : rawPrice != null && String(rawPrice).trim() !== ""
            ? String(rawPrice)
            : "—";
      const features = Array.isArray(pkg.features) ? [...pkg.features] : [];
      return {
        id: pkg.id,
        name: pkg.name || "Package",
        subtitle: pkg.description || "",
        price,
        rawPrice: rawPrice != null ? String(rawPrice) : null,
        rawDiscount: rawDiscount != null ? String(rawDiscount) : null,
        features: features.length ? features : ["—"],
        buttonText: isUserPackage ? "Active plan" : "Choose Plan",
        badge: isUserPackage ? "Current" : (pkg.isFeatured ? "Popular" : null),
        isUserPackage,
      };
    });
  }, [packagesList, userPackageId]);

  // Select user's package by default when plans load
  useEffect(() => {
    if (plans.length && userPackageId != null) {
      const idx = plans.findIndex((p) => p.id === userPackageId);
      if (idx >= 0) setSelectedPlanIndex(idx);
    }
  }, [plans.length, userPackageId, plans]);

  // Logged-in user's current package (for hero section)
  const currentPlan = useMemo(
    () => plans.find((p) => p.isUserPackage) || null,
    [plans]
  );

  // Comparison rows: one per feature permission, each plan gets ✓/✗
  const comparisonRows = useMemo(() => {
    return API_ALLOWED_PERMISSION_VALUES.map((perm) => ({
      name: featureLabel(perm),
      planValues: plans.map((p) => (p.features || []).includes(perm)),
    }));
  }, [plans]);

  const comparisonSections = useMemo(
    () => [{ title: "Features", rows: comparisonRows }],
    [comparisonRows]
  );

  const renderComparisonValue = (value) => {
    if (value === true) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-teal-200 bg-teal-50 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-teal-600" />
          </div>
        </div>
      );
    }
    if (value === false) {
      return (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      );
    }
    return <span className="text-sm font-medium text-gray-600">{value}</span>;
  };

  // Build billing history from API invoices (package-type only for this page, or all)
  const billingHistory = useMemo(() => {
    return invoicesList.map((inv, index) => {
      const planName =
        plans.find((p) => p.id === inv.packageId)?.name ||
        (inv.packageId ? `Plan #${inv.packageId}` : "—");
      const created = inv.createdAt ? new Date(inv.createdAt) : null;
      const dateStr = created
        ? created.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—";
      const amount = inv.totalAmount != null ? formatPrice(inv.totalAmount) : "—";
      const status =
        inv.status === "paid"
          ? "Success"
          : inv.status
            ? String(inv.status).charAt(0).toUpperCase() + String(inv.status).slice(1)
            : "—";
      return {
        id: String(inv.id),
        invoice: inv.invoiceNumber || `Invoice#${inv.id}`,
        date: dateStr,
        amount: `৳${amount}`,
        plan: planName,
        status,
        raw: inv,
      };
    });
  }, [invoicesList, plans]);

  const totalPaidFromInvoices = useMemo(() => {
    return billingHistory
      .filter((b) => b.raw?.status === "paid")
      .reduce((sum, b) => sum + parseFloat(b.raw?.totalAmount || 0), 0);
  }, [billingHistory]);

  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  // Payment modal (when clicking "Choose Plan")
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [planForPayment, setPlanForPayment] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("bkash");
  const [bankPaymentData, setBankPaymentData] = useState({
    bankName: "",
    accLastDigit: "",
  });
  const [isLoadingBkash, setIsLoadingBkash] = useState(false);
  const [isLoadingBank, setIsLoadingBank] = useState(false);

  const openPaymentModal = (plan) => {
    if (plan?.buttonText === "Choose Plan") {
      setPlanForPayment(plan);
      setSelectedPaymentMethod("bkash");
      setBankPaymentData({ bankName: "", accLastDigit: "" });
      setShowPaymentModal(true);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPlanForPayment(null);
  };

  const handleDownloadInvoice = (invoice) => {
    try {
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: currentUser?.name,
          email: currentUser?.email,
          companyName: currentUser?.companyName,
          companyId: currentUser?.companyId,
          phone: currentUser?.phone,
          branchLocation: currentUser?.branchLocation,
          paymentInfo: currentUser?.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error("Invoice download failed:", err);
      toast.error("Failed to download invoice");
    }
  };

  const handleBkashPayment = async () => {
    if (!currentUser?.id || !planForPayment?.id) return;
    setIsLoadingBkash(true);
    try {
      const amount = parseFloat(planForPayment.price);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("Invalid plan price");
      }
      const createRes = await createInvoice({
        customerId: currentUser.id,
        packageId: planForPayment.id,
        totalAmount: amount,
        paidAmount: 0,
        amountType: "package",
        status: "pending",
      }).unwrap();
      const invoice = Array.isArray(createRes) ? createRes[0] : createRes;
      const invoiceId = invoice?.id ?? createRes?.id;
      if (!invoiceId) throw new Error("Invoice not created");
      const initRes = await initiateBkashPayment({ invoiceId }).unwrap();
      const bkashURL = initRes?.bkashURL ?? initRes?.data?.bkashURL;
      if (bkashURL) {
        closePaymentModal();
        window.location.href = bkashURL;
        return;
      }
      throw new Error("bKash URL not received");
    } catch (err) {
      console.error("bKash payment failed:", err);
      setIsLoadingBkash(false);
    }
  };

  const handleBankPayment = async () => {
    if (!currentUser?.id || !planForPayment?.id) return;
    setIsLoadingBank(true);
    try {
      const amount = parseFloat(planForPayment.price);
      if (Number.isNaN(amount) || amount <= 0) {
        throw new Error("Invalid plan price");
      }
      const createRes = await createInvoice({
        customerId: currentUser.id,
        packageId: planForPayment.id,
        totalAmount: amount,
        paidAmount: 0,
        amountType: "package",
        status: "pending",
      }).unwrap();
      const invoice = Array.isArray(createRes) ? createRes[0] : createRes;
      const invoiceId = invoice?.id ?? createRes?.id;
      if (!invoiceId) throw new Error("Invoice not created");
      await submitBankPayment({
        invoiceId,
        bankName: bankPaymentData.bankName,
        accLastDigit: bankPaymentData.accLastDigit,
      }).unwrap();
      closePaymentModal();
    } catch (err) {
      console.error("Bank payment submit failed:", err);
    } finally {
      setIsLoadingBank(false);
    }
  };

  const paymentInvoice = useMemo(() => {
    if (!planForPayment) return null;
    return {
      invoiceNumber: `Plan-${planForPayment.id}`,
      dueAmount: planForPayment.price,
      totalAmount: planForPayment.price,
    };
  }, [planForPayment]);

  const hasPreviousPackage = currentUser?.previousPackageId != null;
  const handleRevertToPreviousPlan = async () => {
    if (!currentUser?.id || !hasPreviousPackage) return;
    try {
      const result = await revertPackage(currentUser.id).unwrap();
      dispatch(userDetailsFetched(result));
    } catch (err) {
      console.error("Revert package failed:", err);
    }
  };

  const toggleRowSelection = (index) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 0 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Revert to previous plan (fallback) banner */}
      {hasPreviousPackage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-8 md:px-12 pt-6"
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
              <RotateCcw className="w-4 h-4 flex-shrink-0" />
              Your last upgrade wasn’t completed. Revert to your previous plan?
            </p>
            <button
              type="button"
              onClick={handleRevertToPreviousPlan}
              disabled={isReverting}
              className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold disabled:opacity-60 flex items-center gap-2"
            >
              {isReverting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Reverting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Revert to previous plan
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Section 1: Hero / Current package */}
      <motion.section
        className="bg-white p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 p-8 md:p-12 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left side – package name & price */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold border border-orange-200 dark:border-orange-700">
                  BUSINESS
                </span>
                {currentPlan && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full text-xs font-bold shadow-lg shadow-purple-600/20">
                    <Flame className="w-3.5 h-3.5" />
                    {currentPlan.badge === "Current" ? "Current plan" : "Most Popular"}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-1">
                  Your current package
                </h2>
                {currentPlan?.subtitle && (
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    {currentPlan.subtitle}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900 dark:text-white">
                    {currentPlan?.price != null && currentPlan.price !== "—"
                      ? `$${formatPrice(currentPlan.price)}`
                      : "—"}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    per seat/month · billed annually
                  </span>
                </div>
                {currentPlan && currentPlan.price !== "—" && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2 flex-wrap">
                    {(currentPlan.rawPrice && currentPlan.rawDiscount && parseFloat(currentPlan.rawDiscount) < parseFloat(currentPlan.rawPrice)) ||
                    (currentUser?.package?.price != null && currentUser.package.discountPrice != null) ? (
                      <>
                        <span className="line-through opacity-60">
                          ${formatPrice(currentPlan.rawPrice || currentUser?.package?.price)}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-200 dark:border-green-800">
                          Save{" "}
                          {Math.round(
                            (1 -
                              parseFloat(currentPlan.rawDiscount || currentUser?.package?.discountPrice) /
                                parseFloat(currentPlan.rawPrice || currentUser?.package?.price)) *
                              100
                          )}
                          %
                        </span>
                      </>
                    ) : null}
                    Billed monthly
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20 transition-all"
                onClick={() =>
                  document.getElementById("plans")?.scrollIntoView?.({ behavior: "smooth" })
                }
              >
                {currentPlan ? "Compare & upgrade" : "View plans"}
              </motion.button>

              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                14-day money-back guarantee · Cancel anytime
              </p>
            </motion.div>

            {/* Right side – package features */}
            <motion.div
              className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 space-y-4 border border-gray-100 dark:border-gray-700"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-900 dark:text-white font-bold text-base flex items-center gap-2">
                <span className="text-purple-600">✓</span>
                {currentPlan
                  ? `${currentPlan.name} includes:`
                  : "Everything in our plans:"}
              </p>

              <div className="space-y-3">
                {(currentPlan?.features?.length
                  ? currentPlan.features.filter((f) => f !== "—")
                  : [
                      "Unlimited uploads",
                      "A.I Coaching",
                      "Deal boards",
                      "Team Performance Insights",
                      "Smart tags (Trackers)",
                      "Hubspot Integration",
                      "Salesforce Integration",
                    ]
                ).map((feature, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                      {typeof feature === "string" && feature.length > 2
                        ? featureLabel(feature)
                        : feature}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Section 2: Pricing Cards */}
      <motion.section
        className="bg-white p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {packagesLoading ? (
          <motion.div
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-gray-500 dark:text-gray-400">Loading packages…</div>
          </motion.div>
        ) : packagesError ? (
          <motion.div
            className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-red-700 dark:text-red-300 font-medium mb-2">
              Failed to load packages
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              {packagesErrorDetail?.data?.message ||
                packagesErrorDetail?.error ||
                "Check your connection and try again."}
            </p>
            <button
              type="button"
              onClick={() => refetchPackages()}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
            >
              Retry
            </button>
          </motion.div>
        ) : !plans.length ? (
          <motion.div
            className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-12 text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No packages available. Contact support to add plans.
          </motion.div>
        ) : (
        <motion.div
          id="plans"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {plans.map((plan, index) => {
            const isActive = index === selectedPlanIndex;

            return (
              <motion.div
                key={plan.id ?? index}
                layout
                onClick={() => setSelectedPlanIndex(index)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
                variants={itemVariants}
                className={`rounded-2xl p-8 cursor-pointer border-2 transition-all duration-300 relative overflow-hidden ${
                  isActive
                    ? "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-600 text-white shadow-xl shadow-purple-600/20"
                    : plan.isUserPackage
                      ? "bg-white border-purple-400 shadow-md hover:shadow-lg ring-2 ring-purple-200"
                      : "bg-white border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <motion.div
                    className={`absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      plan.isUserPackage && !isActive
                        ? "bg-purple-600 text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                    }`}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    {plan.badge}
                  </motion.div>
                )}

                {/* Content */}
                <div className="mb-8">
                  <h3
                    className={`text-2xl font-bold mb-1 ${isActive ? "text-white" : "text-gray-900"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500"}`}
                  >
                    {plan.subtitle}
                  </p>
                </div>

                {/* Price */}
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-baseline gap-1 mb-1">
                    <span
                      className={`text-4xl font-black ${isActive ? "text-white" : "text-gray-900 dark:text-white"}`}
                    >
                      ${formatPrice(plan.price)}
                    </span>
                    <span
                      className={`text-sm ${isActive ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      /year
                    </span>
                  </div>
                  {plan.rawPrice && plan.rawDiscount && parseFloat(plan.rawDiscount) < parseFloat(plan.rawPrice) && (
                    <p className={`text-sm flex items-center gap-2 mt-1 ${isActive ? "text-purple-100" : "text-gray-500 dark:text-gray-400"}`}>
                      <span className="line-through opacity-70">${formatPrice(plan.rawPrice)}</span>
                      <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-xs font-bold">
                        Save {Math.round((1 - parseFloat(plan.rawDiscount) / parseFloat(plan.rawPrice)) * 100)}%
                      </span>
                    </p>
                  )}
                </motion.div>

                {/* Features */}
                <motion.div
                  className="flex-1 space-y-4 mb-8"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {plan.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      className="flex items-center gap-3"
                      variants={itemVariants}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <Check
                          className={`w-5 h-5 ${
                            isActive ? "text-purple-200" : "text-purple-600"
                          }`}
                        />
                      </motion.div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-white" : "text-gray-700"
                        }`}
                      >
                        {typeof feature === "string" && feature.length > 2 ? featureLabel(feature) : feature}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Button */}
                <motion.button
                  type="button"
                  className={`w-full py-3 rounded-xl font-bold text-base transition-all ${
                    isActive
                      ? "bg-white text-purple-600 hover:bg-purple-50"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openPaymentModal(plan);
                  }}
                >
                  {isActive ? `✓ ${plan.buttonText}` : plan.buttonText}
                </motion.button>
              </motion.div>
            );
          })}
        </motion.div>
        )}
      </motion.section>

      {/* Section 3: Feature Comparison */}
      <motion.section
        className="bg-white p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Book className="w-6 h-6 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">
                Compare features by plan
              </h3>
            </div>
            <p className="text-sm text-gray-500 ml-9">
              Easily compare features across all available plans.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="w-full min-w-[800px]">
              {/* Table Header */}
              <div
                className="grid bg-gray-100/50 border-b border-gray-200"
                style={{ gridTemplateColumns: `minmax(180px, 1fr) repeat(${plans.length}, minmax(100px, 1fr))` }}
              >
                <div className="p-4 font-bold text-gray-900 flex items-center">
                  <span className="text-purple-600 font-bold text-sm bg-purple-50 px-2 py-1 rounded">
                    Feature
                  </span>
                </div>
                {plans.map((plan, idx) => (
                  <div
                    key={plan.id ?? idx}
                    className={`p-4 text-center font-bold text-gray-900 bg-gray-50/50 border-l border-gray-100 ${
                      plan.isUserPackage ? "bg-purple-50/80 text-purple-800" : ""
                    }`}
                  >
                    {plan.name}
                    {plan.isUserPackage && (
                      <span className="block text-xs font-normal text-purple-600 mt-0.5">
                        Your plan
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Rows: one per feature permission */}
              <AnimatePresence>
                {isExpanded && plans.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-gray-100">
                      {(showAllFeatures ? comparisonRows : comparisonRows.slice(0, 15)).map((row, rowIdx) => (
                        <div
                          key={rowIdx}
                          className="grid hover:bg-gray-50/50 transition-colors"
                          style={{ gridTemplateColumns: `minmax(180px, 1fr) repeat(${plans.length}, minmax(100px, 1fr))` }}
                        >
                          <div className="p-4 py-3 text-sm font-medium text-gray-700 flex items-center">
                            {row.name}
                          </div>
                          {(row.planValues || []).map((value, planIdx) => (
                            <div
                              key={planIdx}
                              className={`p-4 py-3 text-center flex items-center justify-center border-l border-gray-50 ${
                                plans[planIdx]?.isUserPackage ? "bg-purple-50/30" : ""
                              }`}
                            >
                              {renderComparisonValue(value)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    {comparisonRows.length > 15 && (
                      <div className="p-3 bg-gray-50/30 flex justify-center border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setShowAllFeatures((v) => !v)}
                          className="text-purple-600 text-xs font-bold flex items-center gap-1 hover:text-purple-700 bg-white border border-purple-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow transition-all"
                        >
                          {showAllFeatures ? "Show less" : "View all features"}
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${showAllFeatures ? "-rotate-90" : "rotate-90"}`}
                          />
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer toggle */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-700"
            >
              {isExpanded
                ? "Hide Detailed Plan Comparison"
                : "Show Detailed Plan Comparison"}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-4 h-4 rotate-90" />
              </motion.div>
            </button>
          </div>
        </motion.div>
      </motion.section>

      {/* Section 4: Billing History */}
      <motion.section
        className="bg-white p-8 md:p-12 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <motion.div
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="p-8 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Billing History</h3>
            <motion.span
              className="text-sm text-gray-500 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {selectedRows.size > 0
                ? `${selectedRows.size} selected`
                : `${billingHistory.length} invoices`}
            </motion.span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-purple-600 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(
                            new Set(billingHistory.map((_, i) => i)),
                          );
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      checked={selectedRows.size === billingHistory.length}
                    />
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">No</th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Invoices
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Created Date
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Amount
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Plan
                  </th>
                  <th className="text-left p-4 font-bold text-gray-600">
                    Status
                  </th>
                  <th className="text-right p-4 font-bold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {invoicesLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        Loading invoices...
                      </td>
                    </tr>
                  ) : billingHistory.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-gray-500">
                        No invoices yet.
                      </td>
                    </tr>
                  ) : (
                  billingHistory.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedRows.has(index) ? "bg-purple-50" : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 cursor-pointer"
                          checked={selectedRows.has(index)}
                          onChange={() => toggleRowSelection(index)}
                        />
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {item.id}
                      </td>
                      <td className="p-4 font-semibold text-gray-900">
                        {item.invoice}
                      </td>
                      <td className="p-4 text-gray-600">{item.date}</td>
                      <td className="p-4 font-semibold text-gray-900">
                        💰 {item.amount}
                      </td>
                      <td className="p-4 text-gray-700">{item.plan}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            item.raw?.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : item.raw?.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : item.raw?.status === "cancelled" || item.raw?.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.raw?.status === "paid" && <Check className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <motion.div
                          className="flex items-center justify-end"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadInvoice(item.raw)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download invoice
                          </motion.button>
                        </motion.div>
                      </td>
                    </motion.tr>
                  )))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-gray-50 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.75 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Invoices
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {billingHistory.length}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Total Paid
              </p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ৳{totalPaidFromInvoices.toFixed(2)}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.85 }}
            >
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Status
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-2">Active</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={closePaymentModal}
        invoice={paymentInvoice}
        selectedPaymentMethod={selectedPaymentMethod}
        onPaymentMethodChange={setSelectedPaymentMethod}
        bankPaymentData={bankPaymentData}
        onBankPaymentDataChange={setBankPaymentData}
        onBkashPayment={handleBkashPayment}
        onBankPayment={handleBankPayment}
        isLoadingBkash={isLoadingBkash}
        isLoadingBank={isLoadingBank}
      />
    </div>
  );
};

export default OptimizedUpgradePlan;
