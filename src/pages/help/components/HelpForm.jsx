import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
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
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
];

function HelpForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [statusOption, setStatusOption] = useState(STATUS_OPTIONS[0]);
  const { register, handleSubmit, reset } = useForm();
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      issue: data.issue,
      status: statusOption?.value, // optional; backend defaults to pending
    };

    const res = await createHelp(payload);
    if (res?.data) {
      toast.success("Help ticket created");
      reset();
      setStatusOption(STATUS_OPTIONS[0]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create ticket");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Help Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Requester Email" type="email" register={register} name="email" />
          <TextField placeholder="Describe the issue" register={register} name="issue" />
          <Dropdown
            name="Status"
            options={STATUS_OPTIONS}
            setSelectedOption={setStatusOption}
            className="py-2"
          >
            {statusOption?.label || "Pending"}
          </Dropdown>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default HelpForm;