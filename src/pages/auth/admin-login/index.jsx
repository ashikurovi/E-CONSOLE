import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import AuthPage from "@/pages/auth";

// hooks and function
import { useLoginSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

// icons
import { letter, password } from "@/assets/icons/svgIcons";
import PasswordField from "@/components/input/PasswordField";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSubmit, register, setValue } = useForm();
  const [rememberMe, setRememberMe] = useState(false);
  const [loginSystemuser, { isLoading: loginLoading }] =
    useLoginSystemuserMutation();
  const [superadminLogin, { isLoading: superadminLoading }] =
    useSuperadminLoginMutation();

  const handleFillCredentials = () => {
    setValue("email", "ashikurovi23@gmail.com");
    setValue("password", "123456");
    toast.success("Credentials Auto-filled", {
      icon: "✨",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const isLoading = loginLoading || superadminLoading;

  const onSubmit = async (data) => {
    try {
      const loginCredential = data.email || data.name;

      // Debug: Log the form data to verify password is captured
      console.log("Form data:", data);
      console.log("Password value:", data.password);

      // Ensure password is included
      if (!data.password) {
        toast.error("Password is required!");
        return;
      }

      // 1st: Try systemuser login (uses email)
      const loginRes = await loginSystemuser({
        email: loginCredential,
        password: data.password,
      });

      // Check if there's an error (like 404) - if so, proceed directly to superadmin login
      if (loginRes?.error) {
        console.log(
          "Systemuser login error (404 or other), proceeding to superadmin login...",
        );
        // Proceed directly to superadmin login below
      } else if (loginRes?.data) {
        // Handle successful systemuser login
        const responseData = loginRes.data;
        const accessToken =
          responseData?.accessToken || responseData?.data?.accessToken;
        const refreshToken =
          responseData?.refreshToken || responseData?.data?.refreshToken;

        if (accessToken) {
          // Decode token to check role
          const { payload } = decodeJWT(accessToken);
          const userRole = payload.role || responseData?.user?.role;

          // Allow SYSTEM_OWNER and EMPLOYEE roles
          if (userRole === "SYSTEM_OWNER" || userRole === "EMPLOYEE") {
            dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
            toast.success("Admin Login Successful!");
            navigate("/");
            return;
          }
        }
      }

      // 2nd: Try superadmin login (uses email) - proceed if systemuser login failed (404, error, or invalid role)
      console.log("Trying superadmin login...");

      try {
        const superadminResult = await superadminLogin({
          email: loginCredential,
          password: data.password,
        }).unwrap();

        console.log("Superadmin login response:", superadminResult);

        // Extract tokens from response - handle both direct response and wrapped response
        // Backend returns { accessToken, refreshToken, user } directly
        // RTK Query's unwrap() should return the response body directly
        let accessToken = null;
        let refreshToken = null;
        let user = null;

        // Try direct access first (most common case)
        if (superadminResult?.accessToken) {
          accessToken = superadminResult.accessToken;
          refreshToken = superadminResult.refreshToken || null;
          user = superadminResult.user || null;
        }
        // Fallback: check if wrapped in data property
        else if (superadminResult?.data?.accessToken) {
          accessToken = superadminResult.data.accessToken;
          refreshToken = superadminResult.data.refreshToken || null;
          user = superadminResult.data.user || null;
        }
        // Fallback: check if it's the response itself
        else if (
          typeof superadminResult === "string" &&
          superadminResult.length > 100
        ) {
          // If the entire response is a string, it might be the token itself (unlikely but handle it)
          accessToken = superadminResult;
        }

        console.log(
          "Extracted accessToken:",
          !!accessToken,
          accessToken ? accessToken.substring(0, 20) + "..." : "null",
        );
        console.log("Extracted refreshToken:", !!refreshToken);
        console.log("Extracted user:", !!user);

        if (
          accessToken &&
          typeof accessToken === "string" &&
          accessToken.length > 10
        ) {
          console.log("Superadmin accessToken found, saving to storage...");

          // Decode token to verify it's valid
          try {
            const { payload } = decodeJWT(accessToken);
            const userRole = payload.role || user?.role;
            console.log("Superadmin login successful - Role:", userRole);
            console.log(
              "Superadmin login - AccessToken (first 20 chars):",
              accessToken.substring(0, 20) + "...",
            );
          } catch (decodeError) {
            console.error("Error decoding token:", decodeError);
            toast.error("Login failed: Invalid token received.");
            return;
          }

          // Dispatch action to save tokens - this will save to sessionStorage
          dispatch(
            superadminLoggedIn({
              accessToken: accessToken,
              refreshToken: refreshToken || null,
              user: user || null,
            }),
          );

          // Verify tokens were saved immediately
          const savedToken = sessionStorage.getItem("superadmin_accessToken");
          console.log("Token saved to sessionStorage:", !!savedToken);

          if (!savedToken) {
            console.error(
              "ERROR: Token was not saved to sessionStorage! Attempting manual save...",
            );
            // Manual fallback save
            sessionStorage.setItem("superadmin_accessToken", accessToken);
            if (refreshToken) {
              sessionStorage.setItem("superadmin_refreshToken", refreshToken);
            }
            // Verify again
            const retryToken = sessionStorage.getItem("superadmin_accessToken");
            if (!retryToken) {
              console.error("CRITICAL: Manual token save also failed!");
              toast.error("Login failed: Could not save authentication token.");
              return;
            }
          }

          toast.success("Super Admin Login Successful!");
          navigate("/superadmin");
          return;
        } else {
          console.error(
            "Superadmin login - No valid accessToken in response:",
            superadminResult,
          );
          console.error(
            "Response structure:",
            JSON.stringify(superadminResult, null, 2),
          );
          toast.error("Login failed: No access token received.");
        }
      } catch (superadminError) {
        // Both logins failed
        console.error("Superadmin login error:", superadminError);
        let errorMessage = "Invalid email or password!";

        if (superadminError?.data?.message) {
          errorMessage = superadminError.data.message;
        } else if (superadminError?.message) {
          errorMessage = superadminError.message;
        } else if (superadminError?.error?.data?.message) {
          errorMessage = superadminError.error.data.message;
        } else if (superadminError?.error?.message) {
          errorMessage = superadminError.error.message;
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Invalid credentials!";

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error?.data?.message) {
        errorMessage = error.error.data.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      }

      toast.error(errorMessage);
    }
  };

  return (
    <AuthPage
      title="Admin Login"
      subtitle="Sign in to access your admin dashboard"
    >
      <>
        {/* Quick Fill Button */}
        <div className="absolute top-6 right-6 sm:top-8 sm:right-8 z-20">
          <button
            type="button"
            onClick={handleFillCredentials}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 ring-2 ring-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Fill Now
          </button>
        </div>

        {/* Enhanced Header */}
        <div className="text-center mb-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <p className="text-sm text-gray-500 dark:text-white/60">
            Enter your admin credentials to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="space-y-4">
            <TextField
              placeholder="Your Email or Name"
              type="text"
              register={register}
              name="email"
              icon={letter}
              disabled={isLoading}
              required
            />
            <PasswordField
              placeholder="Type your Password"
              register={register}
              name="password"
              type="password"
              icon={password}
              disabled={isLoading}
              required
              registerOptions={{
                required: "Password is required",
                minLength: {
                  value: 1,
                  message: "Password cannot be empty",
                },
              }}
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Logging In...
                </span>
              ) : (
                "Login to Admin Dashboard"
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

export default AdminLoginPage;
