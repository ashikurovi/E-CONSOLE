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
  useLoginSystemuserMutation,
  // other systemuser mutations if needed
} from "@/features/systemuser/systemuserApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";

// icons
import { letter, password } from "@/assets/icons/svgIcons";

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const { handleSubmit, register } = useForm({
    defaultValues: {
      email: email || "",
      password: "",
    },
  });

  const [rememberMe, setRememberMe] = useState(false);

  const [loginSystemuser, { isLoading: loginLoading }] =
    useLoginSystemuserMutation();
  // const [verifyRegistration, { isLoading: verifyLoading }] =
  //   useVerifyRegistrationMutation();

  // Handle successful authentication
  const handleAuthSuccess = (accessToken, refreshToken) => {
    if (!accessToken) {
      toast.error("Login failed: Access token is missing.");
      return;
    }

    dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
    toast.success("You are Successfully Logged In.");
    navigate("/");
  };

  const onSubmit = async (data) => {
    console.log("Form data being submitted:", data);
    try {
      // Use unwrap() so failed requests throw and land in catch()
      const responseData = await loginSystemuser(data).unwrap();

      // Backend returns { accessToken, refreshToken, user }
      // Some endpoints may wrap as { data: {...} }, so support both.
      const accessToken =
        responseData?.accessToken || responseData?.data?.accessToken;
      const refreshToken =
        responseData?.refreshToken || responseData?.data?.refreshToken;

      if (!accessToken) {
        toast.error("Login failed: Access token is missing.");
        return;
      }

      // User data will be fetched from /auth/me API instead of storing here
      handleAuthSuccess(accessToken, refreshToken);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          "Login Failed! Please try again."
      );
    }
  };

  const isLoading = loginLoading;
  //  || verifyLoading;

  return (
    <AuthPage>
      <>
        {/* Enhanced Header */}
        <div className="text-center mb-8">
    
          <p className="text-sm text-gray-500 dark:text-white/60">
            Sign in to access your admin dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-4">
            <TextField
              placeholder="Your Email Address"
              type="email"
              register={register}
              name="email"
              icon={letter}
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
          </div>

          <div className="flex items-center justify-between">
            <Checkbox
              name="rememberMe"
              value={rememberMe}
              setValue={setRememberMe}
            >
              <span className="dark:text-white text-gray-700 text-sm font-medium">
                Remember Me
              </span>
            </Checkbox>
            <Link
              to="/forgot-password"
              className="text-sm text-primary dark:text-secondary hover:underline transition-all duration-200 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <SubmitButton
            isLoading={isLoading}
            disabled={isLoading}
            className="mt-2 relative overflow-hidden group"
          >
            <span className="relative z-10">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging In...
                </span>
              ) : (
                "Login to Dashboard"
              )}
            </span>
          </SubmitButton>
        </form>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-white/50">
            Protected by enterprise-grade security
          </p>
        </div>
      </>
    </AuthPage>
  );
};

export default LoginPage;
