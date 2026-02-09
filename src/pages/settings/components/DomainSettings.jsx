import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Globe, CheckCircle, AlertCircle, Loader2, Copy, Server, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSelector } from "react-redux";
import { useAddCustomDomainMutation } from "@/features/devops/devopsApiSlice";
import { motion, AnimatePresence } from "framer-motion";

const DomainSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const [addCustomDomain, { isLoading }] = useAddCustomDomainMutation();
  const authUser = useSelector((state) => state.auth.user);
  const user = userFromApi ?? authUser ?? null;
  const tenantId = user?.tenantId || user?.companyId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      domain: "",
    },
  });

  // Watch domain value for conditional UI
  const currentDomainValue = watch("domain");

  useEffect(() => {
    reset({ domain: user?.customDomain ?? "" });
  }, [user?.customDomain, reset]);

  const onSubmit = async (data) => {
    if (!tenantId) {
      toast.error(t("settings.tenantMissing") || "Missing tenant information.");
      return;
    }

    try {
      const res = await addCustomDomain({
        id: tenantId,
        domain: data.domain,
      }).unwrap();
      toast.success(t("settings.domainConnected"));
    } catch (error) {
      toast.error(error?.data?.message || t("settings.domainConnectFailed"));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
              <Globe className="h-6 w-6" />
            </div>
            Custom Domain
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 ml-14">
            Connect your existing domain to give your store a professional look.
          </p>
        </div>
        
        {user?.customDomain && (
           <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-800 self-start md:self-auto">
             <ShieldCheck className="w-5 h-5" />
             <span className="font-medium text-sm">Active & Secure</span>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="xl:col-span-2 space-y-6">
          {/* Main Connection Card */}
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] shadow-xl overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-violet-500" />
                Domain Configuration
              </h3>
            </div>
            
            <div className="p-6 md:p-8 space-y-8">
              {/* Connection Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    Your Domain Name
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-500">https://</span>
                      </div>
                      <Input
                        {...register("domain", {
                          required: t("settings.domainRequired"),
                          pattern: {
                            value: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
                            message: t("settings.invalidDomain"),
                          },
                        })}
                        placeholder="yourstore.com"
                        className="h-12 pl-[110px] bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-violet-500/20 w-full"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="h-12 px-6 rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 transition-all w-full sm:w-auto"
                    >
                      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      {user?.customDomain ? "Update" : "Connect"}
                    </Button>
                  </div>
                  {errors.domain && (
                    <p className="text-sm text-red-500 flex items-center gap-1 mt-2 ml-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.domain.message}
                    </p>
                  )}
                </div>
              </form>

              {/* DNS Instructions */}
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/30">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
                    <Server className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">DNS Configuration Required</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        To connect your domain, you need to add a CNAME record in your DNS provider's settings.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Type</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-white">CNAME</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Name</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-white">www / @</p>
                      </div>
                      <div className="p-4 bg-white dark:bg-[#1a1f26] rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-sm relative group sm:col-span-2 lg:col-span-1">
                         <div className="flex items-center justify-between gap-2">
                            <div className="overflow-hidden">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Value / Target</p>
                                <p className="font-mono font-medium text-violet-600 dark:text-violet-400 truncate" title="ingress.squadcart.app">
                                  ingress.squadcart.app
                                </p>
                            </div>
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-gray-400 hover:text-violet-600 shrink-0"
                                onClick={() => copyToClipboard("ingress.squadcart.app")}
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Help */}
        <div className="xl:col-span-1 space-y-6">
          {/* Status Card */}
          <div className="rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-xl">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                 <ShieldCheck className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-lg font-bold">SSL Certificate</h3>
             </div>
             <p className="text-white/80 text-sm leading-relaxed mb-6">
               We automatically provision and renew SSL certificates for all connected custom domains to ensure your store is secure.
             </p>
             <div className="flex items-center gap-2 text-xs font-medium bg-white/10 p-3 rounded-lg border border-white/10">
               <CheckCircle className="w-4 h-4 text-emerald-400" />
               <span>Auto-Renewal Enabled</span>
             </div>
          </div>

          {/* Help Card */}
          <div className="rounded-[24px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1f26] p-6 shadow-lg">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">Need Help?</h3>
             <ul className="space-y-4">
               <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                 <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                    <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                 </div>
                 How to configure GoDaddy DNS
               </li>
               <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                 <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                    <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                 </div>
                 How to configure Namecheap DNS
               </li>
               <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 transition-colors cursor-pointer group">
                 <div className="mt-0.5 p-1 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                    <ArrowRight className="w-3 h-3 group-hover:text-violet-600" />
                 </div>
                 Troubleshooting connection issues
               </li>
             </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DomainSettings;