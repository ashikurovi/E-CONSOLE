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
import { useCreateUserMutation } from "@/features/user/userApiSlice";

const roleOptions = [
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
];

function CustomerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [roleOption, setRoleOption] = useState(roleOptions[0]);
  const { register, handleSubmit, reset } = useForm();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      role: roleOption?.value || "customer",
      isActive: true,
    };

    const res = await createUser(payload);
    if (res?.data) {
      toast.success("Customer created");
      reset();
      setRoleOption(roleOptions[0]);
      setIsOpen(false);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create customer");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Add Customer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
          <TextField placeholder="Name" register={register} name="name" />
          <TextField placeholder="Email" register={register} name="email" type="email" />
          <TextField placeholder="Phone (optional)" register={register} name="phone" />
          <TextField placeholder="Address (optional)" register={register} name="address" />
          <Dropdown
            name="Role"
            options={roleOptions}
            setSelectedOption={setRoleOption}
            className="py-2"
          >
            {roleOption?.label || (
              <span className="text-black/50 dark:text-white/50">Select Role</span>
            )}
          </Dropdown>

          <DialogFooter>
            <Button variant="ghost" type="button" className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400">
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CustomerForm;