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
import { MapPin, Shield, Package, Building2, CreditCard, DollarSign, CheckCircle, Calendar, Mail, Phone, User } from "lucide-react";

const SettingsPage = () => {
  const authUser = useSelector((state) => state.auth.user);
  const userId = authUser?.userId || authUser?.sub || authUser?.id;

  // Use logged user data directly from Redux (stored from login response)
  const user = authUser || null;

  const [updateSystemuser, { isLoading: isUpdating }] = useUpdateSystemuserMutation();
  const [logoFile, setLogoFile] = useState(null);
  const { uploadImage, isUploading } = useImageUpload();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      email: "",
      companyName: "",
      phone: "",
      branchLocation: "",
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