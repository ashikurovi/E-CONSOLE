import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  useGetSystemusersQuery,
  useDeleteSystemuserMutation,
} from "@/features/systemuser/systemuserApiSlice";
import CreateForm from "./components/CreateForm";
import EditForm from "./components/EditForm";

const ManageUsersPage = () => {
  const { data: users = [], isLoading } = useGetSystemusersQuery();
  const [deleteSystemuser, { isLoading: isDeleting }] = useDeleteSystemuserMutation();
  const [editingUser, setEditingUser] = useState(null);
  console.log("users", users)
  const headers = useMemo(
    () => [
      { header: "Company", field: "companyName" },
      { header: "Email", field: "email" },
      { header: "Phone", field: "phone" },
      { header: "Role", field: "role" },
      { header: "Active", field: "isActive" },
      { header: "Actions", field: "actions" },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      users.map((u) => ({
        companyName: u.companyName ?? "-",
        email: u.email ?? "-",
        phone: u.phone ?? "-",
        role: u.role ?? "-",
        isActive: u.isActive ? "Yes" : "No",
        actions: (
          <div className="flex items-center gap-2 justify-end">
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
                const res = await deleteSystemuser(u.id);
                if (res?.data || !res?.error) toast.success("System user deleted");
                else toast.error(res?.error?.data?.message || "Failed to delete");
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
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Manage System Users</h2>
        <CreateForm />
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={users.length}
        isLoading={isLoading}
        py="py-2"
      />

      {editingUser && (
        <EditForm
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
};

export default ManageUsersPage;