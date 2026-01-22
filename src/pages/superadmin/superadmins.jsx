import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, UserPlus } from "lucide-react";
import {
  useGetSuperadminsQuery,
  useDeleteSuperadminMutation,
} from "@/features/superadmin/superadminApiSlice";
import { useNavigate } from "react-router-dom";
import SuperadminCreateForm from "./superadmin-components/SuperadminCreateForm";
import SuperadminEditForm from "./superadmin-components/SuperadminEditForm";

const SuperAdminSuperadminsPage = () => {
  const navigate = useNavigate();
  const { data: superadmins = [], isLoading } = useGetSuperadminsQuery();
  const [deleteSuperadmin, { isLoading: isDeleting }] =
    useDeleteSuperadminMutation();
  const [editingSuperadmin, setEditingSuperadmin] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Name", field: "name" },
      { header: "Designation", field: "designation" },
      { header: "Role", field: "role" },
      { header: "Status", field: "isActive" },
      { header: "Created At", field: "createdAt" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      superadmins.map((sa) => ({
        id: sa.id ?? "-",
        name: sa.name ?? "-",
        designation: sa.designation ?? "-",
        role: (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            {sa.role || "SUPER_ADMIN"}
          </span>
        ),
        isActive: sa.isActive ? (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
            Inactive
          </span>
        ),
        createdAt: sa.createdAt
          ? new Date(sa.createdAt).toLocaleDateString()
          : "-",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(`/superadmin/superadmins/${sa.id}`)}
              title="View details"
              className="border-slate-300"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditingSuperadmin(sa)}
              title="Edit"
              className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                if (
                  !window.confirm(
                    `Are you sure you want to delete "${sa.name}"? This action cannot be undone.`
                  )
                )
                  return;
                try {
                  await deleteSuperadmin(sa.id).unwrap();
                } catch (error) {
                  console.error("Failed to delete superadmin:", error);
                }
              }}
              disabled={isDeleting}
              title="Delete"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [superadmins, deleteSuperadmin, isDeleting, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Super Admins</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Manage all super admin accounts and their permissions.
        </p>
      </div>

      {/* Superadmins table */}
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Super Admin Users</h2>
            <p className="text-xs text-black/60 dark:text-white/60">
              Listing all super admin accounts from the system.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <UserPlus className="h-4 w-4" />
              Add Super Admin
            </Button>
          </div>
        </div>
        <div className="p-4">
          <ReusableTable
            data={tableData}
            headers={headers}
            py="py-3"
            total={superadmins.length}
            isLoading={isLoading}
            searchable={false}
          />
        </div>
      </div>

      {isCreateModalOpen && (
        <SuperadminCreateForm
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {editingSuperadmin && (
        <SuperadminEditForm
          superadmin={editingSuperadmin}
          onClose={() => setEditingSuperadmin(null)}
        />
      )}
    </div>
  );
};

export default SuperAdminSuperadminsPage;
