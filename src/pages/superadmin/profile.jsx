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
import FileUpload from "@/components/input/FileUpload";
import { useUploadMediaMutation } from "@/features/media/mediaApiSlice";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  Shield,
  Calendar,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
  Camera,
  Mail,
  Briefcase,
} from "lucide-react";

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
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const SuperAdminProfilePage = () => {
  const { user } = useSelector((state) => state.superadminAuth);
  const { data: currentSuperadmin, isLoading: isLoadingProfile } =
    useGetCurrentSuperadminQuery();
  const [updateSuperadmin, { isLoading: isUpdating }] =
    useUpdateSuperadminMutation();
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
      let photoUrl = data.photo;

      if (selectedFile) {
        const uploadResult = await uploadMedia({ file: selectedFile }).unwrap();
        if (uploadResult?.url || uploadResult?.data?.url) {
          photoUrl = uploadResult.url || uploadResult.data.url;
        } else {
          toast.error("Failed to upload image");
          return;
        }
      }

      const payload = {
        name: data.name,
        designation: data.designation || null,
        photo: photoUrl || null,
      };

      await updateSuperadmin({
        id: superadminId,
        ...payload,
      }).unwrap();
      toast.success("Profile updated successfully");
      setSelectedFile(null);
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
    <motion.div
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <User className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage your super admin profile and account settings.
            </p>
          </div>
        </div>
      </motion.div>

      {isLoadingProfile && (
        <motion.div
          variants={itemVariants}
          className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm"
        >
          <p className="text-sm text-slate-500">Loading profile...</p>
        </motion.div>
      )}

      {!isLoadingProfile && profileData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content - Left Column */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-8 space-y-8"
          >
            {/* Profile Information Form */}
            <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-black/40 transition-all duration-300">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-8">
                <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shadow-sm">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Update your personal details and public profile
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmitProfile(onProfileSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label="Full Name *"
                    placeholder="Enter your name"
                    register={registerProfile}
                    name="name"
                    error={profileErrors.name}
                    icon={<User className="h-4 w-4" />}
                    inputClassName="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 transition-all pl-10"
                  />

                  <TextField
                    label="Designation"
                    placeholder="Enter your designation"
                    register={registerProfile}
                    name="designation"
                    error={profileErrors.designation}
                    icon={<Briefcase className="h-4 w-4" />}
                    inputClassName="h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 focus:ring-violet-500 transition-all pl-10"
                  />
                </div>

                <div className="space-y-2">
                  <FileUpload
                    label="Profile Photo"
                    placeholder="Click to upload or drag and drop"
                    value={selectedFile || profileData.photo}
                    onChange={setSelectedFile}
                    accept="image/*"
                    className="w-full"
                    previewContainerClassName="h-32 w-32"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Supports JPG, PNG, WEBP (Max 5MB)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <Button
                    type="submit"
                    disabled={isUpdating || isUploading}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl h-11 px-8 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.02] transition-all duration-300"
                  >
                    {isUpdating || isUploading
                      ? "Saving Changes..."
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Sidebar - Right Column */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 space-y-8 sticky top-8"
          >
            {/* Profile Photo Card */}
            <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/20 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-violet-500 to-indigo-500 shadow-lg mb-4">
                  <div className="h-full w-full rounded-full border-4 border-white dark:border-[#1a1f26] overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {profileData.photo ? (
                      <img
                        src={profileData.photo}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <User className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    )}
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                {profileData.name || "Super Admin"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {profileData.designation || "Administrator"}
              </p>

              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(true)}
                className="w-full rounded-xl h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>

            {/* Account Overview */}
            <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-500" />
                Account Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Role
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    {profileData.role || "SUPER_ADMIN"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      profileData.isActive
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {profileData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
                      Timeline
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Created
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {profileData.createdAt
                          ? new Date(profileData.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Updated
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {profileData.updatedAt
                          ? new Date(profileData.updatedAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {profileData.permissions && profileData.permissions.length > 0 && (
              <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Key className="h-4 w-4 text-violet-500" />
                  Permissions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profileData.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className="text-[10px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-medium border border-slate-200 dark:border-slate-700"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
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
          <form
            onSubmit={handleSubmitPassword(onPasswordSubmit)}
            className="p-6 space-y-6"
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed">
                Ensure your account stays secure by choosing a strong, unique
                password.
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
    </motion.div>
  );
};

export default SuperAdminProfilePage;
