import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import {
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { Package, Mail, Phone, User, Truck, FileText, CreditCard, Download, Crown, Zap, Shield } from "lucide-react";
import OrderNotificationSettings from "./components/OrderNotificationSettings";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";

const SettingsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;

  // State
  const [activeTab, setActiveTab] = useState("profile");
  const user = authUser || null;

  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();
  const [logoFile, setLogoFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  // Settings Tabs Configuration
  const settingsTabs = [
    { id: "profile", label: t("settings.updateProfile"), icon: User },
    { id: "subscription", label: t("settings.packageInformation"), icon: Crown },
    { id: "integrations", label: t("settings.courierIntegrationSettings"), icon: Truck },
    { id: "notifications", label: t("settings.orderNotificationSettings"), icon: Shield },
  ];

  // Forms Initialization
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      branchLocation: "",
    },
  });

  const { register: registerPathao, handleSubmit: handleSubmitPathao, reset: resetPathao } = useForm({
    defaultValues: { clientId: "", clientSecret: "" },
  });

  const { register: registerSteadfast, handleSubmit: handleSubmitSteadfast, reset: resetSteadfast } = useForm({
    defaultValues: { apiKey: "", secretKey: "" },
  });

  const { reset: resetRedX } = useForm({
    defaultValues: { token: "", sandbox: true },
  });

  // Effects for data synchronization
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        companyName: user.companyName || "",
        phone: user.phone || "",
        branchLocation: user.branchLocation || "",
      });
      
      resetPathao({
        clientId: user.pathaoConfig?.clientId || localStorage.getItem("pathaoClientId") || "",
        clientSecret: user.pathaoConfig?.clientSecret || localStorage.getItem("pathaoClientSecret") || "",
      });

      resetSteadfast({
        apiKey: user.steadfastConfig?.apiKey || localStorage.getItem("steadfastApiKey") || "",
        secretKey: user.steadfastConfig?.secretKey || localStorage.getItem("steadfastSecretKey") || "",
      });

      resetRedX({
        token: user.redxConfig?.token || localStorage.getItem("redxToken") || "",
        sandbox: user.redxConfig?.sandbox !== false,
      });
    }
  }, [user, reset, resetPathao, resetSteadfast, resetRedX]);

  // Submission Handlers
  const onProfileSubmit = async (data) => {
    if (!userId) {
      toast.error(t("settings.userIdNotFound"));
      return;
    }

    try {
      let companyLogo = user?.companyLogo || "";
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile);
        if (!uploadedUrl) return;
        companyLogo = uploadedUrl;
      }

      const payload = { ...data, companyLogo };
      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        toast.success(t("settings.profileUpdated"));
        dispatch(userDetailsFetched(payload));
        setLogoFile(null);
      } else {
        toast.error(res?.error?.data?.message || t("settings.profileUpdateFailed"));
      }
    } catch {
      toast.error(t("settings.somethingWentWrong"));
    }
  };

  const onCourierSubmit = (type, configKey) => async (data) => {
    if (!userId) return toast.error(t("settings.userIdNotFound"));
    try {
      const payload = { [configKey]: data };
      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        Object.entries(data).forEach(([key, val]) => localStorage.setItem(`${type}${key.charAt(0).toUpperCase()}${key.slice(1)}`, val));
        dispatch(userDetailsFetched(payload));
        toast.success(t(`${type}.credentialsSaved`));
      } else {
        toast.error(res?.error?.data?.message || t(`${type}.credentialsFailed`));
      }
    } catch {
      toast.error(t(`${type}.credentialsFailed`));
    }
  };

  const handleDownloadInvoicePDF = (invoice) => {
    try {
      const invoiceWithCustomer = {
        ...invoice,
        customer: invoice.customer || {
          name: user.name,
          email: user.email,
          companyName: user.companyName,
          companyId: user.companyId,
          phone: user.phone,
          branchLocation: user.branchLocation,
          paymentInfo: user.paymentInfo,
        },
      };
      generateInvoicePDF(invoiceWithCustomer);
      toast.success(t("settings.invoiceDownloaded"));
    } catch {
      toast.error(t("settings.invoiceDownloadFailed"));
    }
  };

  // Helper values
  const isActive = user?.isActive !== undefined ? user.isActive : true;
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : t("common.na");
  const updatedAt = user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : t("common.na");

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-20">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-gray-800 pb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0b121e] dark:text-white tracking-tight leading-none mb-3">
            {t("nav.settings")}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {t("settings.accountInformation")} & Preferences
          </p>
        </div>
        
        {/* Quick Account Status Badge */}
        <div className={`px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${
          isActive 
          ? "bg-green-500/10 text-green-600 dark:text-green-400" 
          : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}>
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          {isActive ? t("settings.active") : t("settings.inactive")} Agent
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="flex flex-row lg:flex-col gap-1 p-1 bg-gray-50/50 dark:bg-white/5 rounded-2xl overflow-x-auto lg:sticky lg:top-6">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    isSelected
                    ? "bg-white dark:bg-[#2c3036] text-blue-600 dark:text-blue-400 shadow-md shadow-blue-500/5 translate-x-1"
                    : "text-gray-500 hover:text-[#0b121e] dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600 dark:text-blue-400" : "opacity-40"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1">
          
          {/* TAB 1: PROFILE & PERSONAL INFO */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Account Quick Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { label: t("settings.name"), value: user?.name, icon: User, color: "text-blue-500 bg-blue-500/10" },
                   { label: t("settings.email"), value: user?.email, icon: Mail, color: "text-indigo-500 bg-indigo-500/10" },
                   { label: t("settings.phone"), value: user?.phone, icon: Phone, color: "text-emerald-500 bg-emerald-500/10" }
                 ].map((card, i) => (
                   <div key={i} className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-6 rounded-[24px]">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                      <p className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-1">{card.label}</p>
                      <p className="text-md font-bold text-[#0b121e] dark:text-white truncate">{card.value || "Not Set"}</p>
                   </div>
                 ))}
              </div>

              {/* Profile Update Form */}
              <div className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px]">
                <h3 className="text-lg font-black text-[#0b121e] dark:text-white mb-8">Personal Details</h3>
                <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField placeholder={t("settings.fullName")} register={register} name="name" />
                    <TextField placeholder={t("settings.email")} type="email" register={register} name="email" />
                    <TextField placeholder={t("settings.companyNamePlaceholder")} register={register} name="companyName" />
                    <TextField placeholder={t("settings.phone")} register={register} name="phone" />
                    <div className="md:col-span-2">
                      <TextField placeholder={t("settings.branchLocationPlaceholder")} register={register} name="branchLocation" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <FileUpload
                      placeholder={t("settings.chooseLogoFile")}
                      label={t("settings.companyLogo")}
                      name="companyLogo"
                      accept="image/*"
                      onChange={setLogoFile}
                      value={user?.companyLogo || null}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-[#5347CE] hover:bg-[#4338ca] text-white px-10 h-12 rounded-xl font-bold shadow-xl shadow-blue-500/10" disabled={isUpdating || isUploading}>
                      {isUpdating || isUploading ? t("settings.updating") : t("settings.updateProfile")}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSCRIPTION & INVOICES */}
          {activeTab === "subscription" && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Active Package Card */}
               <div className="bg-gradient-to-br from-[#5347CE] to-[#2b228b] rounded-[32px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                  <Package className="absolute right-[-20px] top-[-20px] w-64 h-64 text-white/5 rotate-12" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                       <Crown className="w-8 h-8 text-yellow-400" />
                       <span className="text-[13px] font-black tracking-widest uppercase opacity-80">Premium Active Plan</span>
                    </div>
                    <h2 className="text-5xl font-black tracking-tight mb-4">{user?.package?.name || "No Active Plan"}</h2>
                    <p className="text-lg text-white/70 font-medium max-w-xl mb-10 leading-relaxed">
                       {user?.package?.description || "Activate a package to unlock advanced features and grow your business."}
                    </p>
                    
                    <div className="flex flex-wrap gap-10">
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Monthly Price</p>
                          <p className="text-3xl font-black">৳{parseFloat(user?.package?.price || 0).toFixed(0)}</p>
                       </div>
                       <div>
                          <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-2">Member Since</p>
                          <p className="text-3xl font-black">{createdAt}</p>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Features & Stats */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-8 rounded-[28px]">
                    <h4 className="text-sm font-black text-[#0b121e] dark:text-white uppercase tracking-widest mb-6">Inclusive Features</h4>
                    <div className="flex flex-wrap gap-2">
                       {user?.package?.features?.map((f, i) => (
                         <span key={i} className="px-4 py-2 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-500/10">
                           {f.replace(/_/g, " ")}
                         </span>
                       ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-8 rounded-[28px]">
                     <h4 className="text-sm font-black text-[#0b121e] dark:text-white uppercase tracking-widest mb-6">Account Meta</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-500 font-medium">Company ID</span>
                           <span className="font-bold text-[#0b121e] dark:text-white">{user?.companyId}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-500 font-medium">Last billing update</span>
                           <span className="font-bold text-[#0b121e] dark:text-white">{updatedAt}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Invoices List */}
               <div className="space-y-6 pt-10">
                 <h3 className="text-lg font-black text-[#0b121e] dark:text-white flex items-center gap-3">
                   <FileText className="w-5 h-5 text-gray-400" />
                   Recent Billing Invoices
                 </h3>
                 <div className="space-y-4">
                    {user?.invoices?.map((inv) => (
                      <div key={inv.id} className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-5 rounded-[24px] flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0b121e] dark:text-white">{inv.invoiceNumber}</p>
                            <p className="text-[11px] font-bold text-gray-400 tracking-wider">TX: {inv.transactionId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right">
                             <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1">Total Amount</p>
                             <p className="text-md font-black">৳{parseFloat(inv.totalAmount).toFixed(0)}</p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                            inv.status?.toLowerCase() === 'paid' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                          }`}>
                            {inv.status}
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadInvoicePDF(inv)} className="h-10 w-10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all rounded-xl">
                            <Download className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          )}

          {/* TAB 3: COURIER INTEGRATIONS */}
          {activeTab === "integrations" && (
            <div className="space-y-8 animate-in slide-in-from-right-4 fade-in duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pathao */}
                  {hasPermission(user, FeaturePermission.PATHAO) && (
                    <div className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px]">
                       <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white">
                             <Truck className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-black text-[#0b121e] dark:text-white">Pathao Logistics</h4>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">API Authentication</p>
                          </div>
                       </div>
                       <form onSubmit={handleSubmitPathao(onCourierSubmit("pathao", "pathaoConfig"))} className="space-y-5">
                          <div className="space-y-1.5">
                             <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Client ID</label>
                             <input {...registerPathao("clientId")} className="w-full h-11 px-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs font-bold" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Client Secret</label>
                             <input type="password" {...registerPathao("clientSecret")} className="w-full h-11 px-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-blue-500/10 text-xs font-bold" />
                          </div>
                          <Button type="submit" className="w-full h-11 bg-[#0b121e] dark:bg-white text-white dark:text-[#0b121e] font-black text-[11px] uppercase tracking-widest rounded-xl mt-4" disabled={isUpdating}>
                             {isUpdating ? "Saving..." : "Save Credentials"}
                          </Button>
                       </form>
                    </div>
                  )}

                  {/* Steadfast */}
                  {hasPermission(user, FeaturePermission.STEARDFAST) && (
                    <div className="bg-white dark:bg-[#1a1f26]/40 border border-gray-100 dark:border-gray-800 p-8 rounded-[32px]">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white">
                             <Zap className="w-6 h-6" />
                          </div>
                          <div>
                             <h4 className="font-black text-[#0b121e] dark:text-white">Steadfast Courier</h4>
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Merchant Access</p>
                          </div>
                       </div>
                       <form onSubmit={handleSubmitSteadfast(onCourierSubmit("steadfast", "steadfastConfig"))} className="space-y-5">
                          <div className="space-y-1.5">
                             <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">API Key</label>
                             <input {...registerSteadfast("apiKey")} className="w-full h-11 px-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-emerald-500/10 text-xs font-bold" />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-2">Secret Token</label>
                             <input type="password" {...registerSteadfast("secretKey")} className="w-full h-11 px-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5 outline-none focus:ring-2 focus:ring-emerald-500/10 text-xs font-bold" />
                          </div>
                          <Button type="submit" className="w-full h-11 bg-[#0b121e] dark:bg-white text-white dark:text-[#0b121e] font-black text-[11px] uppercase tracking-widest rounded-xl mt-4" disabled={isUpdating}>
                             {isUpdating ? "Saving..." : "Save Credentials"}
                          </Button>
                       </form>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATION SETTINGS */}
          {activeTab === "notifications" && (
            <div className="animate-in fade-in duration-500">
               <OrderNotificationSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;