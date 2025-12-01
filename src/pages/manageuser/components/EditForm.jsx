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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const ROLE_OPTIONS = [
  { label: "Order Management", value: "orderManagement" },
  { label: "Products Management", value: "productsManagement" },
  { label: "Inventory Management", value: "inventoryManagement" },
  { label: "Moderator", value: "moderator" },
];

const editUserSchema = yup.object().shape({
  companyName: yup
    .string()
    .required("Company name is required")
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be less than 100 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, "Please enter a valid phone number"),
  password: yup
    .string()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .test("password-length", "Password must be at least 6 characters", function (value) {
      if (!value || value === "") return true; // Optional field
      return value.length >= 6;
    })
    .test("password-max", "Password must be less than 50 characters", function (value) {
      if (!value || value === "") return true; // Optional field
      return value.length <= 50;
    }),
  role: yup
    .string()
    .required("Role is required")
    .oneOf(
      ROLE_OPTIONS.map((r) => r.value),
      "Please select a valid role"
    ),
  isActive: yup
    .boolean()
    .required("Status is required"),
});

const EditForm = ({ user, onClose }) => {
  const [updateUser, { isLoading }] = useUpdateSystemuserMutation();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(editUserSchema),
    defaultValues: {
      id: user?.id,
      companyName: user?.companyName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "orderManagement",
      password: "",
      isActive: user?.isActive ?? true,
    },
  });

  const [selectedRole, setSelectedRole] = useState(
    ROLE_OPTIONS.find((r) => r.value === (user?.role || "orderManagement")) || ROLE_OPTIONS[0]
  );

  useEffect(() => {
    reset({
      id: user?.id,
      companyName: user?.companyName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "orderManagement",
      password: "",
      isActive: user?.isActive ?? true,
    });
    const roleOpt =
      ROLE_OPTIONS.find((r) => r.value === (user?.role || "orderManagement")) || ROLE_OPTIONS[0];
    setSelectedRole(roleOpt);
  }, [user, reset]);

  const onSubmit = async (data) => {
    const payload = {
      id: data.id,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      isActive: Boolean(data.isActive),
    };
    if (data.password) {
      payload.password = data.password;
    }

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
      <DialogContent className="h-[600px]">
        <DialogHeader>
          <DialogTitle>Edit System User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <TextField
            label="Company Name *"
            register={register}
            name="companyName"
            error={errors.companyName}
          />
          <TextField
            label="Email *"
            type="email"
            register={register}
            name="email"
            error={errors.email}
          />
          <TextField
            label="Phone *"
            register={register}
            name="phone"
            error={errors.phone}
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Role *</label>
            <Dropdown
              name="role"
              options={ROLE_OPTIONS}
              setSelectedOption={(opt) => {
                setSelectedRole(opt);
                setValue("role", opt.value, { shouldValidate: true });
              }}
            >
              {selectedRole?.label}
            </Dropdown>
            {errors.role && (
              <span className="text-red-500 text-xs ml-1">{errors.role.message}</span>
            )}
          </div>
          <TextField
            label="New Password (optional)"
            type="password"
            placeholder="Leave blank to keep current password"
            register={register}
            name="password"
            error={errors.password}
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Status</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="w-4 h-4 rounded border-black/20 dark:border-white/20"
              />
              <span className="text-sm">Active</span>
            </label>
            {errors.isActive && (
              <span className="text-red-500 text-xs ml-1">{errors.isActive.message}</span>
            )}
          </div>
          <DialogFooter>
            <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" type="button" variant="outline" onClick={() => onClose?.()}>
              Cancel
            </Button>
            <Button className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditForm;