import Footer from "@/components/footer/footer";
import TopNavbar from "@/components/navbar/TopNavbar";
import React from "react";
import { Outlet } from "react-router-dom";
import SideNav from "@/components/navbar/SideNav";

const Layout = () => {
    return (
        <main className="w-screen min-h-screen dark:bg-black/90 bg-gray-100 dark:text-white/75 text-black/75 ">
            <div className="w-full ">
                 
                <div className="lg:px-0 px-2">
                    {/* Desktop layout with persistent sidebar and content area */}
                    <div className="lg:grid lg:grid-cols-[260px_1fr] ">
                        <div className="lg:block hidden">
                <SideNav />
             
              </div>
              
           
              <div>
                  <div className="lg:sticky top-0 z-10">
                   <TopNavbar />
              </div>
                <div className="px-3 pb-5">
                    <Outlet />
                          </div>
                  
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Layout;
