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
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const ROLE_OPTIONS = [
  { label: "Order Management", value: "orderManagement" },
  { label: "Products Management", value: "productsManagement" },
  { label: "Inventory Management", value: "inventoryManagement" },
  { label: "Moderator", value: "moderator" },
];

const createUserSchema = yup.object().shape({
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
    .required("Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters"),
  role: yup
    .string()
    .required("Role is required")
    .oneOf(
      ROLE_OPTIONS.map((r) => r.value),
      "Please select a valid role"
    ),
});

const CreateForm = () => {
  const [open, setOpen] = useState(false);
  const [createUser, { isLoading }] = useCreateSystemuserMutation();

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      password: "",
      role: "orderManagement",
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
        <Button size="sm">New System Role</Button>
      </DialogTrigger>
      <DialogContent className="h-[600px]">
        <DialogHeader>
          <DialogTitle>Create System User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <TextField
            label="Company Name *"
            placeholder="Company Inc."
            register={register}
            name="companyName"
            error={errors.companyName}
          />
          <TextField
            label="Email *"
            type="email"
            placeholder="admin@company.com"
            register={register}
            name="email"
            error={errors.email}
          />
          <TextField
            label="Phone *"
            placeholder="+123456789"
            register={register}
            name="phone"
            error={errors.phone}
          />
          <TextField
            label="Password *"
            type="password"
            placeholder="At least 6 characters"
            register={register}
            name="password"
            error={errors.password}
          />
          <div className="flex flex-col gap-2">
            <label className="text-black/50 dark:text-white/50 text-sm ml-1">Role</label>
            <Dropdown
              name="role *"
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
          <DialogFooter>
            <Button className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400" type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateForm;