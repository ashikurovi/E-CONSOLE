import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";

import { useUserRegisterMutation } from "@/features/auth/authApiSlice";
import AuthPage from "..";
import { letter, password, soundwave, user } from "@/assets/icons/svgIcons";

const RegisterPage = () => {
  const [searchParams] = useSearchParams();

  const campaign = searchParams.get("campaign");
  const referId = searchParams.get("referId");

  const { handleSubmit, register } = useForm();
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const navigate = useNavigate();

  const [userRegister, { isLoading }] = useUserRegisterMutation();
  const onSubmit = async (data) => {
    const bodyData = data;
    if (campaign) {
      bodyData.campaign = campaign;
    }
    if (referId) {
      bodyData.referId = referId;
      bodyData.page = "sign-up";
    }
    const res = await userRegister(bodyData);
    if (res && res.data?.success) {
      toast.success(
        res.data?.data?.message || "You are Successfully Registered."
      );
      navigate("/create-account/verify-email");
    } else {
      toast.error(
        res?.error?.data?.message || "Sorry! A Network Error Occured!"
      );
    }
  };
  return (
    <AuthPage title="Let's Get Started">
      <>
        <p className="text-sm text-center text-black/40 dark:text-white/50">
          Create a Account
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 mt-8"
        >
          <TextField
            placeholder="Your Full Name"
            register={register}
            name="fullName"
            icon={user}
          />
          <TextField
            placeholder="username"
            register={register}
            name="userName"
            icon={soundwave}
          />
          <TextField
            placeholder="Your Email Address"
            type="email"
            register={register}
            name="email"
            icon={letter}
          />
          <TextField
            placeholder="Type a strong password"
            type="password"
            register={register}
            name="password"
            icon={password}
          />
          <TextField
            placeholder="Confirm your password"
            type="password"
            register={register}
            name="confirmPassword"
            icon={password}
          />

          <div className="fl text-sm">
            <Checkbox
              name="policy"
              value={acceptedPolicy}
              setValue={setAcceptedPolicy}
            ></Checkbox>
            <div className="mt-0.5 dark:text-white/75">
              Please Accept the{" "}
              <Link to="/privacy-policy" className="text-primary underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                to="/terms-of-conditions"
                className="text-primary underline"
              >
                Terms of Conditions
              </Link>
            </div>
          </div>

          <SubmitButton
            isLoading={isLoading}
            disabled={!acceptedPolicy || isLoading}
            className={!acceptedPolicy ? "opacity-40" : ""}
          >
            {isLoading ? "Creating your Account..." : "Create Account"}
          </SubmitButton>
        </form>
        <p className="mt-6 text-sm text-center text-black/40 dark:text-white/50">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary">
            Sign In
          </Link>
        </p>
      </>
    </AuthPage>
  );
};

export default RegisterPage;