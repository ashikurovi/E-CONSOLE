import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSuperadminQuery } from "@/features/superadmin/superadminApiSlice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, Shield } from "lucide-react";

const SuperAdminSuperadminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);

  const {
    data: superadmin,
    isLoading,
    error,
  } = useGetSuperadminQuery(numericId, { skip: !numericId });

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <Shield className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Super Admin Detail
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View detailed information about this super admin account
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/superadmin/superadmins")}
          className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Super Admins
        </Button>
      </div>

      <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/20">
        {isLoading && (
          <p className="text-sm text-slate-500">
            Loading super admin details...
          </p>
        )}

        {error && (
          <p className="text-sm text-rose-500">
            Failed to load super admin details.
          </p>
        )}

        {!isLoading && !error && !superadmin && (
          <p className="text-sm text-rose-500">
            Super admin not found or no longer available.
          </p>
        )}

        {!isLoading && !error && superadmin && (
          <div className="space-y-8 text-sm">
            {/* Profile Photo Section */}
            {superadmin.photo && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Profile Photo
                  </h3>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-[24px] p-2 bg-slate-50 dark:bg-slate-900 inline-block shadow-lg shadow-slate-200/50 dark:shadow-black/20">
                  <img
                    src={superadmin.photo}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-[20px]"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    ID
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {superadmin.id ?? "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {superadmin.name ?? "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Designation
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {superadmin.designation ?? "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Role
                  </p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                    {superadmin.role || "SUPER_ADMIN"}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      superadmin.isActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {superadmin.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions Section */}
            {superadmin.permissions && superadmin.permissions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Permissions
                  </h3>
                </div>
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-2">
                    {superadmin.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="text-xs px-3 py-1.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-lg font-medium"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Timestamps Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Activity Timeline
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Created At
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {superadmin.createdAt
                      ? new Date(superadmin.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Last Updated
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {superadmin.updatedAt
                      ? new Date(superadmin.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {superadmin.deletedAt && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20">
                    <p className="text-xs font-medium text-rose-500 dark:text-rose-400 mb-1">
                      Deleted At
                    </p>
                    <p className="font-semibold text-rose-600 dark:text-rose-400">
                      {new Date(superadmin.deletedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminSuperadminDetailPage;
