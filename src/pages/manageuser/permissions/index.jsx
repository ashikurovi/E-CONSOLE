import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Check, Shield } from "lucide-react";
import { FeaturePermission, API_ALLOWED_PERMISSION_VALUES } from "@/constants/feature-permission";
import { motion } from "framer-motion";
import { useGetPermissionsQuery, useAssignPermissionsMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

// Normalize permission to string code (backend may send string or { code, name, value })
const toPermissionCode = (p) =>
  typeof p === "string" ? p : (p?.code ?? p?.name ?? p?.value ?? "");

// Group permissions by category for better UX
const PERMISSION_GROUPS = {
  "Core Features": [
    { value: FeaturePermission.DASHBOARD, label: "Dashboard" },
    { value: FeaturePermission.PRODUCTS, label: "Products" },
    { value: FeaturePermission.ORDERS, label: "Orders" },
    { value: FeaturePermission.ORDERS_ITEM, label: "Order Items" },
    { value: FeaturePermission.CATEGORY, label: "Category" },
    { value: FeaturePermission.CUSTOMERS, label: "Customers" },
  ],
  "Management": [
    { value: FeaturePermission.MANAGE_USERS, label: "Manage Users" },
    { value: FeaturePermission.STAFF, label: "Staff" },
    { value: FeaturePermission.SETTINGS, label: "Settings" },
    { value: FeaturePermission.LOG_ACTIVITY, label: "Activity Logs" },
  ],
  "Marketing & Content": [
    { value: FeaturePermission.BANNERS, label: "Banners" },
    { value: FeaturePermission.PROMOCODES, label: "Promocodes" },
    { value: FeaturePermission.HELP, label: "Help" },
  ],
  "Notifications": [
    { value: FeaturePermission.NOTIFICATIONS, label: "Notifications" },
    { value: FeaturePermission.EMAIL_NOTIFICATIONS, label: "Email Notifications" },
    { value: FeaturePermission.WHATSAPP_NOTIFICATIONS, label: "WhatsApp Notifications" },
    { value: FeaturePermission.SMS_NOTIFICATIONS, label: "SMS Notifications" },
  ],
  "Shipping": [
    { value: FeaturePermission.STEARDFAST, label: "Steadfast Courier" },
    { value: FeaturePermission.PATHAO, label: "Pathao Courier" },
    { value: FeaturePermission.REDX, label: "RedX Courier" },
  ],
  "Reports & Analytics": [
    { value: FeaturePermission.REPORTS, label: "Reports" },
    { value: FeaturePermission.FRUAD_CHECKER, label: "Fraud Checker" },
    { value: FeaturePermission.REVENUE, label: "Revenue" },
    { value: FeaturePermission.NEW_CUSTOMERS, label: "New Customers" },
    { value: FeaturePermission.REPEAT_PURCHASE_RATE, label: "Repeat Purchase Rate" },
    { value: FeaturePermission.AVERAGE_ORDER_VALUE, label: "Average Order Value" },
    { value: FeaturePermission.STATS, label: "Stats" },
  ],
  "Payments": [
    { value: FeaturePermission.PAYMENT_METHODS, label: "Payment Methods" },
    { value: FeaturePermission.PAYMENT_GATEWAYS, label: "Payment Gateways" },
    { value: FeaturePermission.PAYMENT_STATUS, label: "Payment Status" },
    { value: FeaturePermission.PAYMENT_TRANSACTIONS, label: "Payment Transactions" },
  ],
  "Configuration": [
    { value: FeaturePermission.SMS_CONFIGURATION, label: "SMS Configuration" },
    { value: FeaturePermission.EMAIL_CONFIGURATION, label: "Email Configuration" },
  ],
};

const PermissionManagerPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const { data: permissionsData, isLoading: isLoadingPermissions } = useGetPermissionsQuery(id, {
    skip: !id,
  });
  const { data: currentUser } = useGetCurrentUserQuery();
  const [assignPermissions, { isLoading: isAssigning }] = useAssignPermissionsMutation();

  // System Owner's permissions: same logic as hasPermission – combine permissions + package.features, normalize to codes
  const systemOwnerPermissionCodes = useMemo(() => {
    const direct = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
    const fromPackage = Array.isArray(currentUser?.package?.features) ? currentUser.package.features : [];
    const all = [...direct, ...fromPackage];
    const codes = all.map(toPermissionCode).filter(Boolean);
    return new Set(codes);
  }, [currentUser]);

  // Only show permissions that the System Owner has (same as system owner's list)
  const availablePermissionGroups = useMemo(() => {
    const filtered = {};
    Object.entries(PERMISSION_GROUPS).forEach(([groupName, permissions]) => {
      const availablePermissions = permissions.filter((p) =>
        systemOwnerPermissionCodes.has(p.value)
      );
      if (availablePermissions.length > 0) {
        filtered[groupName] = availablePermissions;
      }
    });
    return filtered;
  }, [systemOwnerPermissionCodes]);

  // Load permissions from API: only keep API-allowed and only those the System Owner can assign
  useEffect(() => {
    if (permissionsData?.permissions) {
      const allowedSet = new Set(API_ALLOWED_PERMISSION_VALUES);
      const normalized = permissionsData.permissions.map(toPermissionCode).filter(Boolean);
      setSelectedPermissions((prev) => {
        const valid = normalized.filter(
          (p) => allowedSet.has(p) && systemOwnerPermissionCodes.has(p)
        );
        return valid.length ? valid : prev;
      });
    }
  }, [permissionsData, systemOwnerPermissionCodes]);

  const handlePermissionToggle = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleSelectAll = (groupPermissions) => {
    const allSelected = groupPermissions.every((p) => selectedPermissions.includes(p.value));
    if (allSelected) {
      // Deselect all in group
      setSelectedPermissions((prev) =>
        prev.filter((p) => !groupPermissions.map((gp) => gp.value).includes(p))
      );
    } else {
      // Select all in group
      const newPermissions = groupPermissions
        .map((gp) => gp.value)
        .filter((p) => !selectedPermissions.includes(p));
      setSelectedPermissions((prev) => [...prev, ...newPermissions]);
    }
  };

  const handleSelectAllPermissions = () => {
    const allAvailablePermissions = Object.values(availablePermissionGroups).flat().map((p) => p.value);
    if (selectedPermissions.length === allAvailablePermissions.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allAvailablePermissions);
    }
  };

  const handleSubmit = async () => {
    const allowedSet = new Set(API_ALLOWED_PERMISSION_VALUES);
    const permissionsToSend = selectedPermissions.filter((p) => allowedSet.has(p));
    try {
      await assignPermissions({ id, permissions: permissionsToSend }).unwrap();
      toast.success("Permissions assigned successfully");
      navigate("/manage-users");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign permissions");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const groupVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-[1400px] mx-auto p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/manage-users")}
            className="rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Manage Permissions
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure access levels and feature availability for this user
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSelectAllPermissions}
            className="rounded-xl border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {selectedPermissions.length === Object.values(availablePermissionGroups).flat().length
              ? "Deselect All"
              : "Select All Permissions"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isAssigning || isLoadingPermissions}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 rounded-xl px-6"
          >
            {isAssigning ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {isLoadingPermissions ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-[24px] animate-pulse" />
          ))}
        </div>
      ) : Object.keys(availablePermissionGroups).length === 0 ? (
        <div className="rounded-[24px] border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 p-8 text-center">
          <Shield className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Only permissions that the System Owner has can be assigned.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            No assignable permissions are available from your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(availablePermissionGroups).map(([groupName, permissions], index) => (
            <motion.div
              key={groupName}
              variants={groupVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-[#1e293b]/50 backdrop-blur-sm border border-gray-100 dark:border-gray-800 rounded-[24px] p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">{groupName}</h4>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(permissions)}
                  className="h-7 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                >
                  {permissions.every((p) => selectedPermissions.includes(p.value))
                    ? "None"
                    : "All"}
                </Button>
              </div>
              
              <div className="space-y-3">
                {permissions.map((permission) => {
                  const isSelected = selectedPermissions.includes(permission.value);
                  return (
                    <label
                      key={permission.value}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                        isSelected 
                          ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/50" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50 border-transparent"
                      }`}
                    >
                      <div className={`
                        flex items-center justify-center w-5 h-5 rounded-md border transition-colors
                        ${isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"}
                      `}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePermissionToggle(permission.value)}
                        className="hidden"
                      />
                      <span className={`text-sm ${isSelected ? "font-medium text-indigo-900 dark:text-indigo-100" : "text-gray-600 dark:text-gray-300"}`}>
                        {permission.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default PermissionManagerPage;
