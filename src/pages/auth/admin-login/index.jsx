import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// components
import SubmitButton from "@/components/buttons/SubmitButton";
import TextField from "@/components/input/TextField";
import Checkbox from "@/components/input/Checkbox";
import ThemeToggle from "@/components/theme/ThemeToggle";

// hooks and function
import { useLoginSystemuserMutation } from "@/features/systemuser/systemuserApiSlice";
import { useSuperadminLoginMutation } from "@/features/superadminAuth/superadminAuthApiSlice";
import { userLoggedIn } from "@/features/auth/authSlice";
import { superadminLoggedIn } from "@/features/superadminAuth/superadminAuthSlice";
import { decodeJWT } from "@/utils/jwt-decoder";

// icons
import { letter, password, bolt } from "@/assets/icons/svgIcons";

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z"
      fill="#4285F4"
    />
    <path
      d="M12.2401 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.2401 24.0008Z"
      fill="#34A853"
    />
    <path
      d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.51649C-0.18551 10.0056 -0.18551 14.0004 1.51649 17.3912L5.50253 14.3003Z"
      fill="#FBBC05"
    />
    <path
      d="M12.2401 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.2401 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50264 9.70575C6.45064 6.86173 9.10947 4.74966 12.2401 4.74966Z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
    <path d="M17.05 20.28C15.93 21.93 14.68 23.95 12.75 24C10.95 23.95 10.33 22.91 8.28 22.91C6.18 22.91 5.61 23.9 3.86 24C2.08 24.1 0.69 21.57 0.08 18.52C-0.65 14.86 2.08 9.54 5.86 9.44C7.68 9.39 8.79 10.66 10.9 10.66C13.01 10.66 13.88 9.34 15.89 9.39C16.63 9.42 18.7 9.68 19.98 11.55C19.89 11.61 17.72 12.88 17.75 16.3C17.77 19.06 20.15 20.08 20.24 20.11C20.09 20.57 19.46 22.28 18.46 23.75L17.05 20.28ZM12.03 6.33C12.96 5.21 13.56 3.66 13.38 2.12C12.03 2.18 10.42 3.02 9.47 4.14C8.61 5.14 7.89 6.74 8.08 8.24C9.56 8.35 11.13 7.45 12.03 6.33Z" />
  </svg>
);

const MockDashboard = () => {
  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Dashboard</h3>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"
              />
            ))}
          </div>
          <button className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">
            Add members +
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
          <div className="text-xs text-slate-500 mb-1">Productive Time</div>
          <div className="text-2xl font-bold text-slate-800">12.4 hr</div>
          <div className="text-xs text-green-500 mt-1 flex items-center">
            <span className="bg-green-100 p-0.5 rounded mr-1">↑</span> +23% last
            week
          </div>
        </div>
        <div className="flex-1 bg-slate-50 p-4 rounded-2xl">
          <div className="text-xs text-slate-500 mb-1">Focused Time</div>
          <div className="text-2xl font-bold text-slate-800">8.5 hr</div>
          <div className="text-xs text-red-500 mt-1 flex items-center">
            <span className="bg-red-100 p-0.5 rounded mr-1">↓</span> -18% last
            week
          </div>
        </div>
      </div>

      {/* Team Utilization List */}
      <div className="space-y-4">
        <div className="flex justify-between text-xs text-slate-400 pb-2 border-b border-slate-100">
          <span>Team Name</span>
          <span>Utilization</span>
        </div>
        {[
          {
            name: "Marketing",
            level: "High",
            val: 40,
            color: "bg-orange-100 text-orange-600",
          },
          {
            name: "Customer Success",
            level: "Medium",
            val: 65,
            color: "bg-green-100 text-green-600",
          },
          {
            name: "Dev Team",
            level: "Low",
            val: 25,
            color: "bg-red-100 text-red-600",
          },
        ].map((team, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${team.color}`}
              >
                {team.name[0]}
              </div>
              <span className="font-medium text-slate-700">{team.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${team.color}`}
              >
                {team.level.toUpperCase()}
              </span>
              <span className="text-slate-500 text-xs">{team.val}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Modal Mock */}
      <div className="absolute top-20 right-8 bg-white p-4 rounded-2xl shadow-xl w-64 border border-slate-100 transform rotate-[-5deg] animate-float">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-sm">Add Member</span>
          <span className="text-slate-400 text-xs">✕</span>
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-slate-50 rounded-lg w-full border border-slate-200"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-indigo-600 rounded-lg flex-1"></div>
            <div className="h-8 bg-slate-100 rounded-lg w-8"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSubmit, register } = useForm();
  const [rememberMe, setRememberMe] = useState(false);

  const [loginSystemuser, { isLoading: loginLoading }] =
    useLoginSystemuserMutation();
  const [superadminLogin, { isLoading: superadminLoading }] =
    useSuperadminLoginMutation();

  const isLoading = loginLoading || superadminLoading;

  const onSubmit = async (data) => {
    try {
      const loginCredential = data.email || data.name;

      if (!data.password) {
        toast.error(t("auth.passwordRequired"));
        return;
      }

      // 1st: Try systemuser login (uses email)
      const loginRes = await loginSystemuser({
        email: loginCredential,
        password: data.password,
      });

      if (loginRes?.data) {
        const responseData = loginRes.data;
        const accessToken =
          responseData?.accessToken || responseData?.data?.accessToken;
        const refreshToken =
          responseData?.refreshToken || responseData?.data?.refreshToken;

        if (accessToken) {
          const { payload } = decodeJWT(accessToken);
          const userRole = payload.role || responseData?.user?.role;

          if (userRole === "SYSTEM_OWNER" || userRole === "EMPLOYEE") {
            dispatch(userLoggedIn({ accessToken, refreshToken, rememberMe }));
            toast.success(t("auth.adminLoginSuccess"));
            navigate("/");
            return;
          }
        }
      }

      // 2nd: Try superadmin login if systemuser failed
      const superadminResult = await superadminLogin({
        email: loginCredential,
        password: data.password,
      }).unwrap();

      let accessToken = null;
      let refreshToken = null;
      let user = null;

      if (superadminResult?.accessToken) {
        accessToken = superadminResult.accessToken;
        refreshToken = superadminResult.refreshToken || null;
        user = superadminResult.user || null;
      }

      if (accessToken) {
        const { payload } = decodeJWT(accessToken);

        if (payload.role === "SUPER_ADMIN") {
          // Save superadmin auth state & tokens
          dispatch(
            superadminLoggedIn({
              accessToken,
              refreshToken,
              user,
            }),
          );
          toast.success(t("auth.superadminLoginSuccess"));
          navigate("/superadmin");
          return;
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error?.data?.message || t("auth.loginFailedGeneric"));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1400px] min-h-[800px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col relative z-10">
          {/* Logo */}
          <div className="mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              {bolt}
            </div>
          </div>

          <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 mb-8"
            >
              <h1 className="text-3xl font-bold text-slate-900">
                Get Started Now
              </h1>
              <p className="text-slate-500">
                Enter your credentials to access your account
              </p>
            </motion.div>

            {/* Social Login Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm"
              >
                <GoogleIcon />
                Log in with Google
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 h-12 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium text-slate-700 text-sm"
              >
                <AppleIcon />
                Log in with Apple
              </button>
            </div>

            <div className="relative flex items-center gap-4 mb-8">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-slate-400 text-sm">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <TextField
                label={t("auth.emailOrUsername")}
                placeholder="rafiqur@company.com"
                register={register}
                name="email"
                // icon={letter} // Using standard design from image which is cleaner
                disabled={isLoading}
                inputClassName="bg-white border-slate-200 focus:border-indigo-500 rounded-xl h-12"
              />

              <div className="space-y-1">
                <TextField
                  label={t("auth.passwordLabel")}
                  type="password"
                  placeholder="min 8 chars"
                  register={register}
                  name="password"
                  // icon={password}
                  disabled={isLoading}
                  inputClassName="bg-white border-slate-200 focus:border-indigo-500 rounded-xl h-12"
                />
                <div className="flex justify-end">
                  <a
                    href="/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 mt-1"
                  >
                    {t("auth.forgotPassword")}
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  name="rememberMe"
                  value={rememberMe}
                  setValue={setRememberMe}
                >
                  <span className="ml-2 text-sm text-slate-600">
                    I agree to the{" "}
                    <span className="font-medium text-slate-900 underline">
                      Terms & Privacy
                    </span>
                  </span>
                </Checkbox>
              </div>

              <SubmitButton
                isLoading={isLoading}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all mt-4"
              >
                {isLoading ? t("auth.signingIn") : "Login"}
              </SubmitButton>
            </motion.form>

            <div className="mt-8 text-center text-sm text-slate-500">
              Have an account?{" "}
              <a
                href="#"
                className="font-medium text-indigo-600 hover:underline"
              >
                Sign in
              </a>
            </div>
          </div>

          <div className="mt-auto pt-10 text-xs text-slate-400">
            © {new Date().getFullYear()} Acme, All right Reserved
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex w-1/2 bg-[#3B82F6] relative flex-col items-center justify-center p-12 overflow-hidden">
          <div className="max-w-lg w-full relative z-10">
            <div className="text-white mb-10 space-y-4 text-center">
              <h2 className="text-3xl font-bold leading-tight">
                The simplest way to manage your workforce
              </h2>
              <p className="text-blue-100 text-lg">
                Enter your credentials to access your account
              </p>
            </div>

            <div className="relative">
              <MockDashboard />
            </div>

            <div className="mt-12 flex justify-center gap-6 opacity-70 grayscale">
              <span className="text-white font-bold text-lg">WeChat</span>
              <span className="text-white font-bold text-lg">Booking.com</span>
              <span className="text-white font-bold text-lg">Google</span>
              <span className="text-white font-bold text-lg">Spotify</span>
              <span className="text-white font-bold text-lg">stripe</span>
            </div>
          </div>

          {/* Background Decorations */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
