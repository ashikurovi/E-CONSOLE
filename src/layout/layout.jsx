import Footer from "@/components/footer/footer";
import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <main className="w-screen min-h-screen dark:bg-black/90 bg-gray-100 dark:text-white/75 text-black/75 lg:pb-6 pb-2">
      <div className="w-full lg:pt-4 lg:px-10">
        <TopNavbar />
        <div className="lg:px-0 px-2">
          <Outlet />
          <Footer />
        </div>
      </div>
    </main>
  );
};

export default Layout;
