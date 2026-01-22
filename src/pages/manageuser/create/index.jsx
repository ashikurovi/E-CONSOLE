import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useGetCurrentUserQuery } from "@/features/auth/authApiSlice";

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

const CreateUserPage = () => {
  const navigate = useNavigate();
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
      navigate("/manage-users");
    } else {
      toast.error(res?.error?.data?.message || "Failed to create system user");
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="bg-black dark:bg-black hover:bg-black/80 dark:hover:bg-black/80 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="text-lg font-medium">Create Employee</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Create a new system user with employee role
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/manage-users")}
            disabled={isLoading}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400"
          >
            {isLoading ? "Saving..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserPage;
