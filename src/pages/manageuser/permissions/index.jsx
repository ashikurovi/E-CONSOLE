import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAssignPermissionsMutation, useGetPermissionsQuery } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { FeaturePermission } from "@/constants/feature-permission";

// Group permissions by category for better UX
const PERMISSION_GROUPS = {
  "Core Features": [
    { value: FeaturePermission.DASHBOARD, label: "Dashboard" },
    { value: FeaturePermission.PRODUCTS, label: "Products" },
    { value: FeaturePermission.ORDERS, label: "Orders" },
    { value: FeaturePermission.ORDERS_ITEM, label: "Order Items" },
    { value: FeaturePermission.CATEGORY, label: "Category" },
    { value: FeaturePermission.CUSTOMERS, label: "Customers" },
    { value: FeaturePermission.INVENTORY, label: "Inventory" },
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
    { value: FeaturePermission.STEADFAST, label: "Steadfast Courier" },
    { value: FeaturePermission.PATHAO, label: "Pathao Courier" },
    { value: FeaturePermission.REDX, label: "RedX Courier" },
  ],
  "Reports & Analytics": [
    { value: FeaturePermission.REPORTS, label: "Reports" },
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
    { value: FeaturePermission.FRUAD_CHECKER, label: "Fraud Checker" },
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

  // Get current user's permissions (System Owner's permissions from their package)
  const currentUserPermissions = useMemo(() => {
    // Get permissions from user object (from JWT or API)
    return currentUser?.permissions || currentUser?.package?.features || [];
  }, [currentUser]);

  // Filter permission groups to only show permissions the System Owner has
  const availablePermissionGroups = useMemo(() => {
    if (!currentUserPermissions || currentUserPermissions.length === 0) {
      return PERMISSION_GROUPS; // Show all if no permissions (shouldn't happen)
    }

    const filtered = {};
    Object.entries(PERMISSION_GROUPS).forEach(([groupName, permissions]) => {
      const availablePermissions = permissions.filter((p) =>
        currentUserPermissions.includes(p.value)
      );
      if (availablePermissions.length > 0) {
        filtered[groupName] = availablePermissions;
      }
    });
    return filtered;
  }, [currentUserPermissions]);

  useEffect(() => {
    if (permissionsData?.permissions) {
      setSelectedPermissions(permissionsData.permissions);
    }
  }, [permissionsData]);

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
    try {
      await assignPermissions({ id, permissions: selectedPermissions }).unwrap();
      toast.success("Permissions assigned successfully");
      navigate("/manage-users");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to assign permissions");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium">Manage Permissions</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Assign permissions to system user
          </p>
        </div>
      </div>

      {isLoadingPermissions ? (
        <div className="text-center py-8">Loading permissions...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Select Permissions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAllPermissions}
            >
              {selectedPermissions.length ===
              Object.values(availablePermissionGroups).flat().length
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>

          {Object.keys(availablePermissionGroups).length === 0 && (
            <div className="text-center py-8 text-sm text-black/60 dark:text-white/60">
              No permissions available. You need to purchase a package first to assign permissions.
            </div>
          )}

          {Object.entries(availablePermissionGroups).map(([groupName, permissions]) => (
            <div key={groupName} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">{groupName}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSelectAll(permissions)}
                  className="text-xs"
                >
                  {permissions.every((p) => selectedPermissions.includes(p.value))
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {permissions.map((permission) => (
                  <label
                    key={permission.value}
                    className="flex items-center gap-2 p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.value)}
                      onChange={() => handlePermissionToggle(permission.value)}
                      className="w-4 h-4 rounded border-black/20 dark:border-white/20"
                    />
                    <span className="text-sm">{permission.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/manage-users")}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isAssigning || isLoadingPermissions}
          className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
        >
          {isAssigning ? "Assigning..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  );
};

export default PermissionManagerPage;
