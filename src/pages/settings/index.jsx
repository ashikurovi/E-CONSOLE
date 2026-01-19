import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { userDetailsFetched } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import {
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { MapPin, Shield, Package, Building2, CheckCircle, Calendar, Mail, Phone, User, Truck, Key, FileText, CreditCard, Clock, XCircle, Download } from "lucide-react";
import OrderNotificationSettings from "./components/OrderNotificationSettings";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";
import { generateInvoicePDF } from "@/pages/superadmin/invoice/InvoicePDFGenerator";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;

  // Use logged user data directly from Redux (stored from login response)
  const user = authUser || null;

  console.log(user);

  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();
  const [logoFile, setLogoFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  // Profile form
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      branchLocation: "",
    },
  });

  // Pathao credentials form
  const { register: registerPathao, handleSubmit: handleSubmitPathao, reset: resetPathao } = useForm({
    defaultValues: {
      clientId: "",
      clientSecret: "",
    },
  });

  // Steadfast credentials form
  const { register: registerSteadfast, handleSubmit: handleSubmitSteadfast, reset: resetSteadfast } = useForm({
    defaultValues: {
      apiKey: "",
      secretKey: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        companyName: user.companyName || "",
        phone: user.phone || "",
        branchLocation: user.branchLocation || "",
      });
      setLogoFile(null);
    }
  }, [user, reset]);

  // Load credentials from user data or localStorage on mount
  useEffect(() => {
    if (user) {
      resetPathao({
        clientId: user.pathaoConfig?.clientId || localStorage.getItem("pathaoClientId") || import.meta.env.VITE_PATHAO_CLIENT_ID || "",
        clientSecret: user.pathaoConfig?.clientSecret || localStorage.getItem("pathaoClientSecret") || import.meta.env.VITE_PATHAO_CLIENT_SECRET || "",
      });

      resetSteadfast({
        apiKey: user.steadfastConfig?.apiKey || localStorage.getItem("steadfastApiKey") || import.meta.env.VITE_STEADFAST_API_KEY || "",
        secretKey: user.steadfastConfig?.secretKey || localStorage.getItem("steadfastSecretKey") || import.meta.env.VITE_STEADFAST_SECRET_KEY || "",
      });
    }
  }, [user, resetPathao, resetSteadfast]);


  const onSubmit = async (data) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      let companyLogo = user?.companyLogo || "";

      // If a file is selected, upload it first
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile);
        if (!uploadedUrl) {
          toast.error("Failed to upload logo");
          return;
        }
        companyLogo = uploadedUrl;
      }

      const payload = {
        ...data,
        companyLogo,
      };

      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        toast.success("Profile updated successfully");
        setLogoFile(null);
        
        // Update Redux state and localStorage immediately
        dispatch(userDetailsFetched(payload));
      } else {
        toast.error(res?.error?.data?.message || "Failed to update profile");
      }
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const onSubmitPathao = async (data) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const payload = {
        pathaoConfig: {
          clientId: data.clientId,
          clientSecret: data.clientSecret,
        },
      };

      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        // Also save to localStorage for backward compatibility
        localStorage.setItem("pathaoClientId", data.clientId);
        localStorage.setItem("pathaoClientSecret", data.clientSecret);
        
        // Update Redux state and localStorage immediately
        dispatch(userDetailsFetched(payload));
        
        toast.success("Pathao credentials saved successfully");
      } else {
        toast.error(res?.error?.data?.message || "Failed to save Pathao credentials");
      }
    } catch (e) {
      toast.error("Failed to save Pathao credentials");
    }
  };

  const onSubmitSteadfast = async (data) => {
    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const payload = {
        steadfastConfig: {
          apiKey: data.apiKey,
          secretKey: data.secretKey,
        },
      };

      const res = await updateSystemuser({ id: userId, ...payload });
      if (res?.data) {
        // Also save to localStorage for backward compatibility
        localStorage.setItem("steadfastApiKey", data.apiKey);
        localStorage.setItem("steadfastSecretKey", data.secretKey);
        
        // Update Redux state and localStorage immediately
        dispatch(userDetailsFetched(payload));
        
        toast.success("Steadfast credentials saved successfully");
      } else {
        toast.error(res?.error?.data?.message || "Failed to save Steadfast credentials");
      }
    } catch (e) {
      toast.error("Failed to save Steadfast credentials");
    }
  };

  const permissions = user?.permissions || [];
  const packageInfo = user?.paymentInfo?.packagename || "No Package";
  const country = user?.branchLocation || "Not Set";
  const displayCompanyId = user?.companyId || "Not Set";
  const isActive = user?.isActive !== undefined ? user.isActive : true;
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not Available";
  const updatedAt = user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Not Available";

  const handleDownloadInvoicePDF = (invoice) => {
    try {
      // Attach customer information to invoice if not already present
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
      toast.success("Invoice PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <div className="space-y-6">
      {/* User Information Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Name</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {user?.name || "Not Set"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white break-all">
                {user?.email || "Not Set"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Phone</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {user?.phone || "Not Set"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-semibold">Company Name</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {user?.companyName || "Not Set"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-500" />
                <CardTitle className="text-base font-semibold">Company ID</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {displayCompanyId}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Branch Location</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {country}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

   

      {/* Package Information */}
      {user?.package && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Package Information</h2>
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-lg font-semibold">Package Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{user.package.name}</h4>
                  <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                    {user.package.description}
                  </p>
                </div>
                {user.package.isFeatured && (
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-medium rounded">
                    Featured
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-black/10 dark:border-white/10">
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">Price</p>
                  <p className="text-lg font-semibold">৳{parseFloat(user.package.price).toFixed(2)}</p>
                </div>
                {user.package.discountPrice && (
                  <div>
                    <p className="text-sm text-black/60 dark:text-white/60">Discount Price</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ৳{parseFloat(user.package.discountPrice).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              {user.package.features && user.package.features.length > 0 && (
                <div className="pt-3 border-t border-black/10 dark:border-white/10">
                  <p className="text-sm text-black/60 dark:text-white/60 mb-2">Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.package.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md"
                      >
                        {feature.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

   

      {/* Account Status & Dates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Account Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base font-semibold">Account Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isActive
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                }`}>
                {isActive ? "Active" : "Inactive"}
              </span>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Created Date</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {createdAt}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Last Updated</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {updatedAt}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Courier Credentials Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Courier Integration Settings</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Pathao Credentials */}
          {hasPermission(user, FeaturePermission.PATHAO) && (
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base font-semibold">Pathao Courier Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPathao(onSubmitPathao)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                    Client ID
                  </label>
                  <input
                    type="text"
                    {...registerPathao("clientId")}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Pathao Client ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    {...registerPathao("clientSecret")}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Pathao Client Secret"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    <Key className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save Pathao Credentials"}
                  </Button>
                </div>
                <div className="text-xs text-black/50 dark:text-white/50 mt-2">
                  Get your credentials from <a href="https://merchant.pathao.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Pathao Merchant Portal</a>
                </div>  
              </form>
            </CardContent>
          </Card>
          )}
          {/* Steadfast Credentials */}
          {hasPermission(user, FeaturePermission.STEADFAST) && (
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base font-semibold">Steadfast Courier Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSteadfast(onSubmitSteadfast)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                    API Key
                  </label>
                  <input
                    type="text"
                    {...registerSteadfast("apiKey")}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter Steadfast API Key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    {...registerSteadfast("secretKey")}
                    className="w-full px-3 py-2 border border-black/10 dark:border-white/10 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter Steadfast Secret Key"
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    <Key className="h-4 w-4 mr-2" />
                    {isUpdating ? "Saving..." : "Save Steadfast Credentials"}
                  </Button>
                </div>
                <div className="text-xs text-black/50 dark:text-white/50 mt-2">
                  Get your credentials from <a href="https://portal.packzy.com" target="_blank" rel="noopener noreferrer" className="text-green-500 hover:underline">Steadfast Portal</a>
                </div>
              </form>
            </CardContent>
          </Card>
          )}
        </div>
      </div>


      {hasPermission(user, FeaturePermission.NOTIFICATIONS) && (
      <OrderNotificationSettings />
      )}

      {/* Profile Update Form */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Update Profile</h2>
        </div>

        {!user ? (
          <div className="text-center py-8">
            <p className="text-black/60 dark:text-white/60">No user data available. Please log in again.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField placeholder="Full Name" register={register} name="name" />
            <TextField placeholder="Email" type="email" register={register} name="email" />
            <TextField placeholder="Company Name" register={register} name="companyName" />
            <TextField placeholder="Phone" register={register} name="phone" />
            <TextField placeholder="Branch Location / Country" register={register} name="branchLocation" />
            <div className="md:col-span-2">
              <FileUpload
                placeholder="Choose logo file"
                label="Company Logo"
                name="companyLogo"
                accept="image/*"
                onChange={setLogoFile}
                value={user?.companyLogo || null}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <Button type="submit" disabled={isUpdating || isUploading}>
                {isUpdating || isUploading ? "Updating..." : "Update Profile"}
              </Button>
            </div>
          </form>
        )}
      </div>

         {/* Invoice Information */}
         {user?.invoices && user.invoices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Invoices ({user.invoices.length})
          </h2>
          <div className="space-y-4">
            {user.invoices.map((invoice) => {
              const getStatusBadge = (status) => {
                const statusConfig = {
                  pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: Clock },
                  paid: { color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300", icon: CheckCircle },
                  cancelled: { color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: XCircle },
                };
                const config = statusConfig[status] || statusConfig.pending;
                const Icon = config.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
                    <Icon className="h-4 w-4" />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                );
              };

              return (
                <Card key={invoice.id} className="border border-black/10 dark:border-white/10">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-base flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            {invoice.invoiceNumber}
                          </h4>
                          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
                            {invoice.transactionId}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(invoice.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoicePDF(invoice)}
                            className="h-9 px-4 bg-purple-500 hover:bg-purple-600 text-white border-purple-500 flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-black/10 dark:border-white/10">
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Total Amount</p>
                          <p className="text-base font-semibold">৳{parseFloat(invoice.totalAmount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Paid Amount</p>
                          <p className="text-base font-semibold text-green-600 dark:text-green-400">
                            ৳{parseFloat(invoice.paidAmount).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Due Amount</p>
                          <p className="text-base font-semibold text-red-600 dark:text-red-400">
                            ৳{parseFloat(invoice.dueAmount).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-black/60 dark:text-white/60">Type</p>
                          <p className="text-base font-medium capitalize">{invoice.amountType}</p>
                        </div>
                      </div>

                      {/* Bank Payment Info */}
                      {invoice.bankPayment && (
                        <div className="pt-3 border-t border-black/10 dark:border-white/10">
                          <p className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">
                            Bank Payment Details
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60">Bank Name</p>
                              <p className="text-sm font-medium">{invoice.bankPayment.bankName}</p>
                            </div>
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60">Amount</p>
                              <p className="text-sm font-medium">৳{parseFloat(invoice.bankPayment.amount).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60">Account Last Digits</p>
                              <p className="text-sm font-medium">{invoice.bankPayment.accLastDigit}</p>
                            </div>
                            <div>
                              <p className="text-xs text-black/60 dark:text-white/60">Payment Status</p>
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                invoice.bankPayment.status === 'verified' 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                  : invoice.bankPayment.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              }`}>
                                {invoice.bankPayment.status.charAt(0).toUpperCase() + invoice.bankPayment.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bkash Payment Info */}
                      {(invoice.bkashPaymentID || invoice.bkashTrxID) && (
                        <div className="pt-3 border-t border-black/10 dark:border-white/10">
                          <p className="text-sm font-semibold text-black/70 dark:text-white/70 mb-3">
                            Bkash Payment Details
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {invoice.bkashPaymentID && (
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Payment ID</p>
                                <p className="text-sm font-medium">{invoice.bkashPaymentID}</p>
                              </div>
                            )}
                            {invoice.bkashTrxID && (
                              <div>
                                <p className="text-xs text-black/60 dark:text-white/60">Transaction ID</p>
                                <p className="text-sm font-medium">{invoice.bkashTrxID}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="pt-3 border-t border-black/10 dark:border-white/10">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Created At
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(invoice.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-black/60 dark:text-white/60 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Updated At
                            </p>
                            <p className="text-sm font-medium">
                              {new Date(invoice.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;