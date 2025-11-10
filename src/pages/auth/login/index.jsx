import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import AuthPage from "..";

// hooks and function
import {
  useUserLoginMutation,
  // useVerifyRegistrationMutation,
} from "@/features/auth/authApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";

// icons
import { letter, password } from "@/assets/icons/svgIcons";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { handleSubmit, register } = useForm();

  const [rememberMe, setRememberMe] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [userLogin, { isLoading: loginLoading }] = useUserLoginMutation();
  // const [verifyRegistration, { isLoading: verifyLoading }] =
  //   useVerifyRegistrationMutation();

  // Handle successful authentication
  const handleAuthSuccess = (accessToken, refreshToken) => {
    dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
    toast.success("You are Successfully Logged In.");
    navigate("/");
  };

  const onSubmit = async (data) => {
    try {
      if (token && email && email === data?.email) {
        // const verifyRes = await verifyRegistration({ token, email });

        // if (!verifyRes?.data?.success) {
        //   toast.error(verifyRes?.data?.error || "Verification Failed!");
        //   return;
        // }

        const loginRes = await userLogin(data);

        if (loginRes?.data?.success) {
          handleAuthSuccess(
            loginRes.data?.data?.accessToken,
            loginRes.data?.data?.refreshToken
          );
        } else {
          toast.error(loginRes?.error?.data?.message || "Login Failed!");
        }
      } else {
        const loginRes = await userLogin(data);

        if (loginRes?.data?.success) {
          handleAuthSuccess(
            loginRes.data?.data?.accessToken,
            loginRes.data?.data?.refreshToken
          );
        } else {
          toast.error(loginRes?.error?.data?.message || "Login Failed!");
        }
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const isLoading = loginLoading;
  //  || verifyLoading;

  return (
    <AuthPage>
      <>
        <p className="text-sm text-center text-black/40 dark:text-white/50">
          Login
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
            defaultValue={email || ""}
            disabled={isLoading}
          />
          <TextField
            placeholder="Type your Password"
            register={register}
            name="password"
            type="password"
            icon={password}
            disabled={isLoading}
          />
          <div className="flbx">
            <Checkbox
              name="rememberMe"
              value={rememberMe}
              setValue={setRememberMe}
            >
              <span className="dark:text-white text-primary">Remember Me</span>
            </Checkbox>
            <Link
              to="/forgot-password"
              className="text-sm dark:text-white/75 text-black/70 hover:text-secondary tr"
            >
              Forgot Password?
            </Link>
          </div>

          <SubmitButton
            isLoading={isLoading}
            disabled={isLoading}
            className="mt-4"
          >
            {isLoading ? "Logging In..." : "Login"}
          </SubmitButton>
        </form>
        <p className="mt-8 text-sm text-center text-black/50 dark:text-white/50">
          New? Create{" "}
          <Link to="/register" className="text-primary">
            A New Account
          </Link>
        </p>
      </>
    </AuthPage>
  );
};

export default LoginPage;
