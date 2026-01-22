import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import TextField from "@/components/input/TextField";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateSystemOwnerMutation } from "@/features/systemuser/systemuserApiSlice";

const createSystemOwnerSchema = yup.object().shape({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
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
});

const CreateSystemOwnerPage = () => {
  const navigate = useNavigate();
  const [createSystemOwner, { isLoading }] = useCreateSystemOwnerMutation();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(createSystemOwnerSchema),
    defaultValues: {
      name: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await createSystemOwner(data).unwrap();
      if (res) {
        toast.success("System Owner created successfully");
        navigate("/manage-users");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create System Owner");
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
          <h3 className="text-lg font-medium">Create System Owner</h3>
          <p className="text-sm text-black/60 dark:text-white/60 mt-1">
            Create a new System Owner who can manage users and assign permissions
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
          label="Company Name *"
          placeholder="Company Inc."
          register={register}
          name="companyName"
          error={errors.companyName}
        />

        <TextField
          label="Email *"
          type="email"
          placeholder="owner@company.com"
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

        <div className="flex justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/manage-users")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isLoading ? "Creating..." : "Create System Owner"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSystemOwnerPage;
