import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useGetCurrentSuperadminQuery } from "@/features/superadminAuth/superadminAuthApiSlice";
import { useUpdateSuperadminMutation } from "@/features/superadmin/superadminApiSlice";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { User, Shield, Calendar, Key, CheckCircle2, AlertCircle, Clock } from "lucide-react";

const passwordSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  designation: yup.string().nullable(),
  photo: yup.string().url("Must be a valid URL").nullable(),
});

const SuperAdminProfilePage = () => {
  const { user } = useSelector((state) => state.superadminAuth);
  const { data: currentSuperadmin, isLoading: isLoadingProfile } =
    useGetCurrentSuperadminQuery();
  const [updateSuperadmin, { isLoading: isUpdating }] =
    useUpdateSuperadminMutation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const superadminId = user?.id || currentSuperadmin?.id;

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: currentSuperadmin?.name || user?.name || "",
      designation: currentSuperadmin?.designation || user?.designation || "",
      photo: currentSuperadmin?.photo || user?.photo || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  React.useEffect(() => {
    if (currentSuperadmin) {
      resetProfile({
        name: currentSuperadmin.name || "",
        designation: currentSuperadmin.designation || "",
        photo: currentSuperadmin.photo || "",
      });
    }
  }, [currentSuperadmin, resetProfile]);

  const onProfileSubmit = async (data) => {
    if (!superadminId) {
      toast.error("User ID not found");
      return;
    }

    try {
      const payload = {
        name: data.name,
        designation: data.designation || null,
        photo: data.photo || null,
      };

      await updateSuperadmin({
        id: superadminId,
        ...payload,
      }).unwrap();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const onPasswordSubmit = async (data) => {
    if (!superadminId) {
      toast.error("User ID not found");
      return;
    }

    try {
      await updateSuperadmin({
        id: superadminId,
        password: data.password,
      }).unwrap();
      toast.success("Password updated successfully");
      resetPassword();
      setIsPasswordModalOpen(false);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update password");
    }
  };

  const profileData = currentSuperadmin || user;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Profile</h1>
            <p className="text-violet-100 text-lg max-w-2xl">
              Manage your super admin profile and account settings.
            </p>
          </div>
        </div>
      </div>

      {isLoadingProfile && (
        <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      )}

      {!isLoadingProfile && profileData && (
        <>
          {/* Profile Photo Section */}
          {profileData.photo && (
            <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-black/40 transition-all duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage your public profile image
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-slate-50 dark:bg-slate-800/50 inline-block shadow-sm">
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="h-32 w-32 object-cover rounded-xl shadow-inner"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Profile Information Form */}
          <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-black/40 transition-all duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Profile Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your personal details
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="Name *"
                  placeholder="Enter your name"
                  register={registerProfile}
                  name="name"
                  error={profileErrors.name}
                  inputClassName="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 transition-all"
                />

                <TextField
                  label="Designation"
                  placeholder="Enter your designation (optional)"
                  register={registerProfile}
                  name="designation"
                  error={profileErrors.designation}
                  inputClassName="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 transition-all"
                />
              </div>

              <TextField
                label="Photo URL"
                placeholder="Enter photo URL (optional)"
                register={registerProfile}
                name="photo"
                error={profileErrors.photo}
                inputClassName="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 transition-all"
              />

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl h-11 px-8 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl h-11 px-6 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account Information Section */}
          <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-black/40 transition-all duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Account Overview
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  System role and permission details
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  System ID
                </p>
                <p className="font-mono text-sm font-semibold text-slate-700 dark:text-slate-300 break-all">
                  {profileData.id ?? "-"}
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Role
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  <Shield className="h-3 w-3" />
                  {profileData.role || "SUPER_ADMIN"}
                </span>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    profileData.isActive
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800"
                  }`}
                >
                  {profileData.isActive ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {profileData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Permissions */}
            {profileData.permissions && profileData.permissions.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                  Active Permissions
                </p>
                <div className="flex flex-wrap gap-2">
                  {profileData.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-100 dark:hover:bg-violet-900/20 dark:hover:text-violet-300 dark:hover:border-violet-800 transition-all duration-200"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Activity Timeline
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Created At
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {profileData.createdAt
                        ? new Date(profileData.createdAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Last Updated
                    </p>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {profileData.updatedAt
                        ? new Date(profileData.updatedAt).toLocaleString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Password Change Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-[#1a1f26] border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 py-6 border-b border-slate-100 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Key className="h-4 w-4" />
              </div>
              Change Password
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="p-6 space-y-6">
            {/* Instructions Section */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Ensure your account stays secure by choosing a strong, unique password.
              </p>
            </div>

            <div className="space-y-4">
              <TextField
                label="New Password *"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                register={registerPassword}
                name="password"
                error={passwordErrors.password}
                inputClassName="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <TextField
                label="Confirm New Password *"
                type="password"
                placeholder="Re-enter new password"
                register={registerPassword}
                name="confirmPassword"
                error={passwordErrors.confirmPassword}
                inputClassName="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <DialogFooter className="gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPassword();
                  setIsPasswordModalOpen(false);
                }}
                disabled={isUpdating}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 h-11 px-6 flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/20 border-0 h-11 px-6 flex-1 transition-all duration-300 hover:scale-[1.02]"
              >
                {isUpdating ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminProfilePage;
