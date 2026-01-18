import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TextField from "@/components/input/TextField";
import FileUpload from "@/components/input/FileUpload";
import useImageUpload from "@/hooks/useImageUpload";
import {
  useUpdateSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { MapPin, Shield, Package, Building2, CreditCard, DollarSign, CheckCircle, Calendar, Mail, Phone, User, Truck, Key } from "lucide-react";
import OrderNotificationSettings from "./components/OrderNotificationSettings";
import { hasPermission, FeaturePermission } from "@/constants/feature-permission";

const SettingsPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;

  // Use logged user data directly from Redux (stored from login response)
  const user = authUser || null;

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
        // Optionally refetch to get updated data
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
  const paymentStatus = user?.paymentInfo?.paymentstatus || "Not Set";
  const paymentMethod = user?.paymentInfo?.paymentmethod || "Not Set";
  const paymentAmount = user?.paymentInfo?.amount || 0;
  const displayCompanyId = user?.companyId || "Not Set";
  const isActive = user?.isActive !== undefined ? user.isActive : true;
  const createdAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not Available";
  const updatedAt = user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Not Available";

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

      {/* Permissions Card */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Permissions</h2>
        <Card className="border border-black/10 dark:border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base font-semibold">Access Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.length > 0 ? (
                permissions.map((permission, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <p className="text-sm text-black/60 dark:text-white/60">No permissions</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Information Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base font-semibold">Package</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {packageInfo}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base font-semibold">Payment Status</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {paymentStatus}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-base font-semibold">Payment Method</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                {paymentMethod}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-black/10 dark:border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-base font-semibold">Amount</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium text-black dark:text-white">
                ${paymentAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

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
    </div>
  );
};

export default SettingsPage;