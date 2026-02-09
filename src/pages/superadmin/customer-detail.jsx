import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";
import CustomerEditForm from "./customers-components/CustomerEditForm";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Package,
  Shield,
  Palette,
  Bell,
  Truck,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  Pencil,
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

const SuperAdminCustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const numericId = useMemo(() => Number(id), [id]);

  const { data: users = [], isLoading } = useGetSystemusersQuery();

  const user = useMemo(
    () => users.find((u) => String(u.id) === String(numericId)),
    [users, numericId],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Customer Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            The customer you are looking for does not exist or has been removed.
          </p>
        </div>
        <Button
          onClick={() => navigate("/superadmin/customers")}
          className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  // Helper to check config status
  const hasPathao =
    user.pathaoConfig?.clientId && user.pathaoConfig?.clientSecret;
  const hasSteadfast =
    user.steadfastConfig?.apiKey && user.steadfastConfig?.secretKey;
  const hasNotifications =
    user.notificationConfig?.email || user.notificationConfig?.whatsapp;

  return (
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <div className="relative rounded-[24px] md:rounded-[32px] overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 p-6 sm:p-10 md:p-12 shadow-2xl shadow-violet-900/20">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <Button
              onClick={() => navigate("/superadmin/customers")}
              variant="ghost"
              className="rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm p-3 h-auto hidden sm:flex"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => navigate("/superadmin/customers")}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm sm:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight break-all">
                  {user.companyName || user.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                  user.isActive 
                    ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-100" 
                    : "bg-rose-500/20 border-rose-400/30 text-rose-100"
                }`}>
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-violet-100 text-sm font-medium">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-full sm:w-auto truncate">
                  <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{user.email}</span>
                </span>
                {user.phone && (
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-full sm:w-auto">
                    <Phone className="w-4 h-4 shrink-0" /> {user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm w-full sm:w-auto">
                  <Building2 className="w-4 h-4 shrink-0" /> ID: {user.companyId || user.id}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats or Actions if needed */}
          <div className="flex gap-3 w-full lg:w-auto justify-start lg:justify-end">
             <Button
                onClick={() => setIsEditOpen(true)}
                className="w-full sm:w-auto rounded-xl bg-white text-violet-600 hover:bg-slate-100 font-bold shadow-lg"
             >
                <Pencil className="w-4 h-4 mr-2" />
                Edit Customer
             </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column - Main Info */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          
          {/* Basic Info & Contact */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Business Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  {user.companyLogo ? (
                    <img
                      src={user.companyLogo}
                      alt="Logo"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-700 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-200 dark:border-slate-700">
                      <Building2 className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Company Name
                    </p>
                    <p className="font-bold text-slate-900 dark:text-white text-lg">
                      {user.companyName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Owner: {user.name}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Domain
                  </p>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <a
                      href={user.domainName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 font-medium hover:underline truncate"
                    >
                      {user.domainName || "No domain connected"}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Location
                  </p>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{user.branchLocation || "No location set"}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Contact
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="break-all">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Branding & Theme */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Branding & Theme
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Primary Color
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-sm border border-black/5"
                    style={{ backgroundColor: user.primaryColor || "#000000" }}
                  />
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      {user.primaryColor || "Default"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Secondary Color
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl shadow-sm border border-black/5"
                    style={{
                      backgroundColor: user.secondaryColor || "#000000",
                    }}
                  />
                  <div>
                    <p className="font-mono text-sm font-medium text-slate-900 dark:text-white">
                      {user.secondaryColor || "Default"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Theme ID
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold">
                    {user.themeId || "1"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user.themeId
                        ? `Custom Theme #${user.themeId}`
                        : "Default Theme"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Status & Config */}
        <div className="space-y-8">
          {/* Package & Payment */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Subscription
              </h3>
            </div>

            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Package className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                    {user.paymentInfo?.paymentstatus || "PENDING"}
                  </span>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Current Package
                </p>
                <h4 className="text-xl font-bold mb-4">
                  {user.paymentInfo?.packagename || "No Package"}
                </h4>

                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Amount</p>
                    <p className="text-lg font-bold">
                      ৳ {user.paymentInfo?.amount || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs mb-1">Method</p>
                    <p className="text-sm font-medium">
                      {user.paymentInfo?.paymentmethod || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Integrations */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Integrations
              </h3>
            </div>

            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  hasPathao
                    ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                    : "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <Truck className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Pathao Courier
                  </span>
                </div>
                {hasPathao ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                    Not Configured
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  hasSteadfast
                    ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                    : "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <Truck className="w-4 h-4 text-teal-500" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Steadfast Courier
                  </span>
                </div>
                {hasSteadfast ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                    Not Configured
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  hasNotifications
                    ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                    : "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <Bell className="w-4 h-4 text-orange-500" />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Notifications
                  </span>
                </div>
                {hasNotifications ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
                    Not Configured
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Permissions */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-[#1a1f26] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Permissions
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.isArray(user.permissions) &&
              user.permissions.length > 0 ? (
                user.permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-sm italic">
                  No specific permissions assigned
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      {isEditOpen && (
        <CustomerEditForm user={user} onClose={() => setIsEditOpen(false)} />
      )}
    </motion.div>
  );
};

export default SuperAdminCustomerDetailPage;
