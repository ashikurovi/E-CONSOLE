import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { ShieldX, ShieldCheck, Trash2, Info } from "lucide-react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/user/userApiSlice";
import CustomerForm from "./components/CustomerForm";
import CustomerNotifications from "./components/CustomerNotifications";
import { exportToExcel } from "@/utils/excelExport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


const CustomersPage = () => {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();
  const [selectedBanDetails, setSelectedBanDetails] = useState(null);

  const handleExport = () => {
    if (!users?.length) {
      toast.error("No customers available to export");
      return;
    }

    exportToExcel({
      data: users,
      fileName: "customers",
      sheetName: "Customers",
      dataMapper: (customer) => ({
        Name: customer.name ?? "-",
        Email: customer.email ?? "-",
        Phone: customer.phone ?? "-",
        Role: customer.role ?? "customer",
        Active: customer.isActive ? "Yes" : "No",
        Banned: customer.isBanned ? "Yes" : "No",
        "Successful Orders": customer.successfulOrdersCount ?? 0,
        "Cancelled Orders": customer.cancelledOrdersCount ?? 0,
        "Ban Reason": customer.banReason ?? "-",
        "Banned At": customer.bannedAt
          ? new Date(customer.bannedAt).toLocaleString()
          : "-",
        "Created At": customer.createdAt
          ? new Date(customer.createdAt).toLocaleString()
          : "-",
      }),
      successMessage: "Customer list exported",
    });
  };

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "Email", field: "email" },
      { header: "Phone", field: "phone" },
      { header: "Role", field: "role" },
      { header: "Successful Orders", field: "successfulOrdersCount" },
      { header: "Cancelled Orders", field: "cancelledOrdersCount" },
      { header: "Active", field: "isActive" },
      { header: "Banned", field: "isBanned" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      users.map((u) => ({
        name: u.name ?? "-",
        email: u.email ?? "-",
        phone: u.phone ?? "-",
        role: u.role ?? "customer",
        successfulOrdersCount: u.successfulOrdersCount ?? 0,
        cancelledOrdersCount: u.cancelledOrdersCount ?? 0,
        isActive: u.isActive ? "Yes" : "No",
        isBanned: u.isBanned ? "Yes" : "No",
        actions: (
          <div className="flex items-center  gap-2 justify-end">
            {u.isBanned ? (
              <Button
                variant="secondary"
                size="icon"
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-black dark:hover:bg-blue-400"
                onClick={() => {
                  setSelectedBanDetails({
                    name: u.name ?? "-",
                    email: u.email ?? "-",
                    reason: u.banReason || "No reason provided",
                    bannedAt: u.bannedAt
                      ? new Date(u.bannedAt).toLocaleString()
                      : "Not available",
                  });
                }}
                title="View ban details"
              >
                <Info className="h-4 w-4" />
              </Button>
            ) : null}
            {u.isBanned ? (
              <Button
                variant="outline"
                size="icon"
                className="bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-400 dark:text-black dark:hover:bg-emerald-300 disabled:bg-emerald-400/70 disabled:text-white/80"
                onClick={async () => {
                  const res = await unbanUser(u.id);
                  if (res?.data) toast.success("User unbanned");
                  else toast.error(res?.error?.data?.message || "Failed to unban");
                }}
                disabled={isUnbanning}
                title="Unban"
              >
                <ShieldCheck className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="icon"
                className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:bg-red-500/60 disabled:text-white/70"
                onClick={async () => {
                  const reason = window.prompt("Ban reason (optional):") || undefined;
                  const res = await banUser({ id: u.id, reason });
                  if (res?.data) toast.success("User banned");
                  else toast.error(res?.error?.data?.message || "Failed to ban");
                }}
                disabled={isBanning}
                title="Ban"
              >
                <ShieldX className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-black dark:hover:bg-red-600 disabled:opacity-60"
              onClick={async () => {
                if (!window.confirm("Delete this user?")) return;
                const res = await deleteUser(u.id);
                if (res?.data || !res?.error) toast.success("User deleted");
                else toast.error(res?.error?.data?.message || "Failed to delete");
              }}
              disabled={isDeleting}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      })),
    [users, deleteUser, banUser, unbanUser, isDeleting, isBanning, isUnbanning]
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Customers</h2>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export Excel
          </Button>
          <CustomerNotifications />
          <CustomerForm />
        </div>
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={users.length}
        isLoading={isLoading}
        py="py-2"
      />
      <Dialog
        open={!!selectedBanDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedBanDetails(null);
        }}
      >
        <DialogContent className="max-w-md h-[400px] ">
          <DialogHeader>
            <DialogTitle>Ban Details</DialogTitle>
            <DialogDescription className='text-center'>
              View the ban context for this customer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 ">
            <div>
              <p className="text-xs uppercase text-black/50 dark:text-white/50">
                Customer
              </p>
              <p className="font-medium">
                {selectedBanDetails?.name} ({selectedBanDetails?.email})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-black/50 dark:text-white/50">
                Reason
              </p>
              <p className="font-medium whitespace-pre-wrap">
                {selectedBanDetails?.reason}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-black/50 dark:text-white/50">
                Banned At
              </p>
              <p className="font-medium">{selectedBanDetails?.bannedAt}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:text-black dark:hover:bg-red-600"
              onClick={() => setSelectedBanDetails(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default CustomersPage;