import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft, Save, UserPlus, Shield, Building, Image as ImageIcon } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

const CreateUserPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const isLoading = false;

  const createUserSchema = useMemo(
    () =>
      yup.object().shape({
        name: yup
          .string()
          .required(t("manageUsers.validation.nameRequired"))
          .min(2, t("manageUsers.validation.nameMin")),
        companyName: yup
          .string()
          .required("Company Name is required"),
        email: yup
          .string()
          .required(t("manageUsers.validation.emailRequired"))
          .email(t("manageUsers.validation.emailInvalid")),
        phone: yup
          .string()
          .required(t("manageUsers.validation.phoneRequired")),
        role: yup
          .string()
          .required("Role is required"),
        image: yup
          .string()
          .url("Must be a valid URL")
          .nullable(),
        password: yup
          .string()
          .required(t("manageUsers.validation.passwordRequired"))
          .min(6, t("manageUsers.validation.passwordMin")),
        isActive: yup
          .boolean()
          .default(true),
      }),
    [t]
  );

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
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

  const onSubmit = async (data) => {
    // Mock submission to match the structure in index.jsx
    const newUser = {
      id: `USR-${Math.floor(Math.random() * 1000)}`,
      name: data.name,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      permissions: getPermissionsForRole(data.role),
      isActive: data.isActive,
      image: data.image || null,
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: "Just now",
      activities: [
        { 
          id: 1, 
          text: "Account created", 
          time: "Just now", 
          type: "system" 
        }
      ]
    };
    
    console.log("Creating User:", newUser); // For debugging/verification
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(t("manageUsers.userCreated"));
    navigate("/manage-users");
  };

  const getPermissionsForRole = (role) => {
    switch(role) {
      case "SYSTEM_OWNER": return ["ALL_ACCESS"];
      case "SUPER_ADMIN": return ["MANAGE_USERS", "VIEW_REPORTS", "MANAGE_SETTINGS"];
      case "MANAGER": return ["MANAGE_ORDERS", "VIEW_CUSTOMERS", "VIEW_REPORTS"];
      case "EMPLOYEE": return ["VIEW_ORDERS", "MANAGE_PRODUCTS"];
      default: return [];
    }
  };

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
            {t("manageUsers.createEmployee")}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create a new system user with specific role and access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[24px] bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <UserPlus className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Information
              </h3>
            </div>

            <form id="create-user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("manageUsers.nameLabel")}
                  placeholder="e.g. John Doe"
                  register={register}
                  name="name"
                  error={errors.name}
                  className="rounded-xl"
                />
                <TextField
                  label="Company Name"
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
                  label={t("manageUsers.emailLabel")}
                  type="email"
                  placeholder="e.g. john@company.com"
                  register={register}
                  name="email"
                  error={errors.email}
                  className="rounded-xl"
                />
                <TextField
                  label={t("manageUsers.phoneLabel")}
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

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TextField
                  label={t("manageUsers.passwordLabel")}
                  type="password"
                  placeholder="••••••••"
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
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  form="create-user-form"
                  disabled={isLoading}
                  className="w-full justify-start rounded-xl h-12 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 border-0"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? t("common.saving") : t("common.create")}
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateUserPage;
