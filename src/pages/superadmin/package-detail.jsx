import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPackageQuery } from "@/features/package/packageApiSlice";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Package,
  Tag,
  Calendar,
  Layers,
  CheckCircle2,
  DollarSign,
  Star,
  XCircle,
  Info,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: pkg, isLoading, isError } = useGetPackageQuery(id);
  const [featureModal, setFeatureModal] = React.useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "0.00";
    return parseFloat(price).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading package details...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Package Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            The package you are looking for does not exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/package-management")}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Packages
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-6 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/superadmin/package-management")}
          className="rounded-full h-10 w-10 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {pkg.name || "Package Details"}
            {pkg.isFeatured && (
              <span className="px-3 py-1 text-xs rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/50">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Package ID: <span className="font-mono text-slate-700 dark:text-slate-300">{pkg.id}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-500" />
              Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">
                  Description
                </label>
                <p className="text-slate-900 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {pkg.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Theme Details Card */}
          {pkg.theme && (
            <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Theme Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Theme ID
                  </label>
                  <p className="font-mono text-slate-900 dark:text-slate-100 font-medium">
                    {pkg.theme.id}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Domain URL
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 font-medium break-all">
                    {pkg.theme.domainUrl || "-"}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Logo Color
                  </label>
                  <div className="flex items-center gap-3">
                    {pkg.theme.logoColorCode ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                          style={{ backgroundColor: pkg.theme.logoColorCode }}
                        />
                        <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                          {pkg.theme.logoColorCode}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">
                    Created At
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {formatDate(pkg.theme.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Features Included
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-auto">
                {pkg.features?.length || 0} features
              </span>
            </h2>
            {pkg.features && pkg.features.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pkg.features.map((feature, index) => {
                  const meta = FEATURES_OPTIONS.find((f) => f.value === feature);
                  const label = meta?.label || feature.replace(/_/g, " ");
                  const details = meta?.details;
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20"
                    >
                      <div className="w-2 h-2 mt-1 rounded-full bg-emerald-500 flex-shrink-0" />
                      <div className="flex-1 flex items-start gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                            {label}
                          </span>
                          {details && (
                            <span className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
                              {details}
                            </span>
                          )}
                        </div>
                        {details && (
                          <button
                            type="button"
                            className="mt-0.5 text-emerald-700/70 dark:text-emerald-200/70 hover:text-emerald-800 dark:hover:text-emerald-100"
                            title={details}
                            onClick={() => setFeatureModal({ label, details })}
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                No features listed for this package
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar Column */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              Pricing Details
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Regular Price</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  ৳{formatPrice(pkg.price)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Discount Price</span>
                <span className={`text-xl font-bold ${pkg.discountPrice ? "text-green-600 dark:text-green-400" : "text-slate-400"}`}>
                  {pkg.discountPrice ? `৳${formatPrice(pkg.discountPrice)}` : "-"}
                </span>
              </div>

              {pkg.discountPrice && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Savings</span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-400">
                      ৳{formatPrice(parseFloat(pkg.price) - parseFloat(pkg.discountPrice))}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 rounded-md bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-100 text-xs font-bold">
                      {(((parseFloat(pkg.price) - parseFloat(pkg.discountPrice)) / parseFloat(pkg.price)) * 100).toFixed(0)}% OFF
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Card */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Timeline
            </h2>
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 space-y-6">
              <div className="ml-6 relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-violet-500" />
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Created At
                </label>
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {formatDate(pkg.createdAt)}
                </p>
              </div>
              <div className="ml-6 relative">
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-blue-500" />
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 block">
                  Last Updated
                </label>
                <p className="text-slate-900 dark:text-slate-100 font-medium">
                  {formatDate(pkg.updatedAt)}
                </p>
              </div>
              {pkg.deletedAt && (
                <div className="ml-6 relative">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 bg-rose-500" />
                  <label className="text-xs font-medium text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-1 block">
                    Deleted At
                  </label>
                  <p className="text-rose-600 dark:text-rose-400 font-medium">
                    {formatDate(pkg.deletedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Dialog
        open={!!featureModal}
        onOpenChange={(open) => {
          if (!open) setFeatureModal(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-4 w-4 text-emerald-600" />
              {featureModal?.label || "Feature details"}
            </DialogTitle>
            {featureModal?.details && (
              <DialogDescription className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {featureModal.details}
              </DialogDescription>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PackageDetailPage;
