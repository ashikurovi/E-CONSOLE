import React, { useMemo, useState } from "react";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
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
                name: u.name ?? "-",
                companyName: u.companyName ?? "-",
                email: u.email ?? "-",
                companyId: u.companyId ?? "-",
                packageName: u.package?.name || u.paymentInfo?.packagename || "-",
                theme: u.theme ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                        {u.theme.domainUrl || `Theme #${u.theme.id}`}
                    </span>
                ) : (
                    <span className="text-black/40 dark:text-white/40">-</span>
                ),
                paymentStatus: u.paymentInfo?.paymentstatus ?? "-",
                isActive: u.isActive ? "Yes" : "No",
                actions: (
                    <div className="flex items-center gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/superadmin/customers/${u.id}`)}
                            title="View details"
                            className="border-slate-300"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingUser(u)}
                            title="Edit"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={async () => {
                                if (!window.confirm(`Delete "${u.email}"?`)) return;
                                await deleteSystemuser(u.id);
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
        [users, deleteSystemuser, isDeleting]
    );

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-5 flex flex-col gap-2">
                <h1 className="text-2xl font-semibold">Customers</h1>
                <p className="text-sm text-black/60 dark:text-white/60">
                    Central place to review, search and manage customer system users.
                </p>
            </div>

            {/* Customers table */}
            <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-medium">Customer users</h2>
                        <p className="text-xs text-black/60 dark:text-white/60">
                            Listing users from the backend systemuser API.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <CustomerCreateForm />
                    </div>
                </div>
                <div className="p-4">
                    <ReusableTable
                        data={tableData}
                        headers={headers}
                        py="py-3"
                        total={users.length}
                        isLoading={isLoading}
                        searchable={false}
                    />
                </div>
            </div>

            {editingUser && (
                <CustomerEditForm
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                />
            )}
        </div>
    );
};

export default SuperAdminCustomersPage;

