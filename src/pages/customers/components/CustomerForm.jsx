import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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
import { useSelector } from "react-redux";      
// Yup validation schema
const customerSchema = yup.object().shape({
  name: yup
    .string()
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: yup
    .string()
    .required("Email address is required")
    .email("Please enter a valid email address")
    .trim(),
  phone: yup
    .string()
    .max(20, "Phone number must be less than 20 characters")
    .matches(/^[+\d\s()-]*$/, "Please enter a valid phone number")
    .trim(),
  address: yup
    .string()
    .max(500, "Address must be less than 500 characters")
    .trim(),
});

const roleOptions = [
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
];

function CustomerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [roleOption, setRoleOption] = useState(roleOptions[0]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onChange",
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const authUser = useSelector((state) => state.auth.user);
  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      address: data.address || undefined,
      role: roleOption?.value || "customer",
      isActive: true,
    };

    const params = {
      companyId: authUser?.companyId,
    };

    const res = await createUser({ body: payload, params });
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 mt-4">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Personal Information
              </h3>
            </div>
            <TextField
              label="Full Name *"
              placeholder="John Doe"
              register={register}
              name="name"
              error={errors.name?.message}
            />
            <TextField
              label="Email Address *"
              placeholder="john@example.com"
              register={register}
              name="email"
              type="email"
              error={errors.email?.message}
            />
            <TextField
              label="Phone Number"
              placeholder="+880XXXXXXXXXX (optional)"
              register={register}
              name="phone"
              error={errors.phone?.message}
            />
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Address
              </h3>
            </div>
            <TextField
              label="Complete Address"
              placeholder="Enter full address (optional)"
              register={register}
              name="address"
              error={errors.address?.message}
            />
          </div>

          {/* Role & Permissions Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-sm font-semibold text-black/80 dark:text-white/80 uppercase tracking-wide">
                Role & Permissions
              </h3>
            </div>
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
          </div>

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