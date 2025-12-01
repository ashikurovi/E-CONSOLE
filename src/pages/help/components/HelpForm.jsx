import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCreateHelpMutation } from "@/features/help/helpApiSlice";

function HelpForm() {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const [createHelp, { isLoading: isCreating }] = useCreateHelpMutation();

  const onSubmit = async (data) => {
    const payload = {
      email: data.email,
      issue: data.issue,
    };

    const res = await createHelp(payload);
    if (res?.data) {
      toast.success("Help ticket created");
      reset();
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
      <DialogContent className="h-[350px]">
        <DialogHeader>
          <DialogTitle>Create Help Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Requester Email" type="email" register={register} name="email" />
          <TextField placeholder="Describe the issue" multiline rows={4} register={register} name="issue" />
          <DialogFooter>
            <div className="flex items-center w-full justify-end gap-2">
              <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" variant="ghost" type="button" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400" type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  );
}

export default HelpForm;