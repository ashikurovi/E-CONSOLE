import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSuperadminQuery } from "@/features/superadmin/superadminApiSlice";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Calendar, Shield } from "lucide-react";

const SuperAdminSuperadminDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const numericId = useMemo(() => Number(id), [id]);

  const { data: superadmin, isLoading, error } = useGetSuperadminQuery(
    numericId,
    { skip: !numericId }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Super Admin Detail</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            View detailed information about this super admin account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/superadmin/superadmins")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Super Admins
          </Button>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#1a1f26] border border-gray-100 dark:border-gray-800 p-5">
        {isLoading && <p className="text-sm">Loading super admin details…</p>}

        {error && (
          <p className="text-sm text-red-500">
            Failed to load super admin details.
          </p>
        )}

        {!isLoading && !error && !superadmin && (
          <p className="text-sm text-red-500">
            Super admin not found or no longer available.
          </p>
        )}

        {!isLoading && !error && superadmin && (
          <div className="space-y-6 text-sm">
            {/* Profile Photo Section */}
            {superadmin.photo && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <User className="h-4 w-4" />
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Profile Photo
                  </h3>
                </div>
                <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-black/5 dark:bg-white/5 inline-block">
                  <img
                    src={superadmin.photo}
                    alt="Profile"
                    className="h-32 w-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Basic Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <User className="h-4 w-4" />
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Basic Information
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">ID</p>
                  <p className="font-semibold">{superadmin.id ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Name</p>
                  <p className="font-semibold">{superadmin.name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Designation
                  </p>
                  <p className="font-medium">
                    {superadmin.designation ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Role</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    {superadmin.role || "SUPER_ADMIN"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">Status</p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      superadmin.isActive
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
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
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                  <Shield className="h-4 w-4" />
                  <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                    Permissions
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {superadmin.permissions.map((permission, index) => (
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

            {/* Timestamps Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                <Calendar className="h-4 w-4" />
                <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                  Activity Timeline
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Created At
                  </p>
                  <p className="text-xs font-medium">
                    {superadmin.createdAt
                      ? new Date(superadmin.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Last Updated
                  </p>
                  <p className="text-xs font-medium">
                    {superadmin.updatedAt
                      ? new Date(superadmin.updatedAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
                {superadmin.deletedAt && (
                  <div>
                    <p className="text-xs text-black/60 dark:text-white/60">
                      Deleted At
                    </p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">
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
