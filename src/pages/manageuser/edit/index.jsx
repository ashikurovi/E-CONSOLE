import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft, Save, UserCog, Shield, Building, Image as ImageIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock State
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const editUserSchema = useMemo(() => yup.object().shape({
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    companyName: yup
      .string()
      .required("Company name is required")
      .min(2, "Company name must be at least 2 characters")
      .max(100, "Company name must be less than 100 characters"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    phone: yup
      .string()
      .required("Phone number is required"),
    role: yup
      .string()
      .required("Role is required"),
    image: yup
      .string()
      .url("Must be a valid URL")
      .nullable(),
    password: yup
      .string()
      .nullable()
      .transform((value, originalValue) => (originalValue === "" ? null : value))
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),
    isActive: yup
      .boolean()
      .required("Status is required"),
  }), []);

  // Simulate fetching user data
  useEffect(() => {
    setIsLoadingUser(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      setUser({
        id: id,
        name: "Mock User",
        companyName: "SquadCart Inc.",
        email: "admin@squadcart.com",
        phone: "+1 (555) 123-4567",
        role: "SYSTEM_OWNER",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
        isActive: true,
      });
      setIsLoadingUser(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [id]);

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(editUserSchema),
    defaultValues: {
      id: "",
      name: "",
      companyName: "",
      email: "",
      phone: "",
      role: "EMPLOYEE",
      image: "",
      password: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        id: user.id,
        name: user.name || "",
        companyName: user.companyName || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "EMPLOYEE",
        image: user.image || "",
        password: "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast.success("System user updated");
    navigate("/manage-users");
  };

  if (isLoadingUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-64 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Edit System User
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update system user information and status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <UserCog className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Information
              </h3>
            </div>

            <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label="Name *"
                  placeholder="e.g. John Doe"
                  register={register}
                  name="name"
                  error={errors.name}
                  className="rounded-xl"
                />
                <TextField
                  label="Company Name *"
                  placeholder="e.g. SquadCart Inc."
                  register={register}
                  name="companyName"
                  error={errors.companyName}
                  className="rounded-xl"
                  icon={<Building className="h-4 w-4" />}
                />
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label="Email *"
                  type="email"
                  placeholder="e.g. john@company.com"
                  register={register}
                  name="email"
                  error={errors.email}
                  className="rounded-xl"
                />
                <TextField
                  label="Phone *"
                  placeholder="e.g. +1 234 567 890"
                  register={register}
                  name="phone"
                  error={errors.phone}
                  className="rounded-xl"
                />
              </div>

              {/* Role & Image */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">Role</label>
                  <div className="relative">
                    <select
                      {...register("role")}
                      className={`w-full border rounded-xl py-3 pl-4 pr-10 bg-gray-50 dark:bg-[#1a1f26] text-gray-900 dark:text-gray-100 outline-none appearance-none cursor-pointer transition-all duration-200 focus:bg-white dark:focus:bg-[#1a1f26] focus:shadow-sm ${
                        errors.role ? "border-red-500" : "border-gray-200 dark:border-gray-800 focus:border-black dark:focus:border-white"
                      }`}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="SYSTEM_OWNER">System Owner</option>
                    </select>
                    <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.role && <span className="text-red-500 text-xs ml-1 font-medium">{errors.role.message}</span>}
                </div>

                <TextField
                  label="Profile Image URL"
                  placeholder="https://..."
                  register={register}
                  name="image"
                  error={errors.image}
                  className="rounded-xl"
                  icon={<ImageIcon className="h-4 w-4" />}
                />
              </div>

              {/* Password & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label="New Password (optional)"
                  type="password"
                  placeholder="Leave blank to keep current"
                  register={register}
                  name="password"
                  error={errors.password}
                  className="rounded-xl"
                />
                
                {/* Status Toggle */}
                <div className="flex flex-col gap-2">
                   <label className="text-gray-700 dark:text-gray-300 text-sm font-medium ml-1">Account Status</label>
                   <div className="h-[50px] flex items-center px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1f26]">
                     <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center justify-between w-full">
                            <span className={`text-sm ${field.value ? "text-green-600 font-medium" : "text-gray-500"}`}>
                              {field.value ? "Active Account" : "Inactive Account"}
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        )}
                      />
                   </div>
                </div>
              </div>

            </form>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Actions</h3>
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/manage-users")}
                  disabled={isLoading}
                  className="w-full justify-start rounded-xl h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-user-form"
                  disabled={isLoading}
                  className="w-full justify-start rounded-xl h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 border-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="rounded-[24px] bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10 border border-indigo-100 dark:border-indigo-900/30 p-6">
              <h4 className="font-medium text-indigo-900 dark:text-indigo-200 mb-2">Role Permissions</h4>
              <ul className="text-sm text-indigo-700 dark:text-indigo-300/80 space-y-2 list-disc pl-4">
                <li><span className="font-semibold">System Owner:</span> Full access to everything.</li>
                <li><span className="font-semibold">Super Admin:</span> Manage users and settings.</li>
                <li><span className="font-semibold">Manager:</span> Manage orders and customers.</li>
                <li><span className="font-semibold">Employee:</span> Limited view and product management.</li>
              </ul>
            </div>
            
            <div className="rounded-[24px] bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-6">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Security Note</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300/80">
                Changing the password will require the user to log in again with the new credentials immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditUserPage;
