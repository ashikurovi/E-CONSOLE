import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      toast.error(t("auth.loginAccessTokenMissing"));
      return;
    }

    dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
    toast.success(t("auth.loginSuccess"));
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
        toast.error(t("auth.loginAccessTokenMissing"));
        return;
      }

      // User data will be fetched from /auth/me API instead of storing here
      handleAuthSuccess(accessToken, refreshToken);
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error?.data?.message ||
          error?.message ||
          t("auth.loginFailedTryAgain")
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
            {t("auth.loginHeaderSubtitle")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-4">
            <TextField
              placeholder={t("auth.emailPlaceholderSimple")}
              type="email"
              register={register}
              name="email"
              icon={letter}
              disabled={isLoading}
            />
            <TextField
              placeholder={t("auth.passwordPlaceholderSimple")}
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
                {t("auth.rememberMeSimple")}
              </span>
            </Checkbox>
            <Link
              to="/forgot-password"
              className="text-sm text-primary dark:text-secondary hover:underline transition-all duration-200 font-medium"
            >
              {t("auth.forgotPasswordSimple")}
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
                  {t("auth.loggingIn")}
                </span>
              ) : (
                t("auth.loginToDashboard")
              )}
            </span>
          </SubmitButton>
        </form>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-white/50">
            {t("auth.protectedBySecurity")}
          </p>
        </div>
      </>
    </AuthPage>
  );
};

export default LoginPage;