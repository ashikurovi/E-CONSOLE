import React from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import AuthPage from "..";

// hooks and function
import { useResetPasswordMutation } from "@/features/auth/authApiSlice";

// icons
import { password } from "@/assets/icons/svgIcons";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { handleSubmit, register } = useForm();

  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get("id");
  const token = searchParams.get("token");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const onSubmit = async (data) => {
    const res = await resetPassword({ userId, token, bodyData: data });
    if (res && res?.data?.success) {
      toast.success(res?.data?.message || "Reset password success!");
      navigate("/sign-in");
    } else {
      toast.error(res?.error?.data?.message || "Reset password failed!");
    }
  };

  return (
    <AuthPage title="Reset Password">
      <>
        <p className="text-sm text-center text-black/40 dark:text-white/50">
          Set A New Password
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-8"
        >
          <TextField
            placeholder="Type a New Password"
            register={register}
            name="password"
            type="password"
            icon={password}
            disabled={isLoading}
          />
          <TextField
            placeholder="Confirm your Password"
            register={register}
            name="confirmPassword"
            type="password"
            icon={password}
            disabled={isLoading}
          />

          <SubmitButton isLoading={isLoading} disabled={isLoading}>
            {isLoading ? "Password resetting..." : "Confirm Changes"}
          </SubmitButton>
        </form>
        <p className="mt-8 text-sm text-center text-black/50 dark:text-white/50">
          Want to open a New Account?{" "}
          <Link to="/create-account" className="text-primary">
            Sign Up
          </Link>
        </p>
      </>
    </AuthPage>
  );
};

export default ResetPasswordPage;