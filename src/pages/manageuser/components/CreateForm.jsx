import React, { useState } from "react";
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
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useForm } from "react-hook-form";

const ROLE_OPTIONS = [
  { label: "System Owner", value: "systemOwner" },
  { label: "Order Management", value: "orderManagement" },
  { label: "Products Management", value: "productsManagement" },
  { label: "Inventory Management", value: "inventoryManagement" },
  { label: "Moderator", value: "moderator" },
  { label: "Developer", value: "developer" },
];

const CreateForm = () => {
  const [open, setOpen] = useState(false);
  const [createUser, { isLoading }] = useCreateSystemuserMutation();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      password: "",
      role: "systemOwner",
    },
  });

  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);

  const onSubmit = async (data) => {
    const res = await createUser(data);
    if (res?.data) {
      toast.success("System user created");
      setOpen(false);
      reset();
      setSelectedRole(ROLE_OPTIONS[0]);
    } else {
      toast.error(res?.error?.data?.message || "Failed to create");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm">New System User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create System User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <TextField
            label="Company Name"
            placeholder="Company Inc."
            register={register}
            name="companyName"
          />
          <TextField
            label="Email"
            type="email"
            placeholder="admin@company.com"
            register={register}
            name="email"
          />
          <TextField
            label="Phone"
            placeholder="+123456789"
            register={register}
            name="phone"
          />
          <TextField
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            register={register}
            name="password"
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Role</label>
            <Dropdown
              name="role"
              options={ROLE_OPTIONS}
              setSelectedOption={(opt) => {
                setSelectedRole(opt);
                setValue("role", opt.value);
              }}
            >
              {selectedRole?.label}
            </Dropdown>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateForm;