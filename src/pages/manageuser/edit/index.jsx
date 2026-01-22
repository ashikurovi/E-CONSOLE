import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useUpdateSystemuserMutation, useGetSystemuserQuery } from "@/features/systemuser/systemuserApiSlice";

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
  isActive: yup
    .boolean()
    .required("Status is required"),
});

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [updateUser, { isLoading }] = useUpdateSystemuserMutation();
  const { data: user, isLoading: isLoadingUser } = useGetSystemuserQuery(id, {
    skip: !id,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(editUserSchema),
    defaultValues: {
      id: user?.id,
      companyName: user?.companyName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      password: "",
      isActive: user?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        id: user.id,
        companyName: user.companyName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const payload = {
      id: data.id,
      companyName: data.companyName,
      email: data.email,
      phone: data.phone,
      role: "EMPLOYEE",
      isActive: Boolean(data.isActive),
    };
    if (data.password) {
      payload.password = data.password;
    }

    const res = await updateUser(payload);
    if (res?.data) {
      toast.success("System user updated");
      navigate("/manage-users");
    } else {
      toast.error(res?.error?.data?.message || "Failed to update");
    }
  };

  if (isLoadingUser) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#242424] border border-black/10 dark:border-white/10 p-6">
        <div className="text-center py-8">Loading user data...</div>
      </div>
    );
  }

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
          <h3 className="text-lg font-medium">Edit System User</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Update system user information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
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
            {isLoading ? "Updating..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditUserPage;
