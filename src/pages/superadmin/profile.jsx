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
import { User, Shield, Calendar, Key } from "lucide-react";

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
      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">My Profile</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Manage your super admin profile and account settings.
        </p>
      </div>

      {isLoadingProfile && (
        <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm">Loading profile...</p>
        </div>
      )}

      {!isLoadingProfile && profileData && (
        <>
          {/* Profile Photo Section */}
          {profileData.photo && (
            <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <User className="h-4 w-4" />
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Profile Photo
                </h3>
              </div>
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-black/5 dark:bg-white/5 inline-block">
                <img
                  src={profileData.photo}
                  alt="Profile"
                  className="h-32 w-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Profile Information Form */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Profile Information
              </h3>
            </div>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <TextField
                label="Name *"
                placeholder="Enter your name"
                register={registerProfile}
                name="name"
                error={profileErrors.name}
              />

              <TextField
                label="Designation"
                placeholder="Enter your designation (optional)"
                register={registerProfile}
                name="designation"
                error={profileErrors.designation}
              />

              <TextField
                label="Photo URL"
                placeholder="Enter photo URL (optional)"
                register={registerProfile}
                name="photo"
                error={profileErrors.photo}
              />

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </form>
          </div>

          {/* Account Information Section */}
          <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
              <Shield className="h-4 w-4" />
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Account Information
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">ID</p>
                <p className="font-semibold">{profileData.id ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">Role</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                  {profileData.role || "SUPER_ADMIN"}
                </span>
              </div>
              <div>
                <p className="text-xs text-black/60 dark:text-white/60">Status</p>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    profileData.isActive
                      ? "bg-green-500/10 text-green-600 dark:text-green-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {profileData.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Permissions */}
            {profileData.permissions &&
              profileData.permissions.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-black/60 dark:text-white/60 mb-2">
                    Permissions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                <p className="text-xs text-black/60 dark:text-white/60">
                  Activity Timeline
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Created At
                  </p>
                  <p className="text-xs font-medium">
                    {profileData.createdAt
                      ? new Date(profileData.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Last Updated
                  </p>
                  <p className="text-xs font-medium">
                    {profileData.updatedAt
                      ? new Date(profileData.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1f26] rounded-lg p-6 max-w-md w-full mx-4 border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form
              onSubmit={handleSubmitPassword(onPasswordSubmit)}
              className="space-y-4"
            >
              <TextField
                label="New Password *"
                type="password"
                placeholder="Enter new password (min. 6 characters)"
                register={registerPassword}
                name="password"
                error={passwordErrors.password}
              />
              <TextField
                label="Confirm New Password *"
                type="password"
                placeholder="Re-enter new password"
                register={registerPassword}
                name="confirmPassword"
                error={passwordErrors.confirmPassword}
              />
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetPassword();
                    setIsPasswordModalOpen(false);
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminProfilePage;
