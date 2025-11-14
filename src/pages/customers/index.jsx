import React, { useMemo } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { ShieldX, ShieldCheck, Trash2 } from "lucide-react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useBanUserMutation,
  useUnbanUserMutation,
} from "@/features/user/userApiSlice";
import CustomerForm from "./components/CustomerForm";


const CustomersPage = () => {
  const { data: users = [], isLoading } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [banUser, { isLoading: isBanning }] = useBanUserMutation();
  const [unbanUser, { isLoading: isUnbanning }] = useUnbanUserMutation();

  const headers = useMemo(
    () => [
      { header: "Name", field: "name" },
      { header: "Email", field: "email" },
      { header: "Phone", field: "phone" },
      { header: "Role", field: "role" },
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
        isActive: u.isActive ? "Yes" : "No",
        isBanned: u.isBanned ? "Yes" : "No",
        actions: (
          <div className="flex items-center gap-2 justify-end">
            {u.isBanned ? (
              <Button
                variant="outline"
                size="icon"
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
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Customers</h2>
        <CustomerForm />
      </div>
      <ReusableTable
        data={tableData}
        headers={headers}
        total={users.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default CustomersPage;