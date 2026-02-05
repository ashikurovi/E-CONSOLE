import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import AuthPage from "..";

// hooks and function
import { useForgotPasswordMutation } from "@/features/auth/authApiSlice";

// icons
import { letter } from "@/assets/icons/svgIcons";

const ForgotPasswordRequestPage = () => {
  const navigate = useNavigate();

  const { handleSubmit, register } = useForm();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const onSubmit = async (data) => {
    const res = await forgotPassword(data);
    if (res && res?.data?.success) {
      toast.success(res?.data?.message || "Reset Link sent successfully!");
      navigate("/forgot-password/check-email");
    } else {
      toast.error(res?.error?.data?.message || "Failed to send reset link!");
    }
  };

  return (
    <AuthPage title="Forgot Password" subtitle="">
      <>
        <p className="text-sm text-center text-black/40 dark:text-white/50">
          Recovery Email Address
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-8"
        >
          <TextField
            placeholder="Your Email Address"
            type="email"
            register={register}
            name="email"
            icon={letter}
            disabled={isLoading}
          />

          <SubmitButton isLoading={isLoading} disabled={isLoading}>
            {isLoading ? "Sending Email..." : "Send Reset Link"}
          </SubmitButton>
        </form>
        <p className="mt-8 text-sm text-center text-black/50 dark:text-white/50">
          Just Remebered Password? Go back to{" "}
          <Link to="/sign-in" className="text-primary">
            Sign In
          </Link>
        </p>
      </>
    </AuthPage>
  );
};

export default ForgotPasswordRequestPage;