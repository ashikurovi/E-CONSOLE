import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pencil,
  Trash2,
  Eye,
  UserPlus,
  Shield,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
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
  const [superadminToDelete, setSuperadminToDelete] = useState(null);

  const handleDeleteClick = (sa) => {
    setSuperadminToDelete(sa);
  };

  const confirmDelete = async () => {
    if (superadminToDelete) {
      try {
        await deleteSuperadmin(superadminToDelete.id).unwrap();
      } catch (error) {
        console.error("Failed to delete superadmin:", error);
      }
      setSuperadminToDelete(null);
    }
  };

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
    [],
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
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:text-violet-600"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900"
              >
                <DropdownMenuItem
                  onClick={() => navigate(`/superadmin/superadmins/${sa.id}`)}
                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20"
                >
                  <Eye className="h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditingSuperadmin(sa)}
                  className="cursor-pointer gap-2 text-slate-600 dark:text-slate-300 focus:text-violet-600 focus:bg-violet-50 dark:focus:bg-violet-900/20"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(sa)}
                  disabled={isDeleting}
                  className="cursor-pointer gap-2 text-rose-600 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      })),
    [superadmins, deleteSuperadmin, isDeleting, navigate],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Super Admins
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage system administrators and their roles
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white border-0 shadow-lg shadow-violet-500/30 rounded-xl h-11 px-6"
        >
          <UserPlus className="h-4 w-4" />
          Add Super Admin
        </Button>
      </div>

      {/* Stats Cards */}

      {/* Superadmins table */}
      <div className="rounded-[14px] p-6 pb-6  bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Super Admin Users
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Listing all super admin accounts from the system.
            </p>
          </div>
        </div>
        <div className="p-0 ">
          <ReusableTable
            data={tableData}
            headers={headers}
            py="py-4"
            total={superadmins.length}
            isLoading={isLoading}
            searchable={false}
            headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
          />
        </div>
      </div>

      {isCreateModalOpen && (
        <SuperadminCreateForm onClose={() => setIsCreateModalOpen(false)} />
      )}

      {editingSuperadmin && (
        <SuperadminEditForm
          superadmin={editingSuperadmin}
          onClose={() => setEditingSuperadmin(null)}
        />
      )}

      <Dialog
        open={!!superadminToDelete}
        onOpenChange={(open) => !open && setSuperadminToDelete(null)}
      >
        <DialogContent className="sm:max-w-[425px] mr-2 ml-2 rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 text-white text-center">
            <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Delete Super Admin?
            </DialogTitle>
            <DialogDescription className="text-rose-100 mt-2">
              This action cannot be undone. This will permanently delete the
              account for{" "}
              <span className="font-semibold text-white">
                "{superadminToDelete?.name}"
              </span>
              .
            </DialogDescription>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900">
            <DialogFooter className="gap-2 sm:justify-center">
              <Button
                variant="outline"
                onClick={() => setSuperadminToDelete(null)}
                className="rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Account"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminSuperadminsPage;
