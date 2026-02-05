import React from "react";
import { FooterLogo } from "@/components/logo/nav-logo";
import ThemeToggle from "@/components/theme/ThemeToggle";

const AuthPage = ({ children, title = "Welcome Back!", subtitle = "" }) => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-900 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-10">
      {/* Theme Toggle - top right */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="compact" />
      </div>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Main Card */}
      <div className="relative w-full max-w-[520px] mx-auto">
        <div className="card p-8 sm:p-12 shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl transition-all duration-300 hover:shadow-3xl">
          <div className="w-full mx-auto">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="transform transition-transform duration-300 hover:scale-105">
                <FooterLogo />
              </div>
            </div>

            {/* Title and Subtitle (only shown if provided) */}
            {title && (
              <h2 className="text-2xl font-bold text-center dark:text-white text-gray-800 mt-3">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-center text-black/40 dark:text-white/50 mb-8 mt-2">
                {subtitle}
              </p>
            )}

            {/* Content */}
            <div className="mt-6">{children}</div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="absolute -z-10 bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent"></div>
      </div>
    </div>
  );
};

export default AuthPage;