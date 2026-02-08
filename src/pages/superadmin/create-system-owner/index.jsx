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
    <div className="rounded-[24px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/manage-users")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full h-10 w-10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create System Owner</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a new System Owner who can manage users and assign permissions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Name *"
            placeholder="John Doe"
            register={register}
            name="name"
            error={errors.name}
            className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-xl"
          />

          <TextField
            label="Company Name *"
            placeholder="Company Inc."
            register={register}
            name="companyName"
            error={errors.companyName}
            className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Email *"
            type="email"
            placeholder="owner@company.com"
            register={register}
            name="email"
            error={errors.email}
            className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-xl"
          />

          <TextField
            label="Phone *"
            placeholder="+123456789"
            register={register}
            name="phone"
            error={errors.phone}
            className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-xl"
          />
        </div>

        <TextField
          label="Password *"
          type="password"
          placeholder="At least 6 characters"
          register={register}
          name="password"
          error={errors.password}
          className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 focus:border-violet-500 rounded-xl"
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/manage-users")}
            disabled={isLoading}
            className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl h-11 px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl h-11 px-8 shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02]"
          >
            {isLoading ? "Creating..." : "Create System Owner"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSystemOwnerPage;
