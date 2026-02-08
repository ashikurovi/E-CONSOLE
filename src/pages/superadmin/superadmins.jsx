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
          <span className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 font-medium">
            {sa.role || "SUPER_ADMIN"}
          </span>
        ),
        isActive: sa.isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
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
              className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => setEditingSuperadmin(sa)}
              title="Edit"
              className="h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 dark:shadow-violet-900/20"
            >
              <Pencil className="h-3.5 w-3.5" />
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
              className="h-8 w-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 dark:shadow-rose-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      })),
    [superadmins, deleteSuperadmin, isDeleting, navigate]
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Super Admins</h1>
            <p className="text-violet-100 mt-1">
              Manage system administrators and their roles
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-white text-violet-600 hover:bg-violet-50 border-0 shadow-lg shadow-black/10"
          >
            <UserPlus className="h-4 w-4" />
            Add Super Admin
          </Button>
        </div>
      </div>

      {/* Stats Cards */}

      {/* Superadmins table */}
      <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Super Admin Users</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Listing all super admin accounts from the system.
            </p>
          </div>
        </div>
        <div className="p-0">
          <ReusableTable
            data={tableData}
            headers={headers}
            py="py-4"
            total={superadmins.length}
            isLoading={isLoading}
            searchable={false}
            headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
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
