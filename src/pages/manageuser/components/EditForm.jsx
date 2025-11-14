import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import Dropdown from "@/components/dropdown/dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUpdateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useForm } from "react-hook-form";

const ROLE_OPTIONS = [
  { label: "System Owner", value: "systemOwner" },
  { label: "Order Management", value: "orderManagement" },
  { label: "Products Management", value: "productsManagement" },
  { label: "Inventory Management", value: "inventoryManagement" },
  { label: "Moderator", value: "moderator" },
  { label: "Developer", value: "developer" },
];

const EditForm = ({ user, onClose }) => {
  const [updateUser, { isLoading }] = useUpdateSystemuserMutation();

  const { register, handleSubmit, setValue, reset } = useForm({
    defaultValues: {
      id: user?.id,
      companyName: user?.companyName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "systemOwner",
      password: "",
    },
  });

  const [selectedRole, setSelectedRole] = useState(
    ROLE_OPTIONS.find((r) => r.value === (user?.role || "systemOwner")) || ROLE_OPTIONS[0]
  );

  useEffect(() => {
    reset({
      id: user?.id,
      companyName: user?.companyName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "systemOwner",
      password: "",
    });
    const roleOpt =
      ROLE_OPTIONS.find((r) => r.value === (user?.role || "systemOwner")) || ROLE_OPTIONS[0];
    setSelectedRole(roleOpt);
  }, [user, reset]);

  const onSubmit = async (data) => {
    const payload = { ...data };
    if (!payload.password) delete payload.password; // optional

    const res = await updateUser(payload);
    if (res?.data) {
      toast.success("System user updated");
      onClose?.();
    } else {
      toast.error(res?.error?.data?.message || "Failed to update");
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(v) => !v && onClose?.()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit System User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <TextField
            label="Company Name"
            register={register}
            name="companyName"
          />
          <TextField
            label="Email"
            type="email"
            register={register}
            name="email"
          />
          <TextField
            label="Phone"
            register={register}
            name="phone"
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
          <TextField
            label="New Password (optional)"
            type="password"
            placeholder="Leave blank to keep current password"
            register={register}
            name="password"
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditForm;