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
import { letter, password } from "@/assets/icons/svgIcons";

const SLIDER_DATA = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
    title: "Real-time Analytics",
    text: "Monitor your business performance with advanced real-time dashboards and insights.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2532&auto=format&fit=crop",
    title: "Inventory Management",
    text: "Track stock levels, manage orders, and optimize your supply chain efficiently.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
    title: "Financial Reports",
    text: "Generate comprehensive financial reports and gain clarity on your revenue streams.",
  },
];

const AdminLoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleSubmit, register } = useForm();
  const [rememberMe, setRememberMe] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [loginSystemuser, { isLoading: loginLoading }] =
    useLoginSystemuserMutation();
  const [superadminLogin, { isLoading: superadminLoading }] =
    useSuperadminLoginMutation();

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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

        console.log("payload", payload.role);

        if (payload.role === "SUPER_ADMIN") {
          // Save superadmin auth state & tokens so SuperAdminPrivateRoute works
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
      toast.error(
        error?.data?.message || t("auth.loginFailedGeneric"),
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-slate-950 overflow-hidden font-sans">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 relative flex flex-col justify-center items-center p-8 sm:p-12 lg:p-20 z-10">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ThemeToggle variant="compact" />
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t("auth.adminWelcomeBack")}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              {t("auth.adminSubtitle")}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="space-y-5">
              <TextField
                label={t("auth.emailOrUsername")}
                placeholder={t("auth.emailPlaceholder")}
                register={register}
                name="email"
                icon={letter}
                disabled={isLoading}
                className="bg-slate-50 dark:bg-slate-900/50"
              />
              <TextField
                label={t("auth.passwordLabel")}
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                register={register}
                name="password"
                icon={password}
                disabled={isLoading}
                className="bg-slate-50 dark:bg-slate-900/50"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Checkbox
                name="rememberMe"
                value={rememberMe}
                setValue={setRememberMe}
              >
                <span className="ml-2 font-medium text-slate-700 dark:text-slate-300">
                  {t("auth.rememberMe")}
                </span>
              </Checkbox>
              <a
                href="/forgot-password"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline transition-all"
              >
                {t("auth.forgotPassword")}
              </a>
            </div>

            <SubmitButton
              isLoading={isLoading}
              className="w-full h-12 text-lg font-semibold shadow-lg shadow-indigo-500/20 rounded-xl hover:scale-[1.02] transition-transform active:scale-[0.98]"
            >
              {isLoading ? t("auth.signingIn") : t("auth.signIn")}
            </SubmitButton>
          </motion.form>
        </div>
        
        {/* Footer */}
        <div className="absolute bottom-8 text-center text-xs text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} SquadCart. {t("auth.yearlyCopyright")}
        </div>
      </div>

      {/* Right Side - Slider */}
      <div className="hidden lg:block w-1/2 relative bg-slate-900 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={SLIDER_DATA[currentSlide].image}
              alt="Slider"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 w-full p-20 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                {SLIDER_DATA[currentSlide].title}
              </h2>
              <p className="text-lg text-slate-300 max-w-lg leading-relaxed drop-shadow-md">
                {SLIDER_DATA[currentSlide].text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="flex gap-3 mt-10">
            {SLIDER_DATA.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx
                    ? "w-8 bg-indigo-500"
                    : "w-2 bg-slate-600 hover:bg-slate-500"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;