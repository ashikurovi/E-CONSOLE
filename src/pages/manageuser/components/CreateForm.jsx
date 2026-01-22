import React, { useState } from "react";
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
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const createUserSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
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
});

const CreateForm = () => {
  const [open, setOpen] = useState(false);
  const [createUser, { isLoading }] = useCreateSystemuserMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    // Use System Owner's companyName for the user, default role to EMPLOYEE
    const payload = {
      ...data,
      companyName: currentUser?.companyName || "Company",
      role: "EMPLOYEE",
    };
    
    const res = await createUser(payload);
    if (res?.data) {
      toast.success("System user created successfully");
      setOpen(false);
      reset();
    } else {
      toast.error(res?.error?.data?.message || "Failed to create system user");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger asChild>
        <Button size="sm">New System Role</Button>
      </DialogTrigger>
      <DialogContent className="h-[600px]">
        <DialogHeader>
          <DialogTitle>Create Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <TextField
            label="Name *"
            placeholder="John Doe"
            register={register}
            name="name"
            error={errors.name}
          />
          <TextField
            label="Email *"
            type="email"
            placeholder="employee@company.com"
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
          <p className="text-xs text-black/60 dark:text-white/60">
            You can assign permissions after creation.
          </p>
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