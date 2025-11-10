import React from "react";
import { FooterLogo } from "@/components/logo/nav-logo";

const AuthPage = ({ children, title = "Welcome Back!", subtitle = "" }) => {
  return (
    <div className="min-h-screen w-screen center dark:bg-black/90 bg-gray-100 p-10">
      <div className="card p-10">
        <div className="max-w-[480px] w-full mx-auto">
          <FooterLogo />
          <h2 className="text-2xl mt-3 dark:text-white">{title}</h2>
          <p className="text-sm text-black/40 dark:text-white/50 mb-8 mt-2">
            {subtitle}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
