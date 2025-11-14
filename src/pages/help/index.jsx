import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import ReusableTable from "@/components/table/reusable-table";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  useGetHelpQuery,
  useCreateHelpMutation,
  useUpdateHelpMutation,
  useDeleteHelpMutation,
} from "@/features/help/helpApiSlice";

import HelpForm from "./components/HelpForm";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

function HelpPage() {
  const { data: tickets = [], isLoading } = useGetHelpQuery();
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();
  const [updateHelp, { isLoading: isUpdating }] = useUpdateHelpMutation();
  const [deleteHelp, { isLoading: isDeleting }] = useDeleteHelpMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newIssue, setNewIssue] = useState("");

  const headers = useMemo(
    () => [
      { header: "ID", field: "id" },
      { header: "Email", field: "email" },
      { header: "Issue", field: "issue" },
      { header: "Status", field: "status" },
      { header: "Created", field: "createdAt" },
      { header: "Actions", field: "actions", sortable: false },
    ],
    []
  );

  const tableData = useMemo(
    () =>
      tickets.map((t) => {
        const currentStatus = STATUS_OPTIONS.find((s) => s.value === t.status) || STATUS_OPTIONS[0];
        return {
          id: t.id,
          email: t.email,
          issue: (t.issue?.length > 120 ? `${t.issue.slice(0, 120)}…` : t.issue) || "-",
          status: (
            <Dropdown
              name="Status"
              options={STATUS_OPTIONS}
              setSelectedOption={async (opt) => {
                const res = await updateHelp({ id: t.id, status: opt.value });
                if (res?.data) {
                  toast.success("Status updated");
                } else {
                  toast.error(res?.error?.data?.message || "Failed to update status");
                }
              }}
              className="py-1.5"
            >
              {currentStatus?.label || "Pending"}
            </Dropdown>
          ),
          createdAt: t.createdAt ? new Date(t.createdAt).toLocaleString() : "-",
          actions: (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (!confirm(`Delete ticket #${t.id}?`)) return;
                  const res = await deleteHelp(t.id);
                  if (res?.data || res?.error == null) {
                    toast.success("Ticket deleted");
                  } else {
                    toast.error("Failed to delete ticket");
                  }
                }}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </div>
          ),
        };
      }),
    [tickets, updateHelp, deleteHelp, isDeleting]
  );

  const onSubmitNewTicket = async (e) => {
    e.preventDefault();
    if (!newEmail || !newIssue) {
      toast.error("Email and Issue are required");
      return;
    }
    const res = await createHelp({ email: newEmail, issue: newIssue });
    if (res?.data) {
      toast.success("Help ticket created");
      setNewEmail("");
      setNewIssue("");
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Help & Support</h3>
        {/* Create form trigger */}
        <HelpForm />
      </div>

      <ReusableTable
        data={tableData}
        headers={headers}
        total={tickets.length}
        isLoading={isLoading}
        py="py-2"
      />
    </div>
  );
};

export default HelpPage;