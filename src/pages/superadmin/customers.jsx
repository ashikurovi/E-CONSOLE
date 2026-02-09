import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, Users, AlertTriangle } from "lucide-react";
import {
    useGetSystemusersQuery,
    useDeleteSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import { useNavigate } from "react-router-dom";
import CustomerCreateForm from "./customers-components/CustomerCreateForm";
import CustomerEditForm from "./customers-components/CustomerEditForm";

const SuperAdminCustomersPage = () => {
    const navigate = useNavigate();
    const { data: users = [], isLoading } = useGetSystemusersQuery();
    const [deleteSystemuser, { isLoading: isDeleting }] =
        useDeleteSystemuserMutation();
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            await deleteSystemuser(userToDelete.id);
            setUserToDelete(null);
        }
    };

    const headers = useMemo(
        () => [
            { header: "Name", field: "name" },
            { header: "Company Name", field: "companyName" },
            { header: "Email", field: "email" },
            { header: "Company ID", field: "companyId" },
            { header: "Package", field: "packageName" },
            { header: "Theme", field: "theme" },
            { header: "Payment Status", field: "paymentStatus" },
            { header: "Active", field: "isActive" },
            { header: "Actions", field: "actions" },
        ],
        []
    );

    const tableData = useMemo(
        () =>
            users.map((u) => ({
                name: <span className="font-medium text-slate-900 dark:text-slate-100">{u.name ?? "-"}</span>,
                companyName: u.companyName ?? "-",
                email: u.email ?? "-",
                companyId: <span className="font-mono text-xs">{u.companyId ?? "-"}</span>,
                packageName: (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {u.package?.name || u.paymentInfo?.packagename || "-"}
                    </span>
                ),
                theme: u.theme ? (
                    <span className="text-xs px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-medium">
                        {u.theme.domainUrl || `Theme #${u.theme.id}`}
                    </span>
                ) : (
                    <span className="text-slate-400 dark:text-slate-500">-</span>
                ),
                paymentStatus: (
                    <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                        u.paymentInfo?.paymentstatus === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    }`}>
                        {u.paymentInfo?.paymentstatus ?? "-"}
                    </span>
                ),
                isActive: (
                    <span className={`inline-flex w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                ),
                actions: (
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/superadmin/customers/${u.id}`)}
                            title="View details"
                            className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="default"
                            size="icon"
                            onClick={() => setEditingUser(u)}
                            title="Edit"
                            className="h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/30 dark:shadow-violet-900/20"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(u)}
                            disabled={isDeleting}
                            title="Delete"
                            className="h-8 w-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 dark:shadow-rose-900/20"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
            })),
        [users, deleteSystemuser, isDeleting, navigate]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users className="w-64 h-64 -rotate-12" />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-3">Customers</h1>
                    <p className="text-violet-100 text-lg">
                        Central place to review, search and manage customer system users.
                    </p>
                </div>
            </div>

            {/* Customers table */}
            <div className="rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Customer users</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Listing users from the backend systemuser API.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomerCreateForm />
                    </div>
                </div>
                <div className="p-0">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-4"
                        total={users.length}
                        isLoading={isLoading}
                        searchable={false}
                        headerClassName="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    />
                </div>
            </div>

            {editingUser && (
                <CustomerEditForm
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                />
            )}

            <Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <DialogContent className="sm:max-w-[425px] rounded-[24px] p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="bg-gradient-to-br from-rose-500 to-red-600 p-6 text-white text-center">
                        <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Delete Customer?</DialogTitle>
                        <DialogDescription className="text-rose-100 mt-2">
                            This action cannot be undone. This will permanently delete the customer account for <span className="font-semibold text-white">"{userToDelete?.email}"</span>.
                        </DialogDescription>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900">
                        <DialogFooter className="gap-2 sm:justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setUserToDelete(null)}
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
                                {isDeleting ? "Deleting..." : "Yes, Delete Customer"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default SuperAdminCustomersPage;

